create table public.comment (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  user_id uuid not null,
  review_id uuid not null,
  content text not null,
  constraint comment_pkey primary key (id),
  constraint comment_review_id_fkey foreign KEY (review_id) references review (id) on update CASCADE on delete CASCADE,
  constraint comment_user_id_fkey foreign KEY (user_id) references users (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;