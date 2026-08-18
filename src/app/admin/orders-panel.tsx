"use client";

import { useEffect, useRef, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import type { OrderItem, OrderRow } from "@/lib/orders";

const STATUS_NEXT: Record<string, string | null> = {
  new: "preparing",
  preparing: "ready",
  ready: "completed",
  completed: null,
  cancelled: null,
};

const STATUS_LABEL: Record<string, string> = {
  new: "New",
  preparing: "Preparing",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_COLOR: Record<string, string> = {
  new: "bg-amber-400 text-black",
  preparing: "bg-blue-500 text-white",
  ready: "bg-emerald-500 text-white",
  completed: "bg-zinc-600 text-zinc-200",
  cancelled: "bg-rose-700 text-white",
};

const BRANCH_NAME: Record<string, string> = {
  "east-fort": "East Fort",
  "west-fort": "West Fort",
};

const playBeep = () => {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.45);
  } catch {
    // AudioContext unavailable in this environment
  }
};

const openReceiptWindow = (order: OrderRow) => {
  const branchName = BRANCH_NAME[order.branch] ?? order.branch;
  const dateStr = new Date(order.created_at).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const itemRows = order.items
    .map(
      (item: OrderItem) =>
        `<tr>
          <td style="padding:1mm 0;width:55%">${item.name}<br>
            <span style="color:#555;font-size:9px">${item.sizeLabel}</span>
          </td>
          <td style="text-align:center;width:10%;padding:1mm 0">${item.quantity}</td>
          <td style="text-align:right;width:35%;padding:1mm 0">&#8377;${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`,
    )
    .join("");

  const packingRow =
    order.packing_charge > 0
      ? `<tr><td>Packing</td><td style="text-align:right">&#8377;${order.packing_charge.toFixed(2)}</td></tr>`
      : "";

  const noteBlock = order.special_instructions
    ? `<hr><div style="font-size:9px">Note: ${order.special_instructions}</div>`
    : "";

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Bill #${order.order_number}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Courier New',Courier,monospace;font-size:11px;width:58mm;background:#fff;color:#000;padding:3mm 4mm}
  .c{text-align:center}.b{font-weight:700}.lg{font-size:15px}
  hr{border:none;border-top:1px dashed #000;margin:2.5mm 0}
  table{width:100%;border-collapse:collapse}
  @media print{body{margin:0;padding:2mm}@page{margin:0;size:58mm auto}}
</style>
</head>
<body>
<div class="c b lg">PJ OURS</div>
<div class="c">${branchName} Branch</div>
<hr>
<div><span class="b">Order #${order.order_number}</span></div>
<div>${dateStr}</div>
<div>${order.order_type === "dine-in" ? "Dine In" : "Parcel"}</div>
${order.customer_name ? `<div>Customer: ${order.customer_name}</div>` : ""}
${order.pickup_time ? `<div>Pickup: ${order.pickup_time}</div>` : ""}
<hr>
<table>
  <thead>
    <tr>
      <td class="b">Item</td>
      <td class="b" style="text-align:center">Qty</td>
      <td class="b" style="text-align:right">Amt</td>
    </tr>
  </thead>
  <tbody>${itemRows}</tbody>
</table>
<hr>
<table>
  <tr><td>Subtotal</td><td style="text-align:right">&#8377;${order.subtotal.toFixed(2)}</td></tr>
  ${packingRow}
  <tr class="b"><td style="font-size:13px">TOTAL</td><td style="text-align:right;font-size:13px">&#8377;${order.total.toFixed(2)}</td></tr>
</table>
${noteBlock}
<hr>
<div class="c">Thank you for visiting</div>
<div class="c b">PJ Ours! 🍹</div>
<script>window.onload=function(){window.print();}</script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=420,height=680,scrollbars=yes");
  if (!win) return;
  win.document.write(html);
  win.document.close();
};

export default function OrdersPanel({ initialOrders }: { initialOrders: OrderRow[] }) {
  const [orders, setOrders] = useState<OrderRow[]>(initialOrders);
  const [flashNew, setFlashNew] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const seenIdsRef = useRef(new Set(initialOrders.map((o) => o.id)));

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("pj-orders-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const incoming = payload.new as OrderRow;
            if (!seenIdsRef.current.has(incoming.id)) {
              seenIdsRef.current.add(incoming.id);
              setOrders((prev) => [incoming, ...prev]);
              setFlashNew(true);
              playBeep();
              setTimeout(() => setFlashNew(false), 6000);
            }
          } else if (payload.eventType === "UPDATE") {
            setOrders((prev) =>
              prev.map((o) =>
                o.id === (payload.new as OrderRow).id ? { ...o, ...(payload.new as OrderRow) } : o,
              ),
            );
          } else if (payload.eventType === "DELETE") {
            setOrders((prev) =>
              prev.filter((o) => o.id !== (payload.old as { id: string }).id),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const pushStatus = async (order: OrderRow, nextStatus: string) => {
    setUpdating(order.id);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id ? { ...o, status: nextStatus, is_read: true } : o,
      ),
    );
    const supabase = createClient();
    await supabase
      .from("orders")
      .update({ status: nextStatus, is_read: true })
      .eq("id", order.id);
    setUpdating(null);
  };

  const cancelOrder = async (orderId: string) => {
    setUpdating(orderId);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: "cancelled", is_read: true } : o,
      ),
    );
    const supabase = createClient();
    await supabase
      .from("orders")
      .update({ status: "cancelled", is_read: true })
      .eq("id", orderId);
    setUpdating(null);
  };

  const unreadCount = orders.filter((o) => !o.is_read).length;

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
      {/* Section header */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">Live</p>
          <h2 className="mt-1 flex flex-wrap items-center gap-3 text-2xl font-bold">
            Orders
            {unreadCount > 0 && (
              <span className="animate-pulse rounded-full bg-rose-500 px-3 py-0.5 text-sm font-bold text-white">
                {unreadCount} new
              </span>
            )}
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            {orders.length} order{orders.length !== 1 ? "s" : ""} today
          </p>
        </div>

        {flashNew && (
          <div className="animate-pulse rounded-2xl border border-amber-400/40 bg-amber-400/15 px-4 py-2.5 text-sm font-semibold text-amber-200">
            🔔 New order received!
          </div>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-8 text-center text-zinc-400">
          No orders yet today. New orders appear here in real time.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => {
            const nextStatus = STATUS_NEXT[order.status] ?? null;
            const isUpdating = updating === order.id;
            const isDone = order.status === "completed" || order.status === "cancelled";

            return (
              <div
                key={order.id}
                className={`flex flex-col rounded-2xl border p-4 transition-colors ${
                  !order.is_read
                    ? "border-amber-400/50 bg-amber-400/5"
                    : "border-white/10 bg-black/20"
                }`}
              >
                {/* Card header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-zinc-400">
                      #{order.order_number} &bull;{" "}
                      {new Date(order.created_at).toLocaleTimeString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
                    <p className="mt-0.5 truncate font-semibold">
                      {order.customer_name || "Guest"}
                    </p>
                    {order.customer_phone && (
                      <p className="text-xs text-zinc-400">{order.customer_phone}</p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${STATUS_COLOR[order.status] ?? "bg-zinc-700 text-white"}`}
                  >
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                </div>

                {/* Meta row */}
                <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-xs text-zinc-400">
                  <span>{BRANCH_NAME[order.branch] ?? order.branch}</span>
                  <span>&bull;</span>
                  <span>{order.order_type === "dine-in" ? "🍽 Dine In" : "📦 Parcel"}</span>
                  {order.pickup_time && (
                    <>
                      <span>&bull;</span>
                      <span>Pickup: {order.pickup_time}</span>
                    </>
                  )}
                </div>

                {/* Items list */}
                <ul className="mt-3 space-y-1 text-sm">
                  {order.items.map((item: OrderItem, idx: number) => (
                    <li key={idx} className="flex justify-between gap-2">
                      <span className="text-zinc-200">
                        {item.quantity}&times; {item.name}{" "}
                        <span className="text-zinc-400">({item.sizeLabel})</span>
                      </span>
                      <span className="shrink-0 text-amber-300">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Totals */}
                <div className="mt-3 rounded-xl bg-black/20 px-3 py-2 text-sm">
                  {order.packing_charge > 0 && (
                    <div className="flex justify-between text-zinc-400">
                      <span>Packing</span>
                      <span>₹{order.packing_charge.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-amber-200">
                    <span>Total</span>
                    <span>₹{order.total.toFixed(2)}</span>
                  </div>
                </div>

                {order.special_instructions && (
                  <p className="mt-2 text-xs italic text-zinc-400">
                    &ldquo;{order.special_instructions}&rdquo;
                  </p>
                )}

                {/* Action buttons */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {nextStatus && !isDone && (
                    <button
                      onClick={() => pushStatus(order, nextStatus)}
                      disabled={isUpdating}
                      className="min-h-[44px] flex-1 rounded-full bg-emerald-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-50"
                    >
                      &rarr; {STATUS_LABEL[nextStatus]}
                    </button>
                  )}
                  {!isDone && (
                    <button
                      onClick={() => cancelOrder(order.id)}
                      disabled={isUpdating}
                      className="min-h-[44px] rounded-full bg-rose-500/20 px-3 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/30 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={() => openReceiptWindow(order)}
                    className="min-h-[44px] rounded-full bg-white/10 px-3 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-white/20"
                  >
                    {isDone ? "Reprint" : "Print Bill"}
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
