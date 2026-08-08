create table public.review (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  user_id uuid not null,
  branch_id uuid not null,
  content text null default ''::text,
  rating integer not null,
  vouch_count bigint null default '0'::bigint,
  constraint review_pkey primary key (id),
  constraint review_branch_id_fkey foreign KEY (branch_id) references branches (id) on update CASCADE on delete CASCADE,
  constraint review_user_id_fkey foreign KEY (user_id) references users (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;