import { NextResponse } from "next/server";

import { requireAdminClient } from "@/lib/supabase/admin";
import { listProducts } from "@/lib/products";

export async function GET() {
  const supabase = await requireAdminClient();
  const products = await listProducts(supabase);

  return NextResponse.json({ count: products.length });
}
