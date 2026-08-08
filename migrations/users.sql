create table public.users (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  name text not null default ''::text,
  email text not null default ''::text,
  profile_picture_url text null,
  current_city text null,
  current_country text null,
  location geography null,
  password text not null,
  role text not null default 'user'::text,
  constraint users_pkey1 primary key (id),
  constraint users_email_key unique (email)
) TABLESPACE pg_default;