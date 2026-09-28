BEGIN;

-- Bring existing rows into the state enforced by the triggers below.
UPDATE public.gallery_image AS gallery
SET
  user_id = review.user_id,
  branch_id = review.branch_id,
  restaurant_id = branch.restaurant_id
FROM public.review AS review
INNER JOIN public.branches AS branch ON branch.id = review.branch_id
WHERE gallery.review_id = review.id
  AND (
    gallery.user_id IS DISTINCT FROM review.user_id
    OR gallery.branch_id IS DISTINCT FROM review.branch_id
    OR gallery.restaurant_id IS DISTINCT FROM branch.restaurant_id
  );

DELETE FROM public.follow
WHERE follower_id = following_id;

UPDATE public.review AS review
SET vouch_count = counts.actual_count
FROM (
  SELECT review_row.id, COUNT(vouch.id)::bigint AS actual_count
  FROM public.review AS review_row
  LEFT JOIN public.vouch AS vouch ON vouch.review_id = review_row.id
  GROUP BY review_row.id
) AS counts
WHERE counts.id = review.id
  AND review.vouch_count IS DISTINCT FROM counts.actual_count;

-- Function 1: keep the denormalized vouch count synchronized.
CREATE OR REPLACE FUNCTION public.sync_review_vouch_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.review
    SET vouch_count = vouch_count + 1
    WHERE id = NEW.review_id;

    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    UPDATE public.review
    SET vouch_count = GREATEST(vouch_count - 1, 0)
    WHERE id = OLD.review_id;

    RETURN OLD;
  END IF;

  IF OLD.review_id IS DISTINCT FROM NEW.review_id THEN
    UPDATE public.review
    SET vouch_count = GREATEST(vouch_count - 1, 0)
    WHERE id = OLD.review_id;

    UPDATE public.review
    SET vouch_count = vouch_count + 1
    WHERE id = NEW.review_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Function 2: review gallery rows must agree with their review and branch.
CREATE OR REPLACE FUNCTION public.validate_gallery_review_links()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  expected_user_id uuid;
  expected_branch_id uuid;
  expected_restaurant_id uuid;
BEGIN
  IF NEW.review_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT review.user_id, review.branch_id, branch.restaurant_id
  INTO expected_user_id, expected_branch_id, expected_restaurant_id
  FROM public.review AS review
  INNER JOIN public.branches AS branch ON branch.id = review.branch_id
  WHERE review.id = NEW.review_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Review % does not exist', NEW.review_id
      USING ERRCODE = '23503';
  END IF;

  IF NEW.user_id IS DISTINCT FROM expected_user_id
     OR NEW.branch_id IS DISTINCT FROM expected_branch_id
     OR NEW.restaurant_id IS DISTINCT FROM expected_restaurant_id THEN
    RAISE EXCEPTION 'Gallery image does not match its review ownership and branch'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

-- Function 3: enforce the no-self-follow rule at the database boundary.
CREATE OR REPLACE FUNCTION public.prevent_self_follow()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NEW.follower_id = NEW.following_id THEN
    RAISE EXCEPTION 'A user cannot follow themselves'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS review_vouch_count_sync ON public.vouch;
CREATE TRIGGER review_vouch_count_sync
AFTER INSERT OR UPDATE OR DELETE ON public.vouch
FOR EACH ROW
EXECUTE FUNCTION public.sync_review_vouch_count();

DROP TRIGGER IF EXISTS gallery_review_links_valid ON public.gallery_image;
CREATE TRIGGER gallery_review_links_valid
BEFORE INSERT OR UPDATE ON public.gallery_image
FOR EACH ROW
EXECUTE FUNCTION public.validate_gallery_review_links();

DROP TRIGGER IF EXISTS follow_prevent_self ON public.follow;
CREATE TRIGGER follow_prevent_self
BEFORE INSERT OR UPDATE ON public.follow
FOR EACH ROW
EXECUTE FUNCTION public.prevent_self_follow();

