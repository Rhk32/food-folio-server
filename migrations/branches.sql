create table public.branches (
  id uuid not null default gen_random_uuid (),
  restaurant_id uuid not null,
  branch_name text not null,
  address text not null,
  city text not null,
  coordinates geography null,
  google_maps_url text not null,
  constraint branches_pkey primary key (id),
  constraint branches_restaurant_id_fkey foreign KEY (restaurant_id) references restaurants (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;