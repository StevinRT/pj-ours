create extension if not exists pgcrypto;

alter table public.products enable row level security;

drop policy if exists "Public can read available products" on public.products;
drop policy if exists "Authenticated users can read products" on public.products;
drop policy if exists "Authenticated users can insert products" on public.products;
drop policy if exists "Authenticated users can update products" on public.products;
drop policy if exists "Authenticated users can delete products" on public.products;

create policy "Public can read available products"
on public.products
for select
to anon
using (available = true);

create policy "Authenticated users can read products"
on public.products
for select
to authenticated
using (true);

create policy "Authenticated users can insert products"
on public.products
for insert
to authenticated
with check (true);

create policy "Authenticated users can update products"
on public.products
for update
to authenticated
using (true)
with check (true);

create policy "Authenticated users can delete products"
on public.products
for delete
to authenticated
using (true);
