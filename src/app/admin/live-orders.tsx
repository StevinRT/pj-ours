"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/types";

import { printThermalBill, printThermalKot } from "./print-utils";

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

// Shape returned by Supabase — items is Json until we parse it
type RawOrder = Omit<Order, "items"> & {
  items: Json;
  pickup_time?: string | null;
  updated_at?: string;
};

const parseItems = (json: Json): OrderItem[] => {
  if (!Array.isArray(json)) return [];
  return (json as Json[]).flatMap((entry) => {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) return [];
    const row = entry as Record<string, Json>;
    return [{
      name: String(row.name ?? ""),
      sizeLabel: String(row.sizeLabel ?? ""),
      price: Number(row.price ?? 0),
      quantity: Number(row.quantity ?? 0),
      category: row.category !== undefined ? String(row.category) : undefined,
    }];
  });
};

const mapOrder = (raw: RawOrder): Order => ({
  id: raw.id,
  order_number: raw.order_number,
  source: raw.source,
  customer_name: raw.customer_name,
  customer_phone: raw.customer_phone,
  branch: raw.branch,
  order_type: raw.order_type,
  table_number: raw.table_number,
  items: parseItems(raw.items),
  subtotal: raw.subtotal,
  packing_charge: raw.packing_charge,
  total: raw.total,
  payment_method: raw.payment_method,
  special_instructions: raw.special_instructions,
  status: raw.status,
  is_read: raw.is_read,
  created_at: raw.created_at,
});

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

type PrintStatus = { type: "success" | "error"; message: string };

type OrderAlert = {
  id: string;
  orderId: string;
  orderNumber: number;
  source: string;
  orderType: string;
  branch: string;
  total: number;
  itemSummary: string;
  createdAt: string;
};

