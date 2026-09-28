UPDATE review
SET content = 'No caption provided.'
WHERE content IS NULL OR BTRIM(content) = '';

DELETE FROM vouch older
USING vouch newer
WHERE older.user_id = newer.user_id
  AND older.review_id = newer.review_id
  AND (
    older.created_at < newer.created_at
    OR (older.created_at = newer.created_at AND older.id < newer.id)
  );

UPDATE review r
SET vouch_count = counts.value
FROM (
  SELECT r2.id, COUNT(v.id)::bigint AS value
  FROM review r2
  LEFT JOIN vouch v ON v.review_id = r2.id
  GROUP BY r2.id
) counts
WHERE counts.id = r.id;

ALTER TABLE review ALTER COLUMN vouch_count SET DEFAULT 0;
ALTER TABLE review ALTER COLUMN vouch_count SET NOT NULL;
ALTER TABLE review ALTER COLUMN content SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'vouch_user_review_key'
  ) THEN
    ALTER TABLE vouch
      ADD CONSTRAINT vouch_user_review_key UNIQUE (user_id, review_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'review_rating_range'
  ) THEN
    ALTER TABLE review
      ADD CONSTRAINT review_rating_range CHECK (rating BETWEEN 1 AND 5);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'review_content_not_blank'
  ) THEN
    ALTER TABLE review
      ADD CONSTRAINT review_content_not_blank CHECK (LENGTH(BTRIM(content)) > 0);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS review_branch_created_at_idx
  ON review (branch_id, created_at DESC);
CREATE INDEX IF NOT EXISTS review_user_created_at_idx
  ON review (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS comment_review_created_at_idx
  ON comment (review_id, created_at ASC);
CREATE INDEX IF NOT EXISTS gallery_image_review_idx
  ON gallery_image (review_id);
CREATE INDEX IF NOT EXISTS branches_city_idx
  ON branches (LOWER(city));
CREATE INDEX IF NOT EXISTS restaurant_cuisine_cuisine_idx
  ON restaurant_cuisine (cuisine_id, restaurant_id);
