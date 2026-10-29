-- ZION — 0001 core: identidad, roles, ubicaciones, settings
-- Dinero SIEMPRE en centavos (bigint). Moneda: USD.

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ---------- enums ----------
do $$ begin
  create type user_role as enum ('customer','staff','admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type location_type as enum ('warehouse','store');
exception when duplicate_object then null; end $$;

-- ---------- profiles (1:1 auth.users) ----------
create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  email         text,
  phone         text,
  role          user_role not null default 'customer',
  store_id      uuid,                     -- solo para staff (FK a locations, se añade abajo)
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------- locations (bodega principal + tiendas) ----------
create table if not exists locations (
  id          uuid primary key default gen_random_uuid(),
  type        location_type not null,
  name        text not null,
  short_name  text,
  city        text,
  address     text,
  is_active   boolean not null default true,
  position    int not null default 0,
  created_at  timestamptz not null default now()
);

alter table profiles
  drop constraint if exists profiles_store_fk,
  add constraint profiles_store_fk foreign key (store_id) references locations(id) on delete set null;

-- ---------- settings (clave/valor) ----------
create table if not exists settings (
  key         text primary key,
  value_json  jsonb not null,
  updated_by  uuid references profiles(id),
  updated_at  timestamptz not null default now()
);

insert into settings(key, value_json) values
  ('tax_rate_percent','15'::jsonb),
  ('prices_include_tax','true'::jsonb),
  ('store_live','false'::jsonb),
  ('bank_transfer_details','{"bank":"","account_type":"","account_number":"","holder":"","id":"","email":""}'::jsonb)
on conflict (key) do nothing;

-- ---------- audit log ----------
create table if not exists audit_log (
  id         uuid primary key default gen_random_uuid(),
  actor_id   uuid references profiles(id),
  action     text not null,
  entity     text not null,
  entity_id  text,
  diff_json  jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_log_entity_idx on audit_log(entity, entity_id);

-- ---------- helpers de rol ----------
create or replace function auth_role() returns user_role
language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid()
$$;

create or replace function is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(auth_role() in ('staff','admin'), false)
$$;

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(auth_role() = 'admin', false)
$$;

-- ---------- trigger: crear profile al registrarse ----------
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles(id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------- RLS ----------
alter table profiles  enable row level security;
alter table locations enable row level security;
alter table settings  enable row level security;
alter table audit_log enable row level security;

drop policy if exists "own profile read"  on profiles;
drop policy if exists "own profile write" on profiles;
drop policy if exists "staff read profiles" on profiles;
drop policy if exists "admin manage profiles" on profiles;
create policy "own profile read"  on profiles for select using (id = auth.uid());
create policy "own profile write" on profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "staff read profiles" on profiles for select using (is_staff());
create policy "admin manage profiles" on profiles for all using (is_admin()) with check (is_admin());

drop policy if exists "locations read staff" on locations;
drop policy if exists "locations manage admin" on locations;
create policy "locations read staff" on locations for select using (is_staff());
create policy "locations manage admin" on locations for all using (is_admin()) with check (is_admin());

drop policy if exists "settings read" on settings;
drop policy if exists "settings write admin" on settings;
create policy "settings read" on settings for select using (true);
create policy "settings write admin" on settings for all using (is_admin()) with check (is_admin());

drop policy if exists "audit read staff" on audit_log;
drop policy if exists "audit insert staff" on audit_log;
create policy "audit read staff" on audit_log for select using (is_staff());
create policy "audit insert staff" on audit_log for insert with check (is_staff());

-- ---------- semilla de ubicaciones ----------
insert into locations(type, name, short_name, city, position) values
  ('warehouse','Bodega Principal · Quito','Bodega Quito','Quito',0)
on conflict do nothing;
