import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";

export type SupabaseDbClient = SupabaseClient<Database>;
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type NewProduct = Database["public"]["Tables"]["products"]["Insert"];
export type UpdateProduct = Database["public"]["Tables"]["products"]["Update"];

export const listProducts = async (supabase: SupabaseDbClient) => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
};

export const createProduct = async (supabase: SupabaseDbClient, payload: NewProduct) => {
  const { data, error } = await supabase.from("products").insert(payload).select("*").single();

  if (error) {
    throw error;
  }

  return data;
};

export const updateProduct = async (
  supabase: SupabaseDbClient,
  id: string,
  payload: UpdateProduct,
) => {
  const { data, error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const deleteProduct = async (supabase: SupabaseDbClient, id: string) => {
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    throw error;
  }
};

export const toggleProductAvailability = async (supabase: SupabaseDbClient, id: string) => {
  const { data: current, error: fetchError } = await supabase
    .from("products")
    .select("available")
    .eq("id", id)
    .single();

  if (fetchError) {
    throw fetchError;
  }

  const { data, error } = await supabase
    .from("products")
    .update({ available: !current.available })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
};
