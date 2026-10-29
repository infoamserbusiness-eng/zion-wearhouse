-- ZION — 0002 catálogo e inventario (módulo de trabajo inicial)

do $$ begin
  create type product_status as enum ('draft','active','archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type origin_country as enum ('US','EC');
exception when duplicate_object then null; end $$;

do $$ begin
  create type transfer_status as enum ('draft','in_transit','received_ok','received_variance','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type return_status as enum ('pending','received');
exception when duplicate_object then null; end $$;

do $$ begin
  create type shift_status as enum ('open','closed');
exception when duplicate_object then null; end $$;

-- ---------- categorías y subcategorías ----------
create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  position    int not null default 0,
  nav_visible boolean not null default true,   -- «Menú de la tienda»
  is_active   boolean not null default true
);

create table if not exists subcategories (
  id          uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete cascade,
  slug        text not null,
  name        text not null,
  position    int not null default 0,
  unique (category_id, slug)
);

-- ---------- productos ----------
create table if not exists products (
  id                uuid primary key default gen_random_uuid(),
  sku               text unique,
  slug              text unique,
  name              text not null,
  brand             text,
  description        text,
  category_id       uuid references categories(id) on delete set null,
  subcategory_id    uuid references subcategories(id) on delete set null,
  origin            origin_country not null default 'US',
  base_price_cents  bigint not null default 0 check (base_price_cents >= 0),  -- PVP
  avg_cost_cents    bigint not null default 0 check (avg_cost_cents >= 0),    -- costo promedio ponderado
  commission_pct    numeric(6,2) not null default 0,                         -- markup sobre costo → PVP
  currency          text not null default 'USD',
  status            product_status not null default 'draft',                 -- active = publicado
  published_at      timestamptz,
  weight_grams      int not null default 0,
  created_by        uuid references profiles(id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  search_tsv        tsvector
);
create index if not exists products_category_idx on products(category_id);
create index if not exists products_status_idx on products(status);
create index if not exists products_search_idx on products using gin(search_tsv);
create index if not exists products_name_trgm_idx on products using gin(name gin_trgm_ops);

create table if not exists product_images (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references products(id) on delete cascade,
  storage_path text not null,
  alt          text,
  position     int not null default 0
);
create index if not exists product_images_product_idx on product_images(product_id);

-- opciones (Talla / Color) — solo para prendas de vestir
create table if not exists product_options (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  name       text not null,
  position   int not null default 0
);
create table if not exists product_option_values (
  id        uuid primary key default gen_random_uuid(),
  option_id uuid not null references product_options(id) on delete cascade,
  value     text not null,
  position  int not null default 0
);

create table if not exists product_variants (
  id                 uuid primary key default gen_random_uuid(),
  product_id         uuid not null references products(id) on delete cascade,
  sku                text unique,
  option_values_json jsonb not null default '{}'::jsonb,
  price_cents        bigint check (price_cents >= 0),   -- override opcional del PVP
  barcode            text,
  is_active          boolean not null default true
);
create index if not exists product_variants_product_idx on product_variants(product_id);

-- ---------- inventario por ubicación ----------
create table if not exists inventory (
  location_id uuid not null references locations(id) on delete cascade,
  variant_id  uuid not null references product_variants(id) on delete cascade,
  qty         int not null default 0,
  min_qty     int not null default 6,
  updated_at  timestamptz not null default now(),
  primary key (location_id, variant_id)
);

create table if not exists inventory_movements (
  id           uuid primary key default gen_random_uuid(),
  location_id  uuid not null references locations(id),
  variant_id   uuid not null references product_variants(id),
  delta        int not null,
  reason       text not null,   -- purchase | transfer_in | transfer_out | pos_sale | adjustment | return_in | return_out
  ref          text,
  note         text,
  created_by   uuid references profiles(id),
  created_at   timestamptz not null default now()
);
create index if not exists inv_mov_loc_idx on inventory_movements(location_id, created_at);

-- ---------- compras (ingreso a bodega con costo y PVP) ----------
create table if not exists purchases (
  id              uuid primary key default gen_random_uuid(),
  variant_id      uuid not null references product_variants(id),
  location_id     uuid not null references locations(id),
  qty             int not null check (qty > 0),
  unit_cost_cents bigint not null check (unit_cost_cents >= 0),
  pvp_cents       bigint check (pvp_cents >= 0),
  commission_pct  numeric(6,2),
  supplier_ref    text,
  photo_path      text,
  received_by     uuid references profiles(id),
  received_at     timestamptz not null default now()
);

-- ---------- traspasos bodega → tienda ----------
create table if not exists stock_transfers (
  id                uuid primary key default gen_random_uuid(),
  code              text unique,
  from_location_id  uuid not null references locations(id),
  to_location_id    uuid not null references locations(id),
  status            transfer_status not null default 'in_transit',
  created_by        uuid references profiles(id),
  received_by       uuid references profiles(id),
  sent_at           timestamptz not null default now(),
  received_at       timestamptz,
  variance_count    int not null default 0,
  note              text
);
create table if not exists stock_transfer_lines (
  id                 uuid primary key default gen_random_uuid(),
  transfer_id        uuid not null references stock_transfers(id) on delete cascade,
  variant_id         uuid not null references product_variants(id),
  qty_sent           int not null check (qty_sent >= 0),
  qty_received       int,
  note               text,
  return_to_warehouse boolean not null default false
);

-- ---------- devoluciones tienda → bodega ----------
create table if not exists stock_returns (
  id               uuid primary key default gen_random_uuid(),
  code             text unique,
  from_location_id uuid not null references locations(id),
  ref_transfer_id  uuid references stock_transfers(id),
  status           return_status not null default 'pending',
  created_by       uuid references profiles(id),
  created_at       timestamptz not null default now(),
  received_at      timestamptz
);
create table if not exists stock_return_lines (
  id         uuid primary key default gen_random_uuid(),
  return_id  uuid not null references stock_returns(id) on delete cascade,
  variant_id uuid not null references product_variants(id),
  qty        int not null check (qty > 0),
  note       text
);

-- ---------- clientes (CRM / facturación) ----------
create table if not exists customers (
  id               uuid primary key default gen_random_uuid(),
  full_name        text not null,
  doc              text,
  doc_type         text,               -- CI | RUC | DNI | passport
  email            text,
  phone            text,
  address          text,
  marketing_opt_in boolean not null default false,
  source           text,               -- online | store:<id>
  created_at       timestamptz not null default now(),
  unique (doc)
);

-- ---------- ventas de mostrador (POS) ----------
create table if not exists pos_sales (
  id             uuid primary key default gen_random_uuid(),
  code           text unique,
  location_id    uuid not null references locations(id),
  staff_id       uuid references profiles(id),
  customer_id    uuid references customers(id),
  total_cents    bigint not null default 0,
  payment_method text not null,        -- cash | card | transfer
  invoice_status text not null default 'pending',  -- pending | issued
  invoice_number text,
  sold_at        timestamptz not null default now()
);
create table if not exists pos_sale_lines (
  id               uuid primary key default gen_random_uuid(),
  sale_id          uuid not null references pos_sales(id) on delete cascade,
  variant_id       uuid references product_variants(id),
  qty              int not null check (qty > 0),
  unit_price_cents bigint not null
);

-- ---------- arqueo de caja por turno ----------
create table if not exists cash_shifts (
  id                    uuid primary key default gen_random_uuid(),
  location_id           uuid not null references locations(id),
  staff_id              uuid references profiles(id),
  status                shift_status not null default 'open',
  opening_cents         bigint not null default 0,
  opened_at             timestamptz not null default now(),
  count_cents           bigint,       -- efectivo físico contado al cerrar
  closed_at             timestamptz,
  sales_cash_cents      bigint not null default 0,
  sales_card_cents      bigint not null default 0,
  sales_transfer_cents  bigint not null default 0
);
create index if not exists cash_shifts_loc_idx on cash_shifts(location_id, opened_at);

create table if not exists restock_requests (
  id          uuid primary key default gen_random_uuid(),
  location_id uuid not null references locations(id),
  variant_id  uuid not null references product_variants(id),
  qty         int not null,
  requested_by uuid references profiles(id),
  status      text not null default 'open',   -- open | served | rejected
  created_at  timestamptz not null default now()
);

-- ---------- trigger search_tsv + updated_at ----------
create or replace function products_tsv_refresh() returns trigger
language plpgsql as $$
begin
  new.search_tsv :=
    setweight(to_tsvector('spanish', coalesce(new.name,'')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(new.brand,'')), 'B') ||
    setweight(to_tsvector('spanish', coalesce(new.description,'')), 'C');
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists products_tsv_trg on products;
create trigger products_tsv_trg before insert or update on products
  for each row execute function products_tsv_refresh();

-- ---------- RLS ----------
alter table categories            enable row level security;
alter table subcategories         enable row level security;
alter table products              enable row level security;
alter table product_images        enable row level security;
alter table product_options       enable row level security;
alter table product_option_values enable row level security;
alter table product_variants      enable row level security;
alter table inventory             enable row level security;
alter table inventory_movements   enable row level security;
alter table purchases             enable row level security;
alter table stock_transfers       enable row level security;
alter table stock_transfer_lines  enable row level security;
alter table stock_returns         enable row level security;
alter table stock_return_lines    enable row level security;
alter table customers             enable row level security;
alter table pos_sales             enable row level security;
alter table pos_sale_lines        enable row level security;
alter table cash_shifts           enable row level security;
alter table restock_requests      enable row level security;

-- lectura pública del catálogo activo; escritura solo staff
do $$
declare t text;
begin
  -- catálogo público (solo lectura)
  for t in select unnest(array['categories','subcategories','products','product_images','product_options','product_option_values','product_variants']) loop
    execute format('drop policy if exists "%1$s public read" on %1$s', t);
    execute format('drop policy if exists "%1$s staff write" on %1$s', t);
    execute format('create policy "%1$s public read" on %1$s for select using (true)', t);
    execute format('create policy "%1$s staff write" on %1$s for all using (is_staff()) with check (is_staff())', t);
  end loop;
  -- inventario y operación: solo staff
  for t in select unnest(array['inventory','inventory_movements','purchases','stock_transfers','stock_transfer_lines','stock_returns','stock_return_lines','customers','pos_sales','pos_sale_lines','cash_shifts','restock_requests']) loop
    execute format('drop policy if exists "%1$s staff all" on %1$s', t);
    execute format('create policy "%1$s staff all" on %1$s for all using (is_staff()) with check (is_staff())', t);
  end loop;
end $$;

-- ---------- semilla de categorías + subcategorías (mercado Ecuador) ----------
insert into categories(slug,name,position) values
  ('mujer','Mujer',1),('hombre','Hombre',2),('ninos','Niños',3),
  ('calzado','Calzado',4),('hogar','Hogar',5),('juguetes','Juguetes',6)
on conflict (slug) do nothing;

insert into subcategories(category_id, slug, name, position)
select c.id, s.slug, s.name, s.position
from categories c
join (values
  ('mujer','ropa','Ropa',1),('mujer','vestidos','Vestidos',2),('mujer','abrigos','Abrigos y chaquetas',3),
  ('mujer','jeans','Jeans',4),('mujer','zapatos','Zapatos de mujer',5),('mujer','accesorios','Accesorios',6),
  ('hombre','camisetas','Camisetas',1),('hombre','camisas','Camisas',2),('hombre','jeans','Jeans',3),
  ('hombre','chaquetas','Chaquetas',4),('hombre','zapatos','Zapatos de hombre',5),('hombre','accesorios','Accesorios',6),
  ('ninos','bebe','Bebé (0-24 m)',1),('ninos','nina','Niña',2),('ninos','nino','Niño',3),('ninos','calzado','Calzado infantil',4),
  ('calzado','sneakers','Sneakers',1),('calzado','botas','Botas',2),('calzado','casual','Casual',3),('calzado','deportivo','Deportivo',4),
  ('hogar','cocina','Cocina',1),('hogar','dormitorio','Dormitorio y baño',2),('hogar','decoracion','Decoración',3),('hogar','iluminacion','Iluminación',4),
  ('juguetes','educativos','Educativos',1),('juguetes','peluches','Peluches',2),('juguetes','vehiculos','Vehículos y RC',3),('juguetes','aire-libre','Aire libre',4)
) as s(cat_slug, slug, name, position) on s.cat_slug = c.slug
on conflict (category_id, slug) do nothing;
