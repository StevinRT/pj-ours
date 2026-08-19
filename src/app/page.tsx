"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type MenuSize = {
  label: string;
  price: number;
};

type MenuItem = {
  id: number;
  name: string;
  category: string;
  emoji: string;
  description: string;
  badge: string;
  sizes: MenuSize[];
};

type Branch = {
  id: string;
  name: string;
  phone: string;
  maps: string;
  hours: string;
  coords: { lat: number; lng: number };
};

const menuSectionCatalog = [
  {
    category: "Fusion Shakes",
    emoji: "🥤",
    description: "For creamy fusion-style blends and premium take-home servings.",
    badge: "Signature",
    items: [
      ["Apple Chickoo", [70, 135, 255]],
      ["Apple Papaya", [70, 135, 255]],
      ["Badam Pista", [70, 135, 255]],
      ["Chickoo Chocolate", [70, 135, 255]],
      ["Chickoo Sharjah", [70, 135, 255]],
      ["Chickoo Custard Apple", [70, 135, 255]],
      ["Chocolate Caramel", [70, 135, 255]],
      ["Chocolate Oreo", [70, 135, 255]],
      ["Chocolate Sharjah", [70, 135, 255]],
      ["Grape Pineapple", [70, 135, 255]],
      ["Kitkat Oreo", [70, 135, 255]],
      ["Oreo Caramel", [70, 135, 255]],
      ["Oreo Sharjah", [70, 135, 255]],
      ["Papaya Chickoo", [70, 135, 255]],
      ["Papaya Mango", [70, 135, 255]],
      ["Papaya Sharjah", [70, 135, 255]],
      ["Saudi Caramel", [70, 135, 255]],
      ["Sharjah Saudi", [70, 135, 255]],
      ["Tender Butter", [90, 175, 335]],
      ["Tender Cashew", [100, 205, 400]],
      ["Tender Chickoo", [90, 175, 335]],
      ["Tender Dates", [90, 175, 335]],
      ["Tender Mango", [90, 175, 335]],
      ["Tender Caramel", [90, 175, 335]],
      ["Tender Chocolate", [90, 175, 335]],
      ["Avil Milk", [70]],
    ],
  },
  {
    category: "Milk Shake",
    emoji: "🥭",
    description: "Creamy milkshakes with a rich, blended feel.",
    badge: "Creamy",
    items: [
      ["Apple", [60, 125, 250]],
      ["Avocado", [70, 135, 255]],
      ["Avocado Honey", [90, 185, 360]],
      ["Badam", [50, 105, 200]],
      ["Banana", [50, 105, 200]],
      ["Blueberry", [70, 135, 260]],
      ["Boost", [60, 125, 240]],
      ["Brownie", [60, 125, 240]],
      ["Butterscotch", [50, 105, 200]],
      ["Caramel", [60, 125, 240]],
      ["Cherry", [50, 105, 200]],
      ["Chickoo", [60, 125, 240]],
      ["Chocolate", [50, 105, 200]],
      ["Coffee Blast", [60, 125, 240]],
      ["Cold Coffee", [60, 125, 240]],
      ["Custard Apple", [60, 125, 240]],
      ["Dark Fantasy", [50, 105, 200]],
      ["Dates (Saudi)", [50, 105, 200]],
      ["Dragon Fruit", [60, 125, 250]],
      ["Dry Fruits", [80, 165, 320]],
      ["Grapes", [50, 105, 200]],
      ["Guava", [50, 105, 200]],
      ["Horlicks", [60, 125, 240]],
      ["Ice Apple", [60, 125, 240]],
      ["Malai Kulfi", [80, 165, 320]],
      ["Kiwi", [90, 185, 360]],
      ["Lotus", [60, 125, 240]],
      ["Mango", [60, 125, 240]],
      ["Mixed Fruit", [70, 135, 260]],
      ["Muskmelon", [50, 105, 200]],
      ["Oreo", [50, 105, 200]],
      ["Papaya", [50, 105, 200]],
      ["Peanut Butter", [80, 165, 320]],
      ["Pineapple", [50, 105, 200]],
      ["Pista", [50, 105, 200]],
      ["Pomegranate (Anar)", [70, 135, 260]],
      ["Strawberry", [60, 125, 240]],
      ["Dry Fruits Special", [100, 205, 400]],
      ["Vanila", [50, 105, 200]],
      ["Tender Coconut", [70, 145, 280]],
    ],
  },
  {
    category: "Juice",
    emoji: "🍊",
    description: "Fresh juices squeezed for a clean, cooling sip.",
    badge: "Fresh",
    items: [
      ["Anar", [70, 135, 260]],
      ["Apple", [70, 135, 260]],
      ["Carrot", [50, 105, 200]],
      ["Cucumber", [40, 85, 160]],
      ["Dragon Fruit", [60, 125, 250]],
      ["Gooseberry", [70, 135, 260]],
      ["Grape", [50, 105, 200]],
      ["Guava Lemon", [50, 105, 200]],
      ["Kiwi", [80, 165, 320]],
      ["Lemon Fresh", [30, 65, 120]],
      ["Lemon Grape", [50, 105, 200]],
      ["Lemon Mint", [50, 105, 200]],
      ["Lemon Pineapple", [50, 105, 200]],
      ["Mango", [60, 125, 240]],
      ["Mosambi", [60, 125, 240]],
      ["Muskmelon", [50, 105, 200]],
      ["Orange", [60, 125, 240]],
      ["Orange Lemon", [60, 125, 240]],
      ["Papaya", [50, 105, 200]],
      ["Passion Fruit", [80, 165, 320]],
      ["Pineapple", [60, 125, 240]],
      ["Strawberry", [70, 135, 260]],
      ["Watermelon", [50, 105, 200]],
      ["Beetroot", [50, 105, 200]],
      ["ABC", [90, 180, 350]],
      ["Cucumber Lemon", [50, 105, 200]],
      ["Cucumber Pineapple", [60, 125, 250]],
      ["Cucumber Orange", [70, 135, 260]],
    ],
  },
  {
    category: "Ice Cream Shakes",
    emoji: "🍨",
    description: "Classic scoops, frozen favorites, and creamy coolers.",
    badge: "Frozen",
    items: [
      ["Black Currant", [100]],
      ["Butterscotch", [100]],
      ["Choco Chips", [100]],
      ["Chocolate", [100]],
      ["English Delight", [100]],
      ["Fig Dates And Honey", [100]],
      ["Mango", [100]],
      ["Mocha", [100]],
      ["Pineapple", [100]],
      ["Pista", [100]],
      ["Red Velvet", [100]],
      ["Strawberry", [100]],
      ["Vancho", [100]],
      ["Vanila", [100]],
    ],
  },
  {
    category: "Mastani",
    emoji: "🍦",
    description: "Thick, indulgent mastani pours and galaxy blends.",
    badge: "Indulgent",
    items: [
      ["Banana Mastani", [110]],
      ["Mango Mastani", [110]],
      ["Papaya Mastani", [110]],
      ["Pineapple Mastani", [110]],
      ["Avocado Galaxy", [110]],
      ["Banana Galaxy", [110]],
      ["Caramel Galaxy", [110]],
      ["Chickoo Galaxy", [110]],
      ["Grape Galaxy", [110]],
      ["Mango Galaxy", [110]],
      ["Oreo Galaxy", [110]],
      ["Papaya Galaxy", [110]],
      ["Pineapple Galaxy", [110]],
      ["Saudi Galaxy", [110]],
      ["Tender Galaxy", [110]],
    ],
  },
  {
    category: "Mojito",
    emoji: "🌿",
    description: "Minty, sparkling mojitos with lively fruit notes.",
    badge: "Cool",
    items: [
      ["Blue Curacao", [80]],
      ["Blueberry", [80]],
      ["Green Apple", [80]],
      ["Green Seed", [80]],
      ["Hot Gooseberry (spicy)", [80]],
      ["Kiwi", [80]],
      ["Litchi", [80]],
      ["Mango Slice", [80]],
      ["Mexican", [80]],
      ["Mint", [80]],
      ["Red Flame", [80]],
      ["Red Freeze", [80]],
      ["Valencia (Orange)", [80]],
      ["Virgin", [60]],
      ["Wineyard (Grape)", [80]],
      ["Yellow Flower (Pineapple)", [80]],
    ],
  },
  {
    category: "Mocktail",
    emoji: "🍓",
    description: "Fruity mocktails with a lively, refreshing finish.",
    badge: "Sparkling",
    items: [
      ["Carrot Pineapple", [70, 135, 255]],
      ["Grape Pineapple", [70, 135, 255]],
      ["Mosambi Orange", [70, 135, 255]],
      ["Papaya Pineapple", [70, 135, 255]],
      ["Papaya Carrot", [70, 135, 255]],
      ["Shamam Mango", [70, 135, 255]],
      ["Shamam Papaya", [70, 135, 255]],
      ["Water Melon Carrot", [70, 135, 255]],
    ],
  },
  {
    category: "Fruit Soda",
    emoji: "🧃",
    description: "Fruit sodas that are crisp, fizzy, and refreshing.",
    badge: "Bubbly",
    items: [
      ["Anar Soda", [50]],
      ["Apple Soda", [50]],
      ["Carrot Soda", [50]],
      ["Grape Soda", [50]],
      ["Guava Soda", [50]],
      ["Mango Soda", [50]],
      ["Mosambi Soda", [50]],
      ["Orange Soda", [50]],
      ["Passion Fruit Soda", [60]],
      ["Pineapple Soda", [50]],
      ["Shaman Soda", [50]],
    ],
  },
  {
    category: "Falooda",
    emoji: "🍹",
    description: "Layered falooda cups and dessert-style pours.",
    badge: "Layered",
    items: [
      ["Cake Falooda", [175]],
      ["Chocolate Falooda", [170]],
      ["Dry Fruits Falooda", [200]],
      ["Gulab Jamun Falooda", [175]],
      ["Mango Falooda", [160]],
      ["Royal Falooda", [160]],
      ["Royal Falooda Special", [190]],
      ["Strawberry Falooda", [160]],
      ["Pineapple Falooda", [160]],
      ["Fruit Punch Falooda", [170]],
      ["Kulfi Falooda", [170]],
      ["Hawaiian Fresh Fruit Salad", [120]],
    ],
  },
  {
    category: "Ice Cream Desserts",
    emoji: "🍫",
    description: "Rich shakes layered with cookie and ice cream notes.",
    badge: "Rich",
    items: [
      ["Chocolate Brownie Magic", [150]],
      ["Caramel Mocha Sundae", [150]],
      ["Double Chocolate Cookie Fiesta", [150]],
      ["Dry Fruits with Cake", [150]],
      ["Wafer Crown with Cookie", [150]],
      ["Dark Vanilla with Coffee Fills", [150]],
      ["Fruit Salad with Ice Cream", [90]],
    ],
  },
  {
    category: "Desserts",
    emoji: "🍰",
    description: "Sweet desserts and sizzlers to end on a tasty note.",
    badge: "Sweet",
    items: [
      ["Fruit Salad", [70]],
      ["Sizzling Brownie", [140]],
      ["Chocolate Sizzler", [180]],
      ["Strawberry Sizzler", [180]],
      ["Single Scoop", [50]],
      ["Double Scoop", [80]],
    ],
  },
] as const;

