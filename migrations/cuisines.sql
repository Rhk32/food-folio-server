create table public.cuisine (
  id uuid not null default gen_random_uuid (),
  name text not null,
  constraint cuisine_pkey primary key (id)
) TABLESPACE pg_default;