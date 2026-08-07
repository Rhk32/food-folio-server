create table public.restaurant_manager (
  user_id uuid not null,
  restaurant_id uuid not null,
  constraint restaurant_manager_pkey primary key (user_id, restaurant_id),
  constraint restaurant_manager_restaurant_id_fkey foreign KEY (restaurant_id) references restaurants (id) on update CASCADE on delete CASCADE,
  constraint restaurant_manager_user_id_fkey foreign KEY (user_id) references users (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;