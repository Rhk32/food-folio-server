create table public.vouch (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  review_id uuid not null,
  created_at timestamp with time zone not null default now(),
  constraint vouch_pkey primary key (id),
  constraint vouch_review_id_fkey foreign KEY (review_id) references review (id) on update CASCADE on delete CASCADE,
  constraint vouch_user_id_fkey foreign KEY (user_id) references users (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;