export default function LiveOrders({ onPunchOrder }: { onPunchOrder: () => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const [notifications, setNotifications] = useState<OrderAlert[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported" | "unknown">("unknown");
  const initialIdsRef = useRef<Set<string>>(new Set());
  const notificationGuardRef = useRef<Set<string>>(new Set());
  const audioContextRef = useRef<AudioContext | null>(null);
  const [printStatus, setPrintStatus] = useState<Record<string, PrintStatus>>({});

  const focusOrderCard = useCallback((orderId: string) => {
    const element = document.getElementById(`order-${orderId}`);
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    element.classList.remove("ring-2", "ring-amber-300/0");
    element.classList.add("ring-2", "ring-amber-300");
    window.setTimeout(() => {
      element.classList.remove("ring-2", "ring-amber-300");
    }, 1600);
  }, []);

  const acknowledgeOrder = (orderId: string) => {
    setNewOrderIds((prev) => {
      const next = new Set(prev);
      next.delete(orderId);
      return next;
    });
    setNotifications((prev) => prev.filter((notification) => notification.orderId !== orderId));
  };

  const unlockAudioContext = useCallback(() => {
    if (typeof window === "undefined") return;

    const AudioConstructor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioConstructor) return;

    const context = audioContextRef.current ?? new AudioConstructor();
    audioContextRef.current = context;
    if (context.state === "suspended") {
      void context.resume().catch(() => undefined);
    }
  }, []);

  const playOrderSound = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      const AudioConstructor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioConstructor) return;

      const context = audioContextRef.current ?? new AudioConstructor();
      audioContextRef.current = context;

      if (context.state === "suspended") {
        void context.resume();
      }

      const scheduleTone = (frequency: number, startAt: number, length: number, volume: number, shape: OscillatorType) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();

        oscillator.type = shape;
        oscillator.frequency.setValueAtTime(frequency, startAt);
        oscillator.frequency.exponentialRampToValueAtTime(Math.max(150, frequency * 0.7), startAt + length);

        gain.gain.setValueAtTime(0.0001, startAt);
        gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startAt + length);

        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(startAt);
        oscillator.stop(startAt + length);
      };

      const now = context.currentTime;
      const pattern = [
        { frequency: 1046.5, length: 0.12, volume: 0.18, shape: "triangle" as const },
        { frequency: 1318.5, length: 0.14, volume: 0.17, shape: "triangle" as const },
        { frequency: 1568.0, length: 0.18, volume: 0.16, shape: "sine" as const },
        { frequency: 880.0, length: 0.12, volume: 0.14, shape: "square" as const },
        { frequency: 1174.7, length: 0.14, volume: 0.13, shape: "triangle" as const },
      ];

      pattern.forEach((tone, index) => {
        const startAt = now + index * 0.18;
        scheduleTone(tone.frequency, startAt, tone.length, tone.volume, tone.shape);
      });

      const pauseAfter = now + pattern.length * 0.18 + 0.18;
      scheduleTone(740, pauseAfter, 0.11, 0.12, "triangle");
      scheduleTone(987.8, pauseAfter + 0.12, 0.11, 0.12, "sine");
    } catch {
      // Browsers can block autoplay; keep the visual and browser notification flow intact.
    }
  }, []);

  const showBrowserNotification = useCallback((order: Order) => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (window.Notification.permission !== "granted") return;
    if (document.visibilityState === "visible") return;

    const title = `PJ Ours — New ${order.source === "Counter" ? "Counter" : "Online"} Order`;
    const body = `Order #${order.order_number} • ₹${order.total} • ${branchLabel(order.branch)}`;

    const notification = new window.Notification(title, {
      body,
      tag: `pj-ours-order-${order.id}`,
      silent: true,
    });

    notification.onclick = () => {
      window.focus();
      focusOrderCard(order.id);
      notification.close();
    };
  }, [focusOrderCard]);

  const announceNewOrderVoice = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const { speechSynthesis } = window;
    speechSynthesis.cancel();

    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find((voice) => /en/i.test(voice.lang)) ?? voices[0];

    const gapMs = 200;

    const speak = (text: string, delayMs = 0) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = 1;
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.lang = preferredVoice?.lang ?? "en-US";
      utterance.voice = preferredVoice ?? null;

      if (delayMs > 0) {
        window.setTimeout(() => {
          if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
          window.speechSynthesis.speak(utterance);
        }, delayMs);
        return;
      }

      window.speechSynthesis.speak(utterance);
    };

    speak("You have a new order.");
    speak("You have a new order.", gapMs);
    speak("You have a new order.", gapMs * 2);
  }, []);

  const addNewOrderNotification = useCallback((order: Order) => {
    if (notificationGuardRef.current.has(order.id)) return;
    notificationGuardRef.current.add(order.id);

    setNewOrderIds((prev) => new Set(prev).add(order.id));

    const summary = order.items.slice(0, 3).map((item) => `${item.quantity}× ${item.name}`).join(" • ") || "1 item";
    const toast: OrderAlert = {
      id: `${order.id}-toast`,
      orderId: order.id,
      orderNumber: order.order_number,
      source: order.source,
      orderType: order.order_type,
      branch: branchLabel(order.branch),
      total: order.total,
      itemSummary: summary,
      createdAt: order.created_at,
    };

    setNotifications((prev) => [toast, ...prev].slice(0, 3));
    window.setTimeout(() => {
      setNotifications((prev) => prev.filter((item) => item.orderId !== order.id));
    }, 9000);

    playOrderSound();
    announceNewOrderVoice();
    showBrowserNotification(order);
  }, [announceNewOrderVoice, playOrderSound, showBrowserNotification]);

  const showPrintStatus = (orderId: string, status: PrintStatus) => {
    setPrintStatus((prev) => ({ ...prev, [orderId]: status }));
    setTimeout(() => {
      setPrintStatus((prev) => {
        if (prev[orderId] !== status) return prev;
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
    }, 4000);
  };

  const handlePrintBill = async (order: Order) => {
    const result = await printThermalBill({ ...order, items: order.items });
    showPrintStatus(
      order.id,
      result.ok ? { type: "success", message: "Printed successfully" } : { type: "error", message: result.message },
    );
  };

  const handlePrintKot = async (order: Order) => {
    const result = await printThermalKot({ ...order, items: order.items });
    showPrintStatus(
      order.id,
      result.ok ? { type: "success", message: "Printed successfully" } : { type: "error", message: result.message },
    );
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsClient(true);
      if (typeof window !== "undefined" && "Notification" in window) {
        setNotificationPermission(window.Notification.permission);
      } else {
        setNotificationPermission("unsupported");
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const channelId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2, 11);
    const channelName = `orders-live-${channelId}`;
    const supabase = createClient();

    const loadOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .in("status", ["new", "preparing", "ready"])
        .order("created_at", { ascending: false });

      if (error) console.error("[LiveOrders] initial fetch error:", error);

      const loaded = (data ?? []).map((row) => mapOrder(row as unknown as RawOrder));
      setOrders((prev) => {
        const mergedOrders = new Map(loaded.map((order) => [order.id, order]));
        prev
          .filter((order) => ["new", "preparing", "ready"].includes(order.status))
          .forEach((order) => mergedOrders.set(order.id, order));

        return [...mergedOrders.values()].sort(
          (left, right) => Date.parse(right.created_at) - Date.parse(left.created_at),
        );
      });
      setLoading(false);
      loaded.forEach((o) => initialIdsRef.current.add(o.id));
    };

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const incoming = mapOrder(payload.new as RawOrder);

          if (["new", "preparing", "ready"].includes(incoming.status)) {
            setOrders((prev) => {
              const next = prev.filter((order) => order.id !== incoming.id);
              next.unshift(incoming);
              return next;
            });
            addNewOrderNotification(incoming);
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          const updated = mapOrder(payload.new as unknown as RawOrder);
          const isActive = ["new", "preparing", "ready"].includes(updated.status);
          if (!isActive) {
            setOrders((prev) => prev.filter((o) => o.id !== updated.id));
            setNewOrderIds((prev) => {
              const s = new Set(prev);
              s.delete(updated.id);
              return s;
            });
          } else {
            setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "orders" },
        (payload) => {
          const deleted = payload.old as { id: string };
          setOrders((prev) => prev.filter((o) => o.id !== deleted.id));
          setNewOrderIds((prev) => {
            const s = new Set(prev);
            s.delete(deleted.id);
            return s;
          });
        },
      );

    channel.subscribe((status, err) => {
      if (err) {
        console.error("[LiveOrders] subscription error:", err);
      }
    });

    void loadOrders();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [addNewOrderNotification]);

  const requestNotificationPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    try {
      const permission = await window.Notification.requestPermission();
      setNotificationPermission(permission);
    } catch {
      setNotificationPermission("denied");
    }
  };

  const markDone = async (orderId: string) => {
    const supabase = createClient();
    await supabase.from("orders").update({ status: "completed" }).eq("id", orderId);
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    setNewOrderIds((prev) => {
      const s = new Set(prev);
      s.delete(orderId);
      return s;
    });
    setNotifications((prev) => prev.filter((notification) => notification.orderId !== orderId));
  };

  return (
    <section
      className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6"
      onPointerDown={unlockAudioContext}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">Live Orders</p>
          <h2 className="mt-1 text-2xl font-bold">Active Orders</h2>
          {!loading && (
            <p className="mt-1 text-sm text-zinc-400">{orders.length} active · updates automatically</p>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {isClient && "Notification" in window ? (
            <button
              type="button"
              onClick={() => {
                if (notificationPermission === "default") {
                  void requestNotificationPermission();
                }
              }}
              disabled={notificationPermission === "denied" || notificationPermission === "unsupported"}
              className={`self-start rounded-full px-4 py-2 text-sm font-semibold transition sm:self-auto ${
                notificationPermission === "granted"
                  ? "bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30"
                  : notificationPermission === "denied"
                    ? "cursor-not-allowed bg-zinc-700/60 text-zinc-400"
                    : notificationPermission === "unsupported"
                      ? "cursor-not-allowed bg-zinc-700/60 text-zinc-400"
                      : "bg-blue-500/20 text-blue-100 hover:bg-blue-500/30"
              }`}
            >
              {notificationPermission === "granted"
                ? "🔔 Notifications Enabled"
                : notificationPermission === "denied"
                  ? "🔕 Notifications Blocked"
                  : notificationPermission === "unsupported"
                    ? "🔕 Notifications Blocked"
                    : "🔔 Enable Notifications"}
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="self-start cursor-not-allowed rounded-full bg-blue-500/20 px-4 py-2 text-sm font-semibold text-blue-100 opacity-80 transition sm:self-auto"
            >
              🔔 Enable Notifications
            </button>
          )}
          <button
            onClick={onPunchOrder}
            className="self-start rounded-full bg-amber-400 px-5 py-3 font-semibold text-black transition hover:bg-amber-300 sm:self-auto"
          >
            + Punch Counter Order
          </button>
        </div>
      </div>

      {notifications.length > 0 && (
        <div className="fixed inset-x-3 bottom-3 z-50 flex max-w-md flex-col gap-2 sm:inset-x-auto sm:right-4 sm:bottom-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="rounded-2xl border border-amber-400/50 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">{notification.source === "Counter" ? "🧾 New Counter Order" : "🆕 New Order"}</p>
                  <p className="mt-1 text-base font-bold text-white">
                    {notification.source === "Counter" ? "Counter Order" : "Online Order"} #{notification.orderNumber}
                  </p>
                  <p className="text-sm text-zinc-300">{notification.branch}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="text-lg font-bold text-amber-200">₹{notification.total}</p>
                    <p className="text-xs text-zinc-400">{notification.itemSummary}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    acknowledgeOrder(notification.orderId);
                    focusOrderCard(notification.orderId);
                  }}
                  className="rounded-full bg-amber-400 px-3 py-1.5 text-xs font-bold text-black"
                >
                  View Order
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
            const items = order.items;

            return (
              <div
                key={order.id}
                id={`order-${order.id}`}
                className={`rounded-2xl border p-4 transition ${
                  isNew
                    ? "border-amber-400/50 bg-amber-400/5"
                    : "border-white/10 bg-black/20"
                }`}
                onClick={() => {
                  if (isNew) acknowledgeOrder(order.id);
                }}
              >
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

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => { void handlePrintBill(order); }}
                    className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15 cursor-pointer"
                  >
                    🧾 Print Bill
                  </button>
                  <button
                    type="button"
                    onClick={() => { void handlePrintKot(order); }}
                    className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15 cursor-pointer"
                  >
                    🍳 Print KOT
                  </button>
                  <button
                    type="button"
                    onClick={() => markDone(order.id)}
                    className="rounded-full bg-emerald-400/20 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-400/30 cursor-pointer"
                  >
                    ✓ Done
                  </button>
                </div>

                {printStatus[order.id] && (
                  <p
                    className={`mt-2 text-xs font-semibold ${
                      printStatus[order.id].type === "success" ? "text-emerald-300" : "text-red-300"
                    }`}
                  >
                    {printStatus[order.id].message}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
