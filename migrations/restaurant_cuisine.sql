create table public.restaurant_cuisine (
  restaurant_id uuid not null default gen_random_uuid (),
  cuisine_id uuid not null default gen_random_uuid (),
  constraint restaurant_cuisine_pkey primary key (restaurant_id, cuisine_id),
  constraint restaurant_cuisine_cuisine_id_fkey foreign KEY (cuisine_id) references cuisine (id) on update CASCADE on delete set null,
  constraint restaurant_cuisine_restaurant_id_fkey foreign KEY (restaurant_id) references restaurants (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;