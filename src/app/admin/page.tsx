import { redirect } from "next/navigation";

import { requireAdminClient } from "@/lib/supabase/admin";
import { listProducts } from "@/lib/products";
import { listTodayOrders } from "@/lib/orders";

import AdminSignOutButton from "./sign-out-button";
import OrdersPanel from "./orders-panel";
import {
  createProductAction,
  deleteProductAction,
  toggleProductAvailabilityAction,
  updateProductAction,
} from "./actions";

export default async function AdminPage() {
  const supabase = await requireAdminClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/admin/sign-in?next=/admin");
  }

  const [products, orders] = await Promise.all([
    listProducts(supabase),
    listTodayOrders(supabase),
  ]);

  return (
    <main className="min-h-screen bg-[#09090b] px-4 py-10 text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">Admin</p>
            <h1 className="mt-2 text-3xl font-bold">Products</h1>
            <p className="mt-2 text-zinc-300">Add, edit, delete, and toggle availability.</p>
          </div>
          <AdminSignOutButton />
        </div>

        <OrdersPanel initialOrders={orders} />

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">Add product</h2>
          <form action={createProductAction} className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm text-zinc-300">Name</span>
              <input
                name="name"
                required
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-zinc-300">Price</span>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                required
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-zinc-300">Category</span>
              <input
                name="category"
                required
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-zinc-300">Icon / emoji</span>
              <input
                name="icon"
                required
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              />
            </label>
            <label className="flex items-center gap-3 md:col-span-2">
              <input name="available" type="checkbox" defaultChecked className="h-4 w-4" />
              <span className="text-sm text-zinc-300">Available</span>
            </label>
            <div className="md:col-span-2">
              <button className="rounded-full bg-amber-400 px-5 py-3 font-semibold text-black transition hover:bg-amber-300">
                Add product
              </button>
            </div>
          </form>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Existing products</h2>
            <p className="text-sm text-zinc-400">{products.length} items</p>
          </div>

          {products.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-8 text-zinc-300">
              No products yet.
            </div>
          ) : (
            <div className="grid gap-4">
              {products.map((product) => (
                <form
                  key={product.id}
                  action={updateProductAction.bind(null, product.id)}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <label className="block">
                        <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-zinc-400">Name</span>
                        <input
                          name="name"
                          defaultValue={product.name}
                          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-zinc-400">Price</span>
                        <input
                          name="price"
                          type="number"
                          min="0"
                          step="0.01"
                          defaultValue={product.price}
                          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-zinc-400">Category</span>
                        <input
                          name="category"
                          defaultValue={product.category}
                          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-zinc-400">Icon</span>
                        <input
                          name="icon"
                          defaultValue={product.icon}
                          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4 md:flex-row md:items-center md:justify-between">
                    <label className="flex items-center gap-3">
                      <input
                        name="available"
                        type="checkbox"
                        defaultChecked={product.available}
                        className="h-4 w-4"
                      />
                      <span className="text-sm text-zinc-300">Available</span>
                    </label>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="submit"
                        className="rounded-full bg-emerald-400 px-4 py-2 font-semibold text-black transition hover:bg-emerald-300"
                      >
                        Save
                      </button>
                      <button
                        type="submit"
                        formAction={toggleProductAvailabilityAction.bind(null, product.id)}
                        formNoValidate
                        className="rounded-full bg-white/10 px-4 py-2 font-semibold text-white transition hover:bg-white/15"
                      >
                        Toggle availability
                      </button>
                      <button
                        type="submit"
                        formAction={deleteProductAction.bind(null, product.id)}
                        formNoValidate
                        className="rounded-full bg-rose-500/20 px-4 py-2 font-semibold text-rose-200 transition hover:bg-rose-500/30"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </form>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