-- Procedure 1: create a review and its images as one database operation.
CREATE OR REPLACE PROCEDURE public.create_review_with_images(
  IN p_user_id uuid,
  IN p_branch_id uuid,
  IN p_rating integer,
  IN p_content text,
  IN p_image_urls text[],
  INOUT p_status text,
  INOUT p_review_id uuid
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  selected_restaurant_id uuid;
BEGIN
  p_status := 'not_found';
  p_review_id := NULL;

  IF p_rating NOT BETWEEN 1 AND 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5'
      USING ERRCODE = '23514';
  END IF;

  IF p_content IS NULL OR BTRIM(p_content) = '' THEN
    RAISE EXCEPTION 'Review content cannot be blank'
      USING ERRCODE = '23514';
  END IF;

  IF COALESCE(CARDINALITY(p_image_urls), 0) = 0
     OR EXISTS (
       SELECT 1
       FROM UNNEST(p_image_urls) AS image_rows(image_url)
       WHERE image_url IS NULL OR BTRIM(image_url) = ''
     ) THEN
    RAISE EXCEPTION 'At least one non-blank image URL is required'
      USING ERRCODE = '23514';
  END IF;

  SELECT branch.restaurant_id
  INTO selected_restaurant_id
  FROM public.branches AS branch
  INNER JOIN public.restaurants AS restaurant ON restaurant.id = branch.restaurant_id
  WHERE branch.id = p_branch_id
    AND restaurant.approval_status = 'approved';

  IF NOT FOUND THEN
    RETURN;
  END IF;

  INSERT INTO public.review (user_id, branch_id, content, rating)
  VALUES (p_user_id, p_branch_id, BTRIM(p_content), p_rating)
  RETURNING id INTO p_review_id;

  INSERT INTO public.gallery_image (
    restaurant_id,
    branch_id,
    user_id,
    review_id,
    image_url
  )
  SELECT
    selected_restaurant_id,
    p_branch_id,
    p_user_id,
    p_review_id,
    BTRIM(image_url)
  FROM UNNEST(p_image_urls) AS image_rows(image_url);

  p_status := 'created';
END;
$$;

-- Procedure 2: serialize vouch toggles for a review and return the new state.
CREATE OR REPLACE PROCEDURE public.toggle_review_vouch(
  IN p_user_id uuid,
  IN p_review_id uuid,
  INOUT p_status text,
  INOUT p_vouched boolean,
  INOUT p_vouch_count bigint
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  removed_vouch_id uuid;
BEGIN
  p_status := 'not_found';
  p_vouched := false;
  p_vouch_count := 0;

  PERFORM review.id
  FROM public.review AS review
  INNER JOIN public.branches AS branch ON branch.id = review.branch_id
  INNER JOIN public.restaurants AS restaurant ON restaurant.id = branch.restaurant_id
  WHERE review.id = p_review_id
    AND restaurant.approval_status = 'approved'
  FOR UPDATE OF review;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  DELETE FROM public.vouch
  WHERE user_id = p_user_id
    AND review_id = p_review_id
  RETURNING id INTO removed_vouch_id;

  IF removed_vouch_id IS NULL THEN
    INSERT INTO public.vouch (user_id, review_id)
    VALUES (p_user_id, p_review_id);
    p_vouched := true;
  END IF;

  SELECT review.vouch_count
  INTO p_vouch_count
  FROM public.review AS review
  WHERE review.id = p_review_id;

  p_status := 'updated';
END;
$$;

-- Procedure 3: authorize and permanently delete a manager's restaurant review.
CREATE OR REPLACE PROCEDURE public.delete_review_as_manager(
  IN p_user_id uuid,
  IN p_review_id uuid,
  INOUT p_status text,
  INOUT p_deleted_review_id uuid
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  p_status := 'not_found';
  p_deleted_review_id := NULL;

  DELETE FROM public.review AS review
  USING public.branches AS branch, public.restaurant_manager AS manager
  WHERE review.id = p_review_id
    AND branch.id = review.branch_id
    AND manager.restaurant_id = branch.restaurant_id
    AND manager.user_id = p_user_id
  RETURNING review.id INTO p_deleted_review_id;

  IF p_deleted_review_id IS NOT NULL THEN
    p_status := 'deleted';
    RETURN;
  END IF;

  IF EXISTS (SELECT 1 FROM public.review WHERE id = p_review_id) THEN
    p_status := 'forbidden';
  END IF;
END;
$$;

-- Keep these routines unavailable through Supabase's public RPC roles.
REVOKE EXECUTE ON FUNCTION public.sync_review_vouch_count() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_gallery_review_links() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_self_follow() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON PROCEDURE public.create_review_with_images(uuid, uuid, integer, text, text[], text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON PROCEDURE public.toggle_review_vouch(uuid, uuid, text, boolean, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON PROCEDURE public.delete_review_as_manager(uuid, uuid, text, uuid) FROM PUBLIC, anon, authenticated;

COMMIT;