const menuItems: MenuItem[] = menuSectionCatalog.flatMap((section, sectionIndex) =>
  section.items.map(([name, prices], itemIndex) => {
    const priceList = [...prices] as number[];
    const sizeLabels =
      priceList.length >= 3
        ? ["Regular", "500 ML", "1 Liter"]
        : priceList.length === 2
          ? ["500 ML", "1 Liter"]
          : ["Regular"];

    return {
      id: sectionIndex * 100 + itemIndex + 1,
      name,
      category: section.category,
      emoji: section.emoji,
      description: section.description,
      badge: section.badge,
      sizes: priceList.map((price, sizeIndex) => ({
        label: sizeLabels[sizeIndex] ?? `Size ${sizeIndex + 1}`,
        price,
      })),
    };
  }),
);

const branches: Branch[] = [
  {
    id: "east-fort",
    name: "East Fort",
    phone: "+918590012678",
    maps: "https://maps.app.goo.gl/ZhTZbv3ixjrjf3Zh8",
    hours: "11:00 AM - 11:00 PM",
    coords: { lat: 8.4874, lng: 76.9569 },
  },
  {
    id: "west-fort",
    name: "West Fort",
    phone: "+917012611090",
    maps: "https://maps.app.goo.gl/8ET1tpA34FwpGELb6",
    hours: "12:00 PM - 10:30 PM",
    coords: { lat: 8.4978, lng: 76.9524 },
  },
];

