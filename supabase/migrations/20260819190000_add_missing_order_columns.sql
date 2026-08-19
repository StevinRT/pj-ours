-- Add columns missing from the existing orders table.
-- All statements are safe to re-run (IF NOT EXISTS / DEFAULT-backed NOT NULL).

alter table public.orders add column if not exists payment_method text;
alter table public.orders add column if not exists source       text not null default 'Website';
alter table public.orders add column if not exists table_number text;
alter table public.orders add column if not exists status       text not null default 'active';
alter table public.orders add column if not exists is_read      boolean not null default false;

-- Sequence and order_number (in case they are also missing)
create sequence if not exists public.orders_order_number_seq start with 1001;
alter table public.orders add column if not exists order_number integer not null default nextval('public.orders_order_number_seq');

-- Reload PostgREST schema cache so new columns are visible immediately
notify pgrst, 'reload schema';
