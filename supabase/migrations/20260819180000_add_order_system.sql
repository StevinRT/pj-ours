-- Sequence for order numbers (starts at 1001 to distinguish from test data)
create sequence if not exists public.orders_order_number_seq start with 1001;

-- Create orders table for fresh installations
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number integer not null default nextval('public.orders_order_number_seq'),
  source text not null default 'Website',
  customer_name text not null default '',
  customer_phone text not null default '',
  branch text not null,
  order_type text not null,
  table_number text,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(10,2) not null default 0,
  packing_charge numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  payment_method text,
  special_instructions text,
  pickup_time text,
  status text not null default 'active',
  is_read boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- For existing installations: add any missing columns
alter table public.orders add column if not exists order_number integer not null default nextval('public.orders_order_number_seq');
alter table public.orders add column if not exists source text not null default 'Website';
alter table public.orders add column if not exists table_number text;
alter table public.orders add column if not exists payment_method text;
alter table public.orders add column if not exists status text not null default 'active';
alter table public.orders add column if not exists is_read boolean not null default false;

-- updated_at trigger
create or replace function public.set_orders_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_orders_updated_at();

-- RLS
alter table public.orders enable row level security;

drop policy if exists "Anyone can insert orders" on public.orders;
drop policy if exists "Authenticated users can read orders" on public.orders;
drop policy if exists "Authenticated users can update orders" on public.orders;
drop policy if exists "Authenticated users can delete orders" on public.orders;

-- Website customers (anon) and admin can both insert orders
create policy "Anyone can insert orders"
  on public.orders for insert to anon, authenticated
  with check (true);

-- Only authenticated admin can read orders
create policy "Authenticated users can read orders"
  on public.orders for select to authenticated
  using (true);

-- Only authenticated admin can update (mark done, mark read)
create policy "Authenticated users can update orders"
  on public.orders for update to authenticated
  using (true) with check (true);

-- Only authenticated admin can delete
create policy "Authenticated users can delete orders"
  on public.orders for delete to authenticated
  using (true);

-- Enable realtime for live orders (idempotent)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;
end;
$$;
