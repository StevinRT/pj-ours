"use client";

import { useEffect, useRef, useState } from "react";

import { createClient } from "@/lib/supabase/client";

import { printBill, printKot } from "./print-utils";

type OrderItem = {
  name: string;
  sizeLabel: string;
  price: number;
  quantity: number;
  category?: string;
};

type Order = {
  id: string;
  order_number: number;
  source: string;
  customer_name: string;
  customer_phone: string;
  branch: string;
  order_type: string;
  table_number: string | null;
  items: OrderItem[];
  subtotal: number;
  packing_charge: number;
  total: number;
  payment_method: string | null;
  special_instructions: string | null;
  status: string;
  is_read: boolean;
  created_at: string;
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const fmtDateTime = (s: string) => {
  const d = new Date(s);
  const date = `${String(d.getDate()).padStart(2,'0')} ${MONTHS[d.getMonth()]}`;
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2,'0');
  return `${date} · ${h % 12 || 12}:${m} ${h >= 12 ? 'PM' : 'AM'}`;
};

const branchLabel = (id: string) =>
  id === 'east-fort' ? 'East Fort' : id === 'west-fort' ? 'West Fort' : id;

export default function LiveOrders({ onPunchOrder }: { onPunchOrder: () => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const initialIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const supabase = createClient();

    const loadOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      const loaded = (data ?? []) as Order[];
      setOrders(loaded);
      setLoading(false);
      loaded.forEach((o) => initialIdsRef.current.add(o.id));
    };

    void loadOrders();

    const channel = supabase
      .channel("orders-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const incoming = payload.new as Order;
            if (incoming.status === "active") {
              setOrders((prev) => [incoming, ...prev]);
              if (!initialIdsRef.current.has(incoming.id)) {
                setNewOrderIds((prev) => new Set(prev).add(incoming.id));
              }
            }
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as Order;
            if (updated.status !== "active") {
              setOrders((prev) => prev.filter((o) => o.id !== updated.id));
              setNewOrderIds((prev) => {
                const s = new Set(prev);
                s.delete(updated.id);
                return s;
              });
            } else {
              setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
            }
          } else if (payload.eventType === "DELETE") {
            const deleted = payload.old as { id: string };
            setOrders((prev) => prev.filter((o) => o.id !== deleted.id));
            setNewOrderIds((prev) => {
              const s = new Set(prev);
              s.delete(deleted.id);
              return s;
            });
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const markDone = async (orderId: string) => {
    const supabase = createClient();
    await supabase.from("orders").update({ status: "completed" }).eq("id", orderId);
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    setNewOrderIds((prev) => {
      const s = new Set(prev);
      s.delete(orderId);
      return s;
    });
  };

  return (
    <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">Live Orders</p>
          <h2 className="mt-1 text-2xl font-bold">Active Orders</h2>
          {!loading && (
            <p className="mt-1 text-sm text-zinc-400">{orders.length} active · updates automatically</p>
          )}
        </div>
        <button
          onClick={onPunchOrder}
          className="self-start rounded-full bg-amber-400 px-5 py-3 font-semibold text-black transition hover:bg-amber-300 sm:self-auto"
        >
          + Punch Counter Order
        </button>
      </div>

      {loading ? (
        <div className="py-10 text-center text-zinc-400">Loading orders…</div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 py-10 text-center text-zinc-400">
          No active orders. Website orders appear here automatically.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isNew = newOrderIds.has(order.id) || !order.is_read;
            const isDineIn = order.order_type === "dine-in";
            const items = order.items as OrderItem[];

            return (
              <div
                key={order.id}
                className={`rounded-2xl border p-4 transition ${
                  isNew
                    ? "border-amber-400/50 bg-amber-400/5"
                    : "border-white/10 bg-black/20"
                }`}
              >
                {/* Header row */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {isNew && (
                      <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-black">
                        🔔 NEW
                      </span>
                    )}
                    <span className="font-bold text-amber-200">#{order.order_number}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        order.source === "Counter"
                          ? "bg-purple-400/20 text-purple-200"
                          : "bg-blue-400/20 text-blue-200"
                      }`}
                    >
                      {order.source}
                    </span>
                    <span className="text-sm text-zinc-300">{branchLabel(order.branch)}</span>
                    <span className="text-sm text-zinc-500">{fmtDateTime(order.created_at)}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        isDineIn
                          ? "bg-emerald-400/15 text-emerald-200"
                          : "bg-zinc-400/15 text-zinc-200"
                      }`}
                    >
                      {isDineIn ? "🍽️ Dine In" : "📦 Parcel"}
                    </span>
                    {isDineIn && order.table_number && (
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-white">
                        TABLE {order.table_number}
                      </span>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="mt-3 space-y-1 border-t border-white/5 pt-3">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm text-zinc-300">
                      <span>
                        {item.quantity} ×{" "}
                        {item.name}
                        {item.sizeLabel && item.sizeLabel !== "Regular"
                          ? ` (${item.sizeLabel})`
                          : ""}
                      </span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-white/5 pt-3 text-sm">
                  {order.packing_charge > 0 && (
                    <span className="text-zinc-400">Packing ₹{order.packing_charge}</span>
                  )}
                  <span className="font-semibold text-white">Total ₹{order.total}</span>
                  {order.payment_method && (
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-zinc-300">
                      {order.payment_method}
                    </span>
                  )}
                  {order.customer_name && (
                    <span className="text-zinc-500">{order.customer_name}</span>
                  )}
                </div>

                {/* Action buttons */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => printBill({ ...order, items })}
                    className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                  >
                    🧾 Print Bill
                  </button>
                  <button
                    onClick={() => printKot({ ...order, items })}
                    className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                  >
                    🍳 Print KOT
                  </button>
                  <button
                    onClick={() => markDone(order.id)}
                    className="rounded-full bg-emerald-400/20 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-400/30"
                  >
                    ✓ Done
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
