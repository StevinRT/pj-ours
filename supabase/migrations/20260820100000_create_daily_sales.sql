-- ============================================================
-- daily_sales: permanent per-day revenue summary
-- Lives independently of the orders table so cleanup jobs can
-- safely delete old orders without losing the sales history.
-- ============================================================

-- 1. Table --------------------------------------------------
create table if not exists public.daily_sales (
  id               uuid        primary key default gen_random_uuid(),
  sale_date        date        not null unique,
  total_orders     integer     not null default 0,
  total_sales      numeric(12,2) not null default 0,
  cash_sales       numeric(12,2) not null default 0,
  upi_sales        numeric(12,2) not null default 0,
  card_sales       numeric(12,2) not null default 0,
  east_fort_sales  numeric(12,2) not null default 0,
  west_fort_sales  numeric(12,2) not null default 0,
  updated_at       timestamptz not null default now()
);

-- 2. RLS ----------------------------------------------------
alter table public.daily_sales enable row level security;

drop policy if exists "Authenticated users can read daily_sales" on public.daily_sales;
create policy "Authenticated users can read daily_sales"
  on public.daily_sales for select to authenticated using (true);

-- 3. Core helper: aggregate one IST calendar day from orders
--    Uses UPSERT so calling it multiple times is always safe.
create or replace function public.sync_daily_sales_for_date(p_date date)
returns void language plpgsql security definer as $$
begin
  insert into public.daily_sales (
    sale_date,
    total_orders,
    total_sales,
    cash_sales,
    upi_sales,
    card_sales,
    east_fort_sales,
    west_fort_sales,
    updated_at
  )
  select
    p_date,
    count(*)::int,
    coalesce(sum(total),                                                        0),
    coalesce(sum(case when lower(payment_method) = 'cash'  then total else 0 end), 0),
    coalesce(sum(case when lower(payment_method) = 'upi'   then total else 0 end), 0),
    coalesce(sum(case when lower(payment_method) = 'card'  then total else 0 end), 0),
    coalesce(sum(case when branch = 'east-fort'            then total else 0 end), 0),
    coalesce(sum(case when branch = 'west-fort'            then total else 0 end), 0),
    now()
  from public.orders
  where (created_at at time zone 'Asia/Kolkata')::date = p_date
    and status != 'cancelled'
  on conflict (sale_date) do update set
    total_orders    = excluded.total_orders,
    total_sales     = excluded.total_sales,
    cash_sales      = excluded.cash_sales,
    upi_sales       = excluded.upi_sales,
    card_sales      = excluded.card_sales,
    east_fort_sales = excluded.east_fort_sales,
    west_fort_sales = excluded.west_fort_sales,
    updated_at      = excluded.updated_at;
end;
$$;

-- 4. Trigger function: fires after every INSERT or UPDATE on orders.
--    Recalculates the affected IST day so daily_sales is always current.
--    NOT triggered on DELETE — daily_sales is a permanent ledger.
create or replace function public.orders_sync_daily_sales()
returns trigger language plpgsql security definer as $$
declare
  v_old_date date;
  v_new_date date;
begin
  if TG_OP = 'INSERT' then
    perform public.sync_daily_sales_for_date(
      (new.created_at at time zone 'Asia/Kolkata')::date
    );
  elsif TG_OP = 'UPDATE' then
    v_old_date := (old.created_at at time zone 'Asia/Kolkata')::date;
    v_new_date := (new.created_at at time zone 'Asia/Kolkata')::date;
    -- recalculate old day too if created_at somehow shifted
    if v_old_date != v_new_date then
      perform public.sync_daily_sales_for_date(v_old_date);
    end if;
    perform public.sync_daily_sales_for_date(v_new_date);
  end if;
  return null;
end;
$$;

drop trigger if exists orders_sync_daily_sales_tg on public.orders;
create trigger orders_sync_daily_sales_tg
  after insert or update on public.orders
  for each row execute function public.orders_sync_daily_sales();

-- 5. Idempotent full-reconcile RPC.
--    Call this BEFORE deleting old orders so the summary is committed first.
--    Safe to call multiple times — upsert never double-counts.
create or replace function public.reconcile_daily_sales()
returns void language plpgsql security definer as $$
declare
  v_date date;
begin
  for v_date in
    select distinct (created_at at time zone 'Asia/Kolkata')::date
    from public.orders
    where status != 'cancelled'
    order by 1
  loop
    perform public.sync_daily_sales_for_date(v_date);
  end loop;
end;
$$;

-- 6. Safe cleanup helper.
--    Reconciles first, then removes terminal orders older than today IST.
create or replace function public.cleanup_old_orders()
returns integer language plpgsql security definer as $$
declare
  v_count   integer;
  v_cutoff  timestamptz;
begin
  -- start-of-today in IST expressed as UTC
  v_cutoff := date_trunc('day', now() at time zone 'Asia/Kolkata') at time zone 'Asia/Kolkata';

  -- commit all existing orders to daily_sales before deletion
  perform public.reconcile_daily_sales();

  delete from public.orders
  where created_at < v_cutoff
    and status in ('completed', 'cancelled');

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- 7. Immediate backfill from whatever orders already exist
select public.reconcile_daily_sales();
