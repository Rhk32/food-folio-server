create table public.follow (
  follower_id uuid not null,
  following_id uuid not null,
  created_at timestamp with time zone not null default now(),
  constraint follow_pkey primary key (follower_id, following_id),
  constraint follow_follower_id_fkey foreign KEY (follower_id) references users (id) on update CASCADE on delete CASCADE,
  constraint follow_following_id_fkey foreign KEY (following_id) references users (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;