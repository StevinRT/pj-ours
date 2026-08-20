-- Enable Supabase Realtime for the orders table.
-- This is required for INSERT/UPDATE/DELETE events to be broadcast to the client.
alter publication supabase_realtime add table public.orders;
