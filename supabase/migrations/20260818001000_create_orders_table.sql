-- Orders table for live order tracking in the admin panel.
-- Customers (anon) can INSERT; admins (authenticated) can SELECT / UPDATE / DELETE.

create table if not exists public.orders (
  id                   uuid         primary key default gen_random_uuid(),
  order_number         bigint       generated always as identity,
  customer_name        text         not null default '',
  customer_phone       text         not null default '',
  branch               text         not null,
  order_type           text         not null check (order_type in ('dine-in', 'parcel')),
  items                jsonb        not null,
  subtotal             numeric(10,2) not null,
  packing_charge       numeric(10,2) not null default 0,
  total                numeric(10,2) not null,
  special_instructions text,
  pickup_time          text,
  status               text         not null default 'new'
                         check (status in ('new', 'preparing', 'ready', 'completed', 'cancelled')),
  is_read              boolean      not null default false,
  created_at           timestamptz  not null default timezone('utc', now()),
  updated_at           timestamptz  not null default timezone('utc', now())
);

create unique index if not exists orders_order_number_idx on public.orders (order_number);
create        index if not exists orders_created_at_idx   on public.orders (created_at desc);
create        index if not exists orders_status_idx       on public.orders (status);

-- Reuse the set_updated_at trigger function created by the products migration.
drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

alter table public.orders enable row level security;

drop policy if exists "Customers can place orders"  on public.orders;
drop policy if exists "Admins can read orders"      on public.orders;
drop policy if exists "Admins can update orders"    on public.orders;
drop policy if exists "Admins can delete orders"    on public.orders;

-- Anon customers may insert their own orders.
create policy "Customers can place orders"
  on public.orders for insert
  to anon, authenticated
  with check (true);

-- Authenticated admins can view all orders.
create policy "Admins can read orders"
  on public.orders for select
  to authenticated
  using (true);

-- Authenticated admins can update status / is_read.
create policy "Admins can update orders"
  on public.orders for update
  to authenticated
  using (true) with check (true);

-- Authenticated admins can delete orders (used by pg_cron cleanup).
create policy "Admins can delete orders"
  on public.orders for delete
  to authenticated
  using (true);

-- Enable Supabase Realtime for the orders table so the admin panel receives
-- live INSERT / UPDATE / DELETE events without polling.
alter publication supabase_realtime add table public.orders;

-- ─── Daily automatic cleanup via pg_cron ────────────────────────────────────
-- PREREQUISITE: Enable the pg_cron extension first in
--   Supabase Dashboard → Database → Extensions → pg_cron
-- Then run the block below once (it is safe to re-run).
--
-- The cron job fires at 18:30 UTC which equals 00:00 IST (Asia/Kolkata).
-- It deletes every order whose created_at falls before the current IST day,
-- leaving today's orders intact.  It never touches products or other tables.
--
-- Uncomment and run manually after enabling pg_cron:
--
-- select cron.schedule(
--   'pj-ours-delete-previous-day-orders',
--   '30 18 * * *',
--   $$
--     delete from public.orders
--     where created_at < (
--       date_trunc('day', now() at time zone 'Asia/Kolkata')
--         at time zone 'Asia/Kolkata'
--     );
--   $$
-- );
