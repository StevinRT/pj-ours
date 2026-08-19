"use client";

import { useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/lib/products";

const BRANCHES = [
  { id: "east-fort", name: "East Fort" },
  { id: "west-fort", name: "West Fort" },
] as const;

const PAYMENT_METHODS = ["Cash", "UPI", "Card"] as const;

type Props = {
  products: Product[];
  onClose: () => void;
};

export default function PunchOrder({ products, onClose }: Props) {
  const [branch, setBranch] = useState<"east-fort" | "west-fort">("east-fort");
  const [orderType, setOrderType] = useState<"dine-in" | "parcel">("dine-in");
  const [tableNumber, setTableNumber] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
  const [search, setSearch] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    const available = products.filter((p) => p.available);
    const term = search.trim().toLowerCase();
    if (!term) return available;
    return available.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term),
    );
  }, [products, search]);

  const cartItems = useMemo(
    () =>
      products
        .filter((p) => (cart[p.id] ?? 0) > 0)
        .map((p) => ({ ...p, quantity: cart[p.id] ?? 0 })),
    [products, cart],
  );

  const totalItems = cartItems.reduce((s, i) => s + i.quantity, 0);
  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const packingCharge = orderType === "parcel" ? totalItems * 5 : 0;
  const total = subtotal + packingCharge;

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) => {
      const next = (prev[productId] ?? 0) + delta;
      if (next <= 0) {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      }
      return { ...prev, [productId]: next };
    });
  };

  const placeOrder = async () => {
    if (!cartItems.length) { setError("Add at least one item."); return; }
    if (orderType === "dine-in" && !tableNumber.trim()) {
      setError("Enter the table number for Dine In.");
      return;
    }

    setPlacing(true);
    setError(null);

    const supabase = createClient();
    const { error: insertError } = await supabase.from("orders").insert({
      source: "Counter",
      branch,
      order_type: orderType,
      table_number: orderType === "dine-in" ? tableNumber.trim() : null,
      items: cartItems.map((item) => ({
        name: item.name,
        sizeLabel: "Regular",
        price: item.price,
        quantity: item.quantity,
        category: item.category,
      })),
      subtotal,
      packing_charge: packingCharge,
      total,
      payment_method: paymentMethod,
      special_instructions: null,
      pickup_time: null,
      status: "active",
      is_read: true,
    });

    setPlacing(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
      <div className="my-4 w-full max-w-xl rounded-3xl border border-white/10 bg-zinc-900 shadow-2xl">
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">Counter Order</p>
            <h2 className="text-2xl font-bold">Punch New Order</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            Cancel
          </button>
        </div>

        <div className="space-y-5 p-5">
          {/* Outlet + Order Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-2 text-sm text-zinc-400">Outlet</p>
              <div className="flex gap-2">
                {BRANCHES.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBranch(b.id)}
                    className={`flex-1 rounded-2xl border py-2 text-sm font-semibold transition ${
                      branch === b.id
                        ? "border-amber-300 bg-amber-400/10 text-amber-200"
                        : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm text-zinc-400">Order Type</p>
              <div className="flex gap-2">
                {(["dine-in", "parcel"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setOrderType(type)}
                    className={`flex-1 rounded-2xl border py-2 text-sm font-semibold transition ${
                      orderType === type
                        ? "border-emerald-300 bg-emerald-400/10 text-emerald-200"
                        : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                    }`}
                  >
                    {type === "dine-in" ? "🍽️ Dine In" : "📦 Parcel"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table Number — only for Dine In */}
          {orderType === "dine-in" && (
            <label className="block text-sm">
              <span className="mb-2 block text-zinc-400">Table Number</span>
              <input
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="e.g. 5"
                className="w-full max-w-xs rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              />
            </label>
          )}

          {/* Item search + list */}
          <div>
            <p className="mb-2 text-sm font-semibold text-zinc-300">Items</p>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items or category…"
              className="mb-3 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            />
            <div className="max-h-64 space-y-1 overflow-y-auto">
              {filteredProducts.map((product) => {
                const qty = cart[product.id] ?? 0;
                return (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-2"
                  >
                    <span className="flex-1 text-sm">
                      {product.icon} {product.name}
                    </span>
                    <span className="mr-4 text-sm text-zinc-400">₹{product.price}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQty(product.id, -1)}
                        disabled={qty === 0}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-sm transition hover:bg-white/20 disabled:opacity-30"
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-sm">{qty}</span>
                      <button
                        type="button"
                        onClick={() => updateQty(product.id, 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400/20 text-sm text-amber-200 transition hover:bg-amber-400/30"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
              {filteredProducts.length === 0 && (
                <p className="py-4 text-center text-sm text-zinc-500">No items found.</p>
              )}
            </div>
          </div>

          {/* Cart summary */}
          {cartItems.length > 0 && (
            <div className="space-y-1 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-zinc-300">
                  <span>{item.name} × {item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div className="mt-2 flex justify-between border-t border-white/10 pt-2 text-zinc-300">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {packingCharge > 0 && (
                <div className="flex justify-between text-zinc-300">
                  <span>Packing (₹5 × {totalItems} items)</span>
                  <span>₹{packingCharge}</span>
                </div>
              )}
              <div className="flex justify-between pt-1 text-base font-semibold text-amber-200">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div>
            <p className="mb-2 text-sm text-zinc-400">Payment Method</p>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${
                    paymentMethod === m
                      ? "border-amber-300 bg-amber-400/10 text-amber-200"
                      : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-rose-300">{error}</p>}

          <button
            type="button"
            onClick={() => { void placeOrder(); }}
            disabled={placing || !cartItems.length}
            className="w-full rounded-full bg-emerald-400 py-3 font-semibold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-300"
          >
            {placing
              ? "Placing order…"
              : `Place Counter Order${total > 0 ? ` · ₹${total}` : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}
