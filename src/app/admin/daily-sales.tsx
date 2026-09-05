"use client";

import { useMemo, useState } from "react";

type DailySale = {
  id: string;
  sale_date: string;
  total_orders: number;
  total_sales: number;
  cash_sales: number;
  upi_sales: number;
  card_sales: number;
  east_fort_sales: number;
  west_fort_sales: number;
};

export default function DailySales({ sales }: { sales: DailySale[] }) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const selected = useMemo(
    () => sales.find((sale) => sale.sale_date === selectedDate) ?? null,
    [sales, selectedDate],
  );

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Reports
          </p>
          <h2 className="mt-1 text-2xl font-bold">Daily Sales</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Last 3 days of completed sales summaries.
          </p>
        </div>
      </div>

      {sales.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-white/10 p-6 text-center text-zinc-400">
          No daily sales records yet.
        </div>
      ) : (
        <>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400">
                  <th className="px-3 py-3 font-medium">Date</th>
                  <th className="px-3 py-3 font-medium">Orders</th>
                  <th className="px-3 py-3 font-medium">Total Sales</th>
                  <th className="px-3 py-3 font-medium">Cash</th>
                  <th className="px-3 py-3 font-medium">UPI</th>
                  <th className="px-3 py-3 font-medium">Card</th>
                  <th className="px-3 py-3 font-medium">Outlets</th>
                </tr>
              </thead>

              <tbody>
                {sales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="border-b border-white/5 transition hover:bg-white/5"
                  >
                    <td className="px-3 py-4 font-medium text-white">
                      {new Date(`${sale.sale_date}T00:00:00`).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </td>
                    <td className="px-3 py-4 text-zinc-300">
                      {sale.total_orders}
                    </td>
                    <td className="px-3 py-4 font-semibold text-amber-200">
                      ₹{sale.total_sales.toLocaleString("en-IN")}
                    </td>
                    <td className="px-3 py-4 text-zinc-300">
                      ₹{sale.cash_sales.toLocaleString("en-IN")}
                    </td>
                    <td className="px-3 py-4 text-zinc-300">
                      ₹{sale.upi_sales.toLocaleString("en-IN")}
                    </td>
                    <td className="px-3 py-4 text-zinc-300">
                      ₹{sale.card_sales.toLocaleString("en-IN")}
                    </td>
                    <td className="px-3 py-4">
                      <button
                        type="button"
                        onClick={() => setSelectedDate(sale.sale_date)}
                        className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/15"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selected && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Sales details
                  </p>
                  <h3 className="mt-1 text-lg font-semibold">
                    {new Date(`${selected.sale_date}T00:00:00`).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      },
                    )}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDate(null)}
                  className="rounded-full bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15"
                >
                  Close
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs text-zinc-500">Orders</p>
                  <p className="mt-1 text-xl font-bold">
                    {selected.total_orders}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs text-zinc-500">Total Sales</p>
                  <p className="mt-1 text-xl font-bold text-amber-200">
                    ₹{selected.total_sales.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs text-zinc-500">East Fort</p>
                  <p className="mt-1 text-xl font-bold">
                    ₹{selected.east_fort_sales.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs text-zinc-500">West Fort</p>
                  <p className="mt-1 text-xl font-bold">
                    ₹{selected.west_fort_sales.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
