create table public.restaurants (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  name text not null,
  logo_url text null default ''::text,
  description text null default ''::text,
  visits bigint not null default '0'::bigint,
  constraint restaurants_pkey primary key (id)
) TABLESPACE pg_default;