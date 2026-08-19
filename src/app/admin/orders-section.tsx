"use client";

import { useState } from "react";

import type { Product } from "@/lib/products";

import LiveOrders from "./live-orders";
import PunchOrder from "./punch-order";

export default function AdminOrdersSection({ products }: { products: Product[] }) {
  const [showPunchOrder, setShowPunchOrder] = useState(false);

  return (
    <>
      <LiveOrders onPunchOrder={() => setShowPunchOrder(true)} />
      {showPunchOrder && (
        <PunchOrder
          products={products}
          onClose={() => setShowPunchOrder(false)}
        />
      )}
    </>
  );
}
