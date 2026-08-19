"use client";

import { useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/lib/products";
import { menuItems } from "@/lib/menu";

const BRANCHES = [
  { id: "east-fort", name: "East Fort" },
  { id: "west-fort", name: "West Fort" },
] as const;

const PAYMENT_METHODS = ["Cash", "UPI", "Card"] as const;

type Props = {
  products: Product[];
  onClose: () => void;
};

type CartItem = {
  key: string;
  productId: string;
  name: string;
  category: string;
  sizeLabel: string;
  price: number;
  quantity: number;
};

export default function PunchOrder({ products, onClose }: Props) {
  const [branch, setBranch] = useState<"east-fort" | "west-fort">("east-fort");
  const [orderType, setOrderType] =
    useState<"dine-in" | "parcel">("dine-in");
  const [tableNumber, setTableNumber] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
  const [search, setSearch] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /*
   * Match the Supabase product with the shared menu catalog.
   * The Supabase product controls availability.
   * menu.ts controls sizes and prices.
   */
  const availableProducts = useMemo(() => {
    const available = products.filter((p) => p.available);

    return available
      .map((product) => {
        const menuItem = menuItems.find(
          (item) =>
            item.name.toLowerCase() === product.name.toLowerCase() &&
            item.category.toLowerCase() === product.category.toLowerCase(),
        );

        if (!menuItem) {
          return null;
        }

        return {
          product,
          menuItem,
        };
      })
      .filter(
        (
          item,
        ): item is {
          product: Product;
          menuItem: (typeof menuItems)[number];
        } => item !== null,
      );
  }, [products]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return availableProducts;
    }

    return availableProducts.filter(
      ({ product, menuItem }) =>
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term),
    );
  }, [availableProducts, search]);

  const cartItems = useMemo<CartItem[]>(() => {
    const result: CartItem[] = [];

    for (const { product, menuItem } of availableProducts) {
      for (const size of menuItem.sizes) {
        const key = `${product.id}-${size.label}`;
        const quantity = cart[key] ?? 0;

        if (quantity > 0) {
          result.push({
            key,
            productId: product.id,
            name: product.name,
            category: product.category,
            sizeLabel: size.label,
            price: size.price,
            quantity,
          });
        }
      }
    }

    return result;
  }, [availableProducts, cart]);

  const totalItems = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const packingCharge =
    orderType === "parcel" ? totalItems * 5 : 0;

  const total = subtotal + packingCharge;

  const updateQty = (key: string, delta: number) => {
    setCart((previous) => {
      const nextQuantity = (previous[key] ?? 0) + delta;

      if (nextQuantity <= 0) {
        const updated = { ...previous };
        delete updated[key];
        return updated;
      }

      return {
        ...previous,
        [key]: nextQuantity,
      };
    });
  };

  const getQuantity = (productId: string, sizeLabel: string) =>
    cart[`${productId}-${sizeLabel}`] ?? 0;

  const placeOrder = async () => {
    if (!cartItems.length) {
      setError("Add at least one item.");
      return;
    }

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
      table_number:
        orderType === "dine-in" ? tableNumber.trim() : null,

      items: cartItems.map((item) => ({
        name: item.name,
        sizeLabel: item.sizeLabel,
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
      status: "new",
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

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">
              Counter Order
            </p>

            <h2 className="text-2xl font-bold">
              Punch New Order
            </h2>
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
              <p className="mb-2 text-sm text-zinc-400">
                Outlet
              </p>

              <div className="flex gap-2">
                {BRANCHES.map((branchOption) => (
                  <button
                    key={branchOption.id}
                    type="button"
                    onClick={() =>
                      setBranch(branchOption.id)
                    }
                    className={`flex-1 rounded-2xl border py-2 text-sm font-semibold transition ${
                      branch === branchOption.id
                        ? "border-amber-300 bg-amber-400/10 text-amber-200"
                        : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                    }`}
                  >
                    {branchOption.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm text-zinc-400">
                Order Type
              </p>

              <div className="flex gap-2">
                {(["dine-in", "parcel"] as const).map(
                  (type) => (
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
                      {type === "dine-in"
                        ? "🍽️ Dine In"
                        : "📦 Parcel"}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Table Number */}
          {orderType === "dine-in" && (
            <label className="block text-sm">
              <span className="mb-2 block text-zinc-400">
                Table Number
              </span>

              <input
                value={tableNumber}
                onChange={(event) =>
                  setTableNumber(event.target.value)
                }
                placeholder="e.g. 5"
                className="w-full max-w-xs rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              />
            </label>
          )}

          {/* Search */}
          <div>
            <p className="mb-2 text-sm font-semibold text-zinc-300">
              Items
            </p>

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search items or category..."
              className="mb-3 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            />

            {/* Products */}
            <div className="max-h-80 space-y-3 overflow-y-auto pr-1">

              {filteredProducts.map(
                ({ product, menuItem }) => (
                  <div
                    key={product.id}
                    className="rounded-2xl border border-white/5 bg-white/5 p-3"
                  >
                    {/* Product name */}
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-sm font-semibold text-white">
                        {menuItem.emoji} {product.name}
                      </div>

                      <span className="text-xs text-zinc-500">
                        {product.category}
                      </span>
                    </div>

                    {/* Sizes */}
                    <div className="space-y-2">
                      {menuItem.sizes.map((size) => {
                        const key = `${product.id}-${size.label}`;
                        const quantity = getQuantity(
                          product.id,
                          size.label,
                        );

                        return (
                          <div
                            key={key}
                            className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-2"
                          >
                            <div>
                              <div className="text-sm text-zinc-200">
                                {size.label}
                              </div>

                              <div className="text-xs text-zinc-400">
                                ₹{size.price}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQty(key, -1)
                                }
                                disabled={quantity === 0}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm transition hover:bg-white/20 disabled:opacity-30"
                              >
                                −
                              </button>

                              <span className="w-6 text-center text-sm font-semibold">
                                {quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  updateQty(key, 1)
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400/20 text-sm text-amber-200 transition hover:bg-amber-400/30"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ),
              )}

              {filteredProducts.length === 0 && (
                <p className="py-4 text-center text-sm text-zinc-500">
                  No available items found.
                </p>
              )}
            </div>
          </div>

          {/* Cart */}
          {cartItems.length > 0 && (
            <div className="space-y-1 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm">

              <p className="mb-2 font-semibold text-white">
                Order Summary
              </p>

              {cartItems.map((item) => (
                <div
                  key={item.key}
                  className="flex justify-between text-zinc-300"
                >
                  <span>
                    {item.name} — {item.sizeLabel} ×{" "}
                    {item.quantity}
                  </span>

                  <span>
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}

              <div className="mt-2 flex justify-between border-t border-white/10 pt-2 text-zinc-300">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>

              {packingCharge > 0 && (
                <div className="flex justify-between text-zinc-300">
                  <span>
                    Packing (₹5 × {totalItems} items)
                  </span>

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
            <p className="mb-2 text-sm text-zinc-400">
              Payment Method
            </p>

            <div className="flex flex-wrap gap-2">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() =>
                    setPaymentMethod(method)
                  }
                  className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${
                    paymentMethod === method
                      ? "border-amber-300 bg-amber-400/10 text-amber-200"
                      : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-rose-300">
              {error}
            </p>
          )}

          {/* Place Order */}
          <button
            type="button"
            onClick={() => {
              void placeOrder();
            }}
            disabled={placing || !cartItems.length}
            className="w-full rounded-full bg-emerald-400 py-3 font-semibold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-300"
          >
            {placing
              ? "Placing order..."
              : `Place Counter Order${
                  total > 0 ? ` · ₹${total}` : ""
                }`}
          </button>
        </div>
      </div>
    </div>
  );
}