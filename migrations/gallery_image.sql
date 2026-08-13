create table public.gallery_image (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  restaurant_id uuid not null,
  branch_id uuid not null,
  user_id uuid not null,
  review_id uuid null,
  image_url text not null,
  constraint gallery_image_pkey primary key (id),
  constraint gallery_image_branch_id_fkey foreign KEY (branch_id) references branches (id) on update CASCADE on delete CASCADE,
  constraint gallery_image_restaurant_id_fkey foreign KEY (restaurant_id) references restaurants (id) on update CASCADE on delete CASCADE,
  constraint gallery_image_review_id_fkey foreign KEY (review_id) references review (id) on update CASCADE on delete CASCADE,
  constraint gallery_image_user_id_fkey foreign KEY (user_id) references users (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;