-- Collectibles Hub: initial private collection schema
-- Run once in Supabase SQL Editor (or apply via migrations).
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  created_at timestamptz not null default now(),
  unique (id, owner_id)
);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  collection_id uuid,
  category text not null check (category in ('trading_cards', 'gaming', 'electronics')),
  title text not null check (char_length(title) between 1 and 250),
  brand text,
  series text,
  edition text,
  condition text,
  quantity integer not null default 1 check (quantity > 0),
  purchase_price numeric(12,2) check (purchase_price >= 0),
  estimated_unit_value numeric(12,2) check (estimated_unit_value >= 0),
  currency text not null default 'EUR' check (currency = 'EUR'),
  image_path text,
  notes text,
  acquired_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint items_collection_owner_fk foreign key (collection_id, owner_id)
    references public.collections(id, owner_id) on delete set null (collection_id)
);

create table if not exists public.item_valuations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid not null,
  unit_value numeric(12,2) not null check (unit_value >= 0),
  currency text not null default 'EUR' check (currency = 'EUR'),
  source text not null check (source in ('manual', 'external')),
  source_url text,
  recorded_at timestamptz not null default now(),
  constraint valuations_item_owner_fk foreign key (item_id, owner_id)
    references public.items(id, owner_id) on delete cascade
);

-- Needed for composite ownership references.
create unique index if not exists items_id_owner_unique on public.items (id, owner_id);
create index if not exists items_owner_category_idx on public.items(owner_id, category);
create index if not exists valuations_owner_time_idx on public.item_valuations(owner_id, recorded_at desc);
create index if not exists valuations_item_time_idx on public.item_valuations(item_id, recorded_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists items_set_updated_at on public.items;
create trigger items_set_updated_at before update on public.items
for each row execute function public.set_updated_at();

-- Users may only access their own data.
alter table public.profiles enable row level security;
alter table public.collections enable row level security;
alter table public.items enable row level security;
alter table public.item_valuations enable row level security;

create policy "profiles_select_own" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "profiles_update_own" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "collections_select_own" on public.collections for select to authenticated using ((select auth.uid()) = owner_id);
create policy "collections_insert_own" on public.collections for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy "collections_update_own" on public.collections for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "collections_delete_own" on public.collections for delete to authenticated using ((select auth.uid()) = owner_id);

create policy "items_select_own" on public.items for select to authenticated using ((select auth.uid()) = owner_id);
create policy "items_insert_own" on public.items for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy "items_update_own" on public.items for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "items_delete_own" on public.items for delete to authenticated using ((select auth.uid()) = owner_id);

create policy "valuations_select_own" on public.item_valuations for select to authenticated using ((select auth.uid()) = owner_id);
create policy "valuations_insert_own" on public.item_valuations for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy "valuations_update_own" on public.item_valuations for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "valuations_delete_own" on public.item_valuations for delete to authenticated using ((select auth.uid()) = owner_id);

-- No public storage bucket is created: images remain private until signed URL handling is implemented.
