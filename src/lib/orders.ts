import type { SupabaseDbClient } from "@/lib/products";
import type { Json } from "@/lib/supabase/types";

export type OrderItem = {
  name: string;
  sizeLabel: string;
  price: number;
  quantity: number;
  category: string;
};

export type OrderRow = {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string;
  branch: string;
  order_type: string;
  items: OrderItem[];
  subtotal: number;
  packing_charge: number;
  total: number;
  special_instructions: string | null;
  pickup_time: string | null;
  status: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
};

export type NewOrderPayload = {
  customer_name: string;
  customer_phone: string;
  branch: string;
  order_type: "dine-in" | "parcel";
  items: OrderItem[];
  subtotal: number;
  packing_charge: number;
  total: number;
  special_instructions?: string | null;
  pickup_time?: string | null;
};

export const createOrder = async (supabase: SupabaseDbClient, payload: NewOrderPayload) => {
  const { data, error } = await supabase
    .from("orders")
    .insert({ ...payload, items: payload.items as unknown as Json })
    .select("id, order_number")
    .single();

  if (error) throw error;
  return data;
};

/** Returns all orders placed since the start of the current IST day. */
export const listTodayOrders = async (supabase: SupabaseDbClient): Promise<OrderRow[]> => {
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  const now = new Date();
  const istNow = new Date(now.getTime() + IST_OFFSET_MS);
  // IST midnight as UTC: strip the IST offset from the IST date's UTC midnight
  const istDayStartUtc = new Date(
    Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate()) - IST_OFFSET_MS,
  );

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .gte("created_at", istDayStartUtc.toISOString())
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as OrderRow[];
};
