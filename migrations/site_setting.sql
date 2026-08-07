create table public.site_setting (
  id uuid not null default gen_random_uuid (),
  problem text not null,
  contact text not null,
  constraint site_setting_pkey primary key (id)
) TABLESPACE pg_default;