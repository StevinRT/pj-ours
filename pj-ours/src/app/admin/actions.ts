"use server";

import { revalidatePath } from "next/cache";

import { requireAdminClient } from "@/lib/supabase/admin";
import {
  createProduct,
  deleteProduct,
  toggleProductAvailability,
  updateProduct,
} from "@/lib/products";

const readText = (formData: FormData, field: string) => {
  const value = String(formData.get(field) ?? "").trim();

  if (!value) {
    throw new Error(`${field} is required`);
  }

  return value;
};

const readPrice = (formData: FormData) => {
  const value = Number(formData.get("price"));

  if (!Number.isFinite(value) || value < 0) {
    throw new Error("price must be a non-negative number");
  }

  return value;
};

const readAvailable = (formData: FormData) => formData.get("available") === "on";

export const createProductAction = async (formData: FormData) => {
  const supabase = await requireAdminClient();

  await createProduct(supabase, {
    name: readText(formData, "name"),
    price: readPrice(formData),
    category: readText(formData, "category"),
    icon: readText(formData, "icon"),
    available: readAvailable(formData),
  });

  revalidatePath("/admin");
};

export const updateProductAction = async (productId: string, formData: FormData) => {
  const supabase = await requireAdminClient();

  await updateProduct(supabase, productId, {
    name: readText(formData, "name"),
    price: readPrice(formData),
    category: readText(formData, "category"),
    icon: readText(formData, "icon"),
    available: readAvailable(formData),
  });

  revalidatePath("/admin");
};

export const deleteProductAction = async (productId: string) => {
  const supabase = await requireAdminClient();

  await deleteProduct(supabase, productId);
  revalidatePath("/admin");
};

export const toggleProductAvailabilityAction = async (productId: string) => {
  const supabase = await requireAdminClient();

  await toggleProductAvailability(supabase, productId);
  revalidatePath("/admin");
};
