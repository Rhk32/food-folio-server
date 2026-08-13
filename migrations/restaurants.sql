create table public.restaurants (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  name text not null,
  logo_url text null default 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0'::text,
  description text null default ''::text,
  visits bigint not null default '0'::bigint,
  is_approved boolean not null default false,
  constraint restaurants_pkey primary key (id)
) TABLESPACE pg_default;