import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { requireAdminClient } from "@/lib/supabase/admin";
import type { NewProduct } from "@/lib/products";

const seedFilePath = join(
  process.cwd(),
  "supabase",
  "migrations",
  "20260813170500_seed_products_from_menu.sql",
);

const parseSeedRows = (sql: string) => {
  const valuesSection = sql.split("values")[1]?.split("on conflict do nothing;")[0] ?? "";
  const rowPattern =
    /\('((?:[^']|'')*)',\s*([0-9]+(?:\.[0-9]+)?),\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*true\)/g;
  const rows: NewProduct[] = [];

  for (const match of valuesSection.matchAll(rowPattern)) {
    const [, name, price, category, icon] = match;

    rows.push({
      name: name.replace(/''/g, "'"),
      price: Number(price),
      category: category.replace(/''/g, "'"),
      icon: icon.replace(/''/g, "'"),
      available: true,
    });
  }

  return rows;
};

export async function POST() {
  const supabase = await requireAdminClient();
  const { count, error: countError } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true });

  if (countError) {
    throw countError;
  }

  if ((count ?? 0) > 0) {
    return NextResponse.json({ inserted: 0, skipped: true });
  }

  const sql = await readFile(seedFilePath, "utf8");
  const rows = parseSeedRows(sql);

  const { error } = await supabase.from("products").insert(rows);
  if (error) {
    throw error;
  }

  revalidatePath("/admin");

  return NextResponse.json({ inserted: rows.length, skipped: false });
}
