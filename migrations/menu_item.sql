create table public.menu_item (
  id uuid not null default gen_random_uuid (),
  branch_id uuid not null,
  name text not null,
  description text null,
  price double precision not null,
  constraint menu_item_pkey primary key (id),
  constraint menu_item_branch_id_fkey foreign KEY (branch_id) references branches (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;