const categories = ["All", ...new Set(menuItems.map((item) => item.category))];
const bestSellerIds = [1, 5, 12];

const getDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadius = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return 2 * earthRadius * Math.asin(Math.sqrt(a));
};

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [orderType, setOrderType] = useState<"dine-in" | "parcel" | null>(null);
  const [selectedSizeByItem, setSelectedSizeByItem] = useState<Record<number, string>>(() =>
    Object.fromEntries(menuItems.map((item) => [item.id, item.sizes[0]?.label ?? ""])),
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [branchId, setBranchId] = useState(branches[0].id);
  const [suggestedBranchId, setSuggestedBranchId] = useState<string | null>(null);
  const [locationMessage, setLocationMessage] = useState(
    "Allow location access to suggest the nearest branch automatically.",
  );
  const [checkout, setCheckout] = useState({
    name: "",
    phone: "",
    pickupTime: "",
    notes: "",
  });
  const [productAvailability, setProductAvailability] = useState<Record<string, boolean> | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // fly-to-cart animation state
  type FlyingEmoji = { id: number; emoji: string; x: number; y: number; dx: number; dy: number };
  const [flyingEmojis, setFlyingEmojis] = useState<FlyingEmoji[]>([]);
  const [cartBounce, setCartBounce] = useState(false);
  const [poppingItemId, setPoppingItemId] = useState<number | null>(null);
  const flyIdRef = useRef(0);
  // refs to the two cart target elements
  const desktopCartRef = useRef<HTMLElement>(null);
  const mobileCartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = orderType === null ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [orderType]);

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const closest = branches.reduce((best, branch) => {
          const distance = getDistanceKm(
            position.coords.latitude,
            position.coords.longitude,
            branch.coords.lat,
            branch.coords.lng,
          );

          if (!best || distance < best.distance) {
            return { branch, distance };
          }

          return best;
        }, null as { branch: Branch; distance: number } | null);

        if (closest) {
          setSuggestedBranchId(closest.branch.id);
          setBranchId(closest.branch.id);
          setLocationMessage(
            `Nearest branch suggested: ${closest.branch.name} (${closest.distance.toFixed(1)} km away).`,
          );
        }
      },
      () => {
        setLocationMessage(
          "Location permission was not granted, so please choose your preferred branch.",
        );
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  useEffect(() => {
    const loadAvailability = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .select("name, category, available");

      if (error) {
        console.error("Failed to load product availability", error);
        return;
      }

      const nextAvailability = (data ?? []).reduce<Record<string, boolean>>((acc, product) => {
        acc[`${product.name.toLowerCase()}::${product.category.toLowerCase()}`] = product.available;
        return acc;
      }, {});

      setProductAvailability(nextAvailability);
    };

    void loadAvailability();
  }, []);

  const cartItems = useMemo(
    () =>
      menuItems.flatMap((item) =>
        item.sizes
          .filter((size) => (cart[`${item.id}:${size.label}`] ?? 0) > 0)
          .map((size) => ({
            id: item.id,
            name: item.name,
            category: item.category,
            sizeLabel: size.label,
            price: size.price,
            quantity: cart[`${item.id}:${size.label}`] ?? 0,
          })),
      ),
    [cart],
  );

  const filteredItems = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();

    const enrichedItems = menuItems.map((item) => {
      const lookupKey = `${item.name.toLowerCase()}::${item.category.toLowerCase()}`;
      const available = productAvailability?.[lookupKey];

      return {
        ...item,
        available: available ?? true,
      };
    });

    return enrichedItems.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      const matchesSearch =
        normalizedTerm.length === 0 ||
        item.name.toLowerCase().includes(normalizedTerm) ||
        item.description.toLowerCase().includes(normalizedTerm);

      return matchesCategory && matchesSearch;
    });
  }, [productAvailability, searchTerm, selectedCategory]);

  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  );

  const packingCharge = useMemo(
    () => (orderType === "parcel" ? totalItems * 5 : 0),
    [orderType, totalItems],
  );

  const finalTotal = subtotal + packingCharge;

  const selectedBranch = branches.find((branch) => branch.id === branchId) ?? branches[0];

  const getCartKey = (itemId: number, sizeLabel: string) => `${itemId}:${sizeLabel}`;

  const getItemQuantity = (itemId: number) =>
    menuItems
      .find((item) => item.id === itemId)
      ?.sizes.reduce((sum, size) => sum + (cart[getCartKey(itemId, size.label)] ?? 0), 0) ?? 0;

  const addToCart = useCallback(
    (itemId: number, sizeLabel: string, triggerEl?: HTMLButtonElement | null, emoji?: string) => {
      setCart((current) => ({
        ...current,
        [getCartKey(itemId, sizeLabel)]: (current[getCartKey(itemId, sizeLabel)] ?? 0) + 1,
      }));

      // resolve which cart target to fly toward
      if (!triggerEl) return;
      const targetEl = window.innerWidth >= 1024 ? desktopCartRef.current : mobileCartRef.current;
      if (!targetEl) return;

      // pop the source emoji briefly
      setPoppingItemId(itemId);
      setTimeout(() => setPoppingItemId(null), 320);

      const srcRect = triggerEl.getBoundingClientRect();
      const dstRect = targetEl.getBoundingClientRect();

      const startX = srcRect.left + srcRect.width / 2;
      const startY = srcRect.top + srcRect.height / 2;
      const endX = dstRect.left + dstRect.width / 2;
      const endY = dstRect.top + dstRect.height / 2;

      const id = ++flyIdRef.current;
      setFlyingEmojis((prev) => [
        ...prev,
        { id, emoji: emoji ?? "🥤", x: startX, y: startY, dx: endX - startX, dy: endY - startY },
      ]);

      // bounce the cart after the emoji arrives (~620ms)
      setTimeout(() => {
        setCartBounce(true);
        setTimeout(() => setCartBounce(false), 400);
      }, 580);

      // clean up the flying element after animation ends
      setTimeout(() => {
        setFlyingEmojis((prev) => prev.filter((e) => e.id !== id));
      }, 700);
    },
    [],
  );

  const updateQuantity = (itemId: number, sizeLabel: string, delta: number) => {
    const key = getCartKey(itemId, sizeLabel);

    setCart((current) => {
      const nextQty = (current[key] ?? 0) + delta;

      if (nextQty <= 0) {
        const updated = { ...current };
        delete updated[key];
        return updated;
      }

      return { ...current, [key]: nextQty };
    });
  };

  const removeItem = (itemId: number, sizeLabel: string) => {
    const key = getCartKey(itemId, sizeLabel);

    setCart((current) => {
      const updated = { ...current };
      delete updated[key];
      return updated;
    });
  };

  const placeOrder = useCallback(async () => {
    if (!cartItems.length || orderType === null) {
      return;
    }

    setIsPlacingOrder(true);

    // Save order to Supabase so it appears in the admin panel.
    try {
      const supabase = createClient();
      await supabase.from("orders").insert({
        customer_name: checkout.name,
        customer_phone: checkout.phone,
        branch: branchId,
        order_type: orderType,
        items: cartItems.map((item) => ({
          name: item.name,
          sizeLabel: item.sizeLabel,
          price: item.price,
          quantity: item.quantity,
          category: item.category,
        })),
        subtotal,
        packing_charge: packingCharge,
        total: finalTotal,
        special_instructions: (specialInstructions || checkout.notes) || null,
        pickup_time: checkout.pickupTime || null,
      });
    } catch (err) {
      console.error("Order save failed:", err);
    }

    const orderLines = cartItems.map(
      (item) => `${item.quantity} × ${item.name} (${item.sizeLabel}) ₹${item.price * item.quantity}`,
    );

    const message = [
      "🍹 PJ OURS PICKUP ORDER",
      "",
      `Customer: ${checkout.name || "Guest"}`,
      `Phone: ${checkout.phone || "Not provided"}`,
      "",
      `Pickup Time: ${checkout.pickupTime || "As soon as possible"}`,
      "",
      "Branch:",
      selectedBranch.name,
      "",
      "Items:",
      ...orderLines,
      "",
      `Order type: ${orderType === "parcel" ? "Parcel" : "Dine In"}`,
      `Packing charge: ₹${packingCharge}`,
      "",
      "Total:",
      `₹${finalTotal}`,
      "",
      "Notes:",
      specialInstructions || checkout.notes || "No special instructions.",
      "",
      "Thank you!",
    ].join("\n");

    const url = `https://wa.me/${selectedBranch.phone.replace(/\s+/g, "")}?text=${encodeURIComponent(
      message,
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");

    setIsPlacingOrder(false);
  }, [cartItems, orderType, checkout, branchId, selectedBranch, subtotal, packingCharge, finalTotal, specialInstructions]);

  return (
    <main className="min-h-screen bg-[#09090b] pb-24 text-white lg:pb-0">
      {/* flying emoji particles – rendered at fixed positions over entire viewport */}
      {flyingEmojis.map((fe) => (
        <span
          key={fe.id}
          className="fly-emoji"
          style={{
            left: fe.x - 16,
            top: fe.y - 16,
            "--fly-dx": `${fe.dx}px`,
            "--fly-dy": `${fe.dy}px`,
          } as React.CSSProperties}
        >
          {fe.emoji}
        </span>
      ))}
      {orderType === null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-zinc-900 p-6 shadow-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">Welcome</p>
            <h2 className="mt-2 text-2xl font-bold">How would you like your order?</h2>
            <div className="mt-5 grid gap-3">
              <button
                onClick={() => setOrderType("dine-in")}
                className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-left text-lg font-semibold transition hover:bg-white/10"
              >
                🍽️ Dine In
              </button>
              <button
                onClick={() => setOrderType("parcel")}
                className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-left text-lg font-semibold transition hover:bg-white/10"
              >
                📦 Parcel
              </button>
            </div>
            <p className="mt-4 text-sm text-zinc-300">Please select one option to continue.</p>
          </div>
        </div>
      )}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.22),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.3),_transparent_40%)]" />
        <div className="relative mx-auto flex max-w-7xl flex-col px-4 pb-12 pt-6 sm:px-6 lg:px-8">
          <header className="mb-8 flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 py-3 backdrop-blur md:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white/10">
                <img
                  src="/logo.png"
                  alt="PJ Ours logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-[0.3em] text-amber-300">PJ OURS</p>
                <p className="text-xs text-zinc-300">Pickup Ordering</p>
              </div>
            </div>
            <div className="relative flex items-center gap-2">
              <a
                href="#checkout"
                className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-300"
              >
                Order Now
              </a>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Open menu"
                className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/5 transition hover:bg-white/10"
              >
                <span className="block h-0.5 w-4 bg-white" />
                <span className="block h-0.5 w-4 bg-white" />
                <span className="block h-0.5 w-4 bg-white" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-11 z-50 min-w-[160px] rounded-2xl border border-white/10 bg-zinc-900 py-2 shadow-2xl">
                  <a
                    href="https://www.pjours.in/admin"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
                  >
                    Admin Panel
                  </a>
                </div>
              )}
            </div>
          </header>

          <div className="grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr]">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <span className="inline-flex rounded-full border border-emerald-400/40 bg-emerald-400/10 px-4 py-1 text-sm text-emerald-200">
                Premium juice & shake pickup experience
              </span>
              <div className="space-y-4">
                <h1 className="text-5xl font-black leading-tight sm:text-6xl">
                  Fresh blends made for the fastest pickup orders.
                </h1>
                <p className="max-w-xl text-lg text-zinc-300">
                  Browse the handcrafted menu, build your cart in seconds, and send a formatted WhatsApp order straight to your nearest PJ Ours branch.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href="#checkout"
                  className="rounded-full bg-amber-400 px-6 py-3 text-center font-semibold text-black transition hover:bg-amber-300"
                >
                  Order Now
                </a>
                <a
                  href="#menu"
                  className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-center font-semibold text-white transition hover:bg-white/10"
                >
                  View Menu
                </a>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-2xl font-bold text-amber-300">2</p>
                  <p className="text-sm text-zinc-300">Outlet branches</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-2xl font-bold text-emerald-300">2 min</p>
                  <p className="text-sm text-zinc-300">Quick checkout flow</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-2xl font-bold text-rose-300">24/7</p>
                  <p className="text-sm text-zinc-300">Online ordering vibe</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-amber-500/20 to-emerald-500/10 p-4 shadow-2xl"
            >
              <div className="grid min-h-[420px] grid-cols-2 gap-3">
                <div className="rounded-[1.5rem] bg-gradient-to-br from-amber-300 to-orange-500 p-6 text-black">
                  <div className="text-6xl">🥤</div>
                  <p className="mt-4 text-sm font-bold uppercase">Freshly blended</p>
                </div>
                <div className="rounded-[1.5rem] bg-gradient-to-br from-cyan-300 to-sky-500 p-6 text-slate-950">
                  <div className="text-6xl">🍹</div>
                  <p className="mt-4 text-sm font-bold uppercase">Cool & vibrant</p>
                </div>
                <div className="col-span-2 rounded-[1.5rem] bg-black/30 p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white">Best sellers</span>
                    <span className="text-xs text-zinc-300">Updated daily</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {menuItems
                      .filter((item) => bestSellerIds.includes(item.id))
                      .map((item) => (
                        <div key={item.id} className="rounded-2xl bg-white/5 p-3 text-center">
                          <div className="text-3xl">{item.emoji}</div>
                          <p className="mt-2 font-semibold">{item.name}</p>
                          <p className="text-sm text-zinc-300">₹{item.sizes[0]?.price ?? 0}</p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="menu" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.4em] text-amber-300">Interactive Menu</p>
                <h2 className="mt-2 text-3xl font-bold">Build your pickup order</h2>
              </div>
              <div className="flex w-full max-w-xl flex-col gap-3 md:flex-row">
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search drinks or shakes"
                  className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-zinc-400"
                />
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        selectedCategory === category
                          ? "bg-amber-400 text-black"
                          : "border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map((item) => {
                const selectedSizeLabel = selectedSizeByItem[item.id] ?? item.sizes[0]?.label ?? "";
                const selectedSize = item.sizes.find((size) => size.label === selectedSizeLabel) ?? item.sizes[0];

                return (
                  <motion.article
                    key={item.id}
                    layout
                    className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/5"
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-200">
                          {item.badge}
                        </span>
                        <span className={`text-4xl inline-block ${poppingItemId === item.id ? "emoji-pop" : ""}`}>{item.emoji}</span>
                      </div>
                      <div className="mt-4 space-y-2">
                        <h3 className="text-xl font-semibold">{item.name}</h3>
                        <p className="text-sm text-zinc-300">{item.description}</p>
                        {"available" in item && item.available === false ? (
                          <p className="text-sm font-semibold text-rose-300">Out of Stock</p>
                        ) : null}
                        <p className="text-lg font-bold text-amber-300">₹{selectedSize?.price ?? 0}</p>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        {item.sizes.map((size) => (
                          <button
                            key={`${item.id}-${size.label}`}
                            onClick={() =>
                              setSelectedSizeByItem((current) => ({ ...current, [item.id]: size.label }))
                            }
                            className={`rounded-xl border px-2 py-2 text-left text-xs transition ${
                              selectedSizeLabel === size.label
                                ? "border-amber-300 bg-amber-400/15 text-amber-100"
                                : "border-white/10 bg-black/20 text-zinc-200"
                            }`}
                          >
                            <div className="font-semibold">{size.label}</div>
                            <div className="text-[11px] text-zinc-300">₹{size.price}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/10 p-4">
                      <div className="flex items-center gap-2 rounded-full bg-black/20 px-2 py-1">
                        <button
                          onClick={() => updateQuantity(item.id, selectedSizeLabel, -1)}
                          className="h-8 w-8 rounded-full bg-white/10 text-lg text-white"
                        >
                          −
                        </button>
                        <span className="min-w-6 text-center text-sm font-semibold">
                          {getItemQuantity(item.id)}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, selectedSizeLabel, 1)}
                          className="h-8 w-8 rounded-full bg-white/10 text-lg text-white"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={(e) => addToCart(item.id, selectedSizeLabel, e.currentTarget, item.emoji)}
                        disabled={"available" in item && item.available === false}
                        className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-300"
                      >
                        {"available" in item && item.available === false ? "Out of Stock" : "Add to Cart"}
                      </button>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>

          <aside
            ref={desktopCartRef}
            id="order-summary"
            className="h-fit rounded-[1.6rem] border border-white/10 bg-white/5 p-4 sm:p-6 lg:sticky lg:top-6"
          >
            <div className="mb-4 flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">Shopping Cart</p>
                <h2 className="mt-2 text-2xl font-bold">Your order</h2>
              </div>
              <div className={`rounded-full bg-amber-400/15 px-3 py-1 text-sm font-semibold text-amber-200 ${cartBounce ? "cart-bounce" : ""}`}>
                Total ₹{finalTotal}
              </div>
            </div>

            <div className="mb-4 rounded-2xl border border-white/10 bg-black/20 p-3 text-sm">
              <p className="mb-2 text-zinc-300">Order type</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setOrderType("dine-in")}
                  className={`rounded-xl px-3 py-2 font-semibold transition ${
                    orderType === "dine-in" ? "bg-amber-400 text-black" : "bg-white/10 text-white"
                  }`}
                >
                  🍽️ Dine In
                </button>
                <button
                  onClick={() => setOrderType("parcel")}
                  className={`rounded-xl px-3 py-2 font-semibold transition ${
                    orderType === "parcel" ? "bg-amber-400 text-black" : "bg-white/10 text-white"
                  }`}
                >
                  📦 Parcel
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {cartItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-6 text-center text-zinc-300">
                  Your cart is empty. Add a few drinks to get started.
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={`${item.id}-${item.sizeLabel}`} className="rounded-2xl bg-black/20 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-zinc-300">
                          {item.sizeLabel} • ₹{item.price} each
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id, item.sizeLabel)}
                        className="text-sm text-rose-300"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.sizeLabel, -1)}
                        className="h-8 w-8 rounded-full bg-white/10 text-lg"
                      >
                        −
                      </button>
                      <span className="min-w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.sizeLabel, 1)}
                        className="h-8 w-8 rounded-full bg-white/10 text-lg"
                      >
                        +
                      </button>
                      <span className="ml-auto font-semibold text-amber-300">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm">
              <div className="flex items-center justify-between text-zinc-300">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-zinc-300">
                <span>Packing charge (₹5 × {totalItems} items)</span>
                <span>₹{packingCharge}</span>
              </div>
              <div className="mt-3 border-t border-white/10 pt-3 text-base font-semibold text-amber-200">
                <div className="flex items-center justify-between">
                  <span>Final total</span>
                  <span>₹{finalTotal}</span>
                </div>
              </div>
            </div>

            <label className="mt-4 block text-sm text-zinc-300">
              Special instructions
              <textarea
                value={specialInstructions}
                onChange={(event) => setSpecialInstructions(event.target.value)}
                rows={4}
                placeholder="Less sugar, extra ice, no nuts, etc."
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-zinc-400"
              />
            </label>

            <a
              href="#checkout"
              className="mt-4 inline-flex rounded-full bg-amber-400 px-5 py-2.5 font-semibold text-black transition hover:bg-amber-300"
            >
              Continue to checkout
            </a>
          </aside>
        </div>
      </section>

      <div ref={mobileCartRef} className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-zinc-950/95 p-3 backdrop-blur lg:hidden">
        <a
          href="#order-summary"
          className={`flex items-center justify-between rounded-2xl bg-amber-400 px-4 py-3 font-semibold text-black ${cartBounce ? "cart-bounce" : ""}`}
        >
          <span>{totalItems} items • ₹{finalTotal}</span>
          <span>View Cart</span>
        </a>
      </div>

      <section id="checkout" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5 sm:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-300">Checkout</p>
            <h2 className="mt-2 text-3xl font-bold">Pickup details</h2>
            <div className="mt-5 space-y-4">
              <label className="block text-sm">
                <span className="mb-2 block text-zinc-300">Name</span>
                <input
                  value={checkout.name}
                  onChange={(event) =>
                    setCheckout((current) => ({ ...current, name: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-2 block text-zinc-300">Mobile number</span>
                <input
                  value={checkout.phone}
                  onChange={(event) =>
                    setCheckout((current) => ({ ...current, phone: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-2 block text-zinc-300">Pickup time</span>
                <input
                  value={checkout.pickupTime}
                  onChange={(event) =>
                    setCheckout((current) => ({ ...current, pickupTime: event.target.value }))
                  }
                  placeholder="6:30 PM"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-2 block text-zinc-300">Notes</span>
                <textarea
                  value={checkout.notes}
                  onChange={(event) =>
                    setCheckout((current) => ({ ...current, notes: event.target.value }))
                  }
                  rows={3}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                />
              </label>
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-white/10 bg-gradient-to-br from-amber-500/10 to-rose-500/10 p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">Outlet selection</p>
                <h2 className="mt-2 text-2xl font-bold">Choose your pickup branch</h2>
              </div>
              <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-zinc-200">
                {locationMessage}
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {branches.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => setBranchId(branch.id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    branch.id === branchId
                      ? "border-amber-300 bg-amber-400/10"
                      : "border-white/10 bg-black/20 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">📍 {branch.name}</p>
                      <p className="text-sm text-zinc-300">{branch.hours}</p>
                    </div>
                    <div className="text-xs text-zinc-200">
                      {branch.id === suggestedBranchId ? "Suggested" : "Available"}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-2xl bg-black/20 p-4">
              <p className="font-semibold">Selected outlet: {selectedBranch.name}</p>
              <p className="text-sm text-zinc-300">WhatsApp: {selectedBranch.phone}</p>
              <p className="text-sm text-zinc-300">Opening hours: {selectedBranch.hours}</p>
              <a
                href={selectedBranch.maps}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white"
              >
                Open Google Maps
              </a>
            </div>

            <button
              onClick={() => { void placeOrder(); }}
              disabled={isPlacingOrder || !cartItems.length || orderType === null}
              className="mt-5 w-full rounded-full bg-emerald-400 px-5 py-3 font-semibold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-300"
            >
              {isPlacingOrder ? "Placing order…" : "Send order to WhatsApp"}
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-300">Gallery</p>
            <h3 className="mt-2 text-2xl font-bold">Snap the experience</h3>
            <p className="mt-2 text-zinc-300">A vibrant lookbook of drinks, shakes, and bright counter moments.</p>
          </div>
          <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-300">Reviews</p>
            <h3 className="mt-2 text-2xl font-bold">“Fast, fresh, and fun.”</h3>
            <p className="mt-2 text-zinc-300">Customers love the premium vibe, smooth ordering, and fresh pickup experience.</p>
          </div>
          <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-300">Contact</p>
            <h3 className="mt-2 text-2xl font-bold">Visit or connect</h3>
            <p className="mt-2 text-zinc-300">Instagram, Facebook, and direct branch contacts can be added in the admin flow.</p>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-4 py-8 text-center text-sm text-zinc-400 sm:px-6 lg:px-8">
        PJ Ours • Premium juice, shake, and pickup ordering.
      </footer>
    </main>
  );
}
