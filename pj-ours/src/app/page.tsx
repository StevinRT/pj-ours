"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type Variant = {
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
  variants: Variant[];
};

type Branch = {
  id: string;
  name: string;
  phone: string;
  maps: string;
  hours: string;
  coords: { lat: number; lng: number };
};

const menuItems: MenuItem[] = [
  {
    id: 1,
    name: "Apple Chickoo",
    category: "Special Shake",
    emoji: "🍏",
    description: "Bright apple-chickoo blend with a creamy finish.",
    badge: "Signature",
    variants: [
      { label: "500 ML", price: 70 },
      { label: "Parcel", price: 135 },
      { label: "1 Liter", price: 255 },
    ],
  },
  {
    id: 2,
    name: "Apple Papaya",
    category: "Special Shake",
    emoji: "🥭",
    description: "Smooth papaya sweetness with a clean apple lift.",
    badge: "Fresh",
    variants: [
      { label: "500 ML", price: 70 },
      { label: "Parcel", price: 135 },
      { label: "1 Liter", price: 255 },
    ],
  },
  {
    id: 3,
    name: "Badam Pista",
    category: "Special Shake",
    emoji: "🌰",
    description: "Nutty richness with a soft creamy body.",
    badge: "Premium",
    variants: [
      { label: "500 ML", price: 70 },
      { label: "Parcel", price: 135 },
      { label: "1 Liter", price: 255 },
    ],
  },
  {
    id: 4,
    name: "Chickoo Chocolate",
    category: "Special Shake",
    emoji: "🍫",
    description: "Soft chickoo notes blended with chocolate depth.",
    badge: "Rich",
    variants: [
      { label: "500 ML", price: 70 },
      { label: "Parcel", price: 135 },
      { label: "1 Liter", price: 255 },
    ],
  },
  {
    id: 5,
    name: "Chickoo Sharjah",
    category: "Special Shake",
    emoji: "🥭",
    description: "A classic chickoo shake with a bold sweet finish.",
    badge: "Classic",
    variants: [
      { label: "500 ML", price: 70 },
      { label: "Parcel", price: 135 },
      { label: "1 Liter", price: 255 },
    ],
  },
  {
    id: 6,
    name: "Chickoo Custard Apple",
    category: "Special Shake",
    emoji: "🍐",
    description: "Silky custard apple with a mellow chickoo base.",
    badge: "Smooth",
    variants: [
      { label: "500 ML", price: 70 },
      { label: "Parcel", price: 135 },
      { label: "1 Liter", price: 255 },
    ],
  },
  {
    id: 7,
    name: "Chocolate Caramel",
    category: "Special Shake",
    emoji: "🍫",
    description: "Velvety chocolate with a caramel swirled kick.",
    badge: "Sweet",
    variants: [
      { label: "500 ML", price: 70 },
      { label: "Parcel", price: 135 },
      { label: "1 Liter", price: 255 },
    ],
  },
  {
    id: 8,
    name: "Chocolate Oreo",
    category: "Special Shake",
    emoji: "🍪",
    description: "Cookie crunch meets rich chocolate shake style.",
    badge: "Favourite",
    variants: [
      { label: "500 ML", price: 70 },
      { label: "Parcel", price: 135 },
      { label: "1 Liter", price: 255 },
    ],
  },
  {
    id: 9,
    name: "Chocolate Sharjah",
    category: "Special Shake",
    emoji: "🍫",
    description: "Chocolate-forward shake with a smooth dense body.",
    badge: "Popular",
    variants: [
      { label: "500 ML", price: 70 },
      { label: "Parcel", price: 135 },
      { label: "1 Liter", price: 255 },
    ],
  },
  {
    id: 10,
    name: "Grape Pineapple",
    category: "Special Shake",
    emoji: "🍇",
    description: "A bright tropical mix with juicy grape sweetness.",
    badge: "Tropical",
    variants: [
      { label: "500 ML", price: 70 },
      { label: "Parcel", price: 135 },
      { label: "1 Liter", price: 255 },
    ],
  },
  {
    id: 11,
    name: "Kitkat Oreo",
    category: "Special Shake",
    emoji: "🍫",
    description: "Crunchy candy-inspired shake with creamy texture.",
    badge: "Candy Twist",
    variants: [
      { label: "500 ML", price: 70 },
      { label: "Parcel", price: 135 },
      { label: "1 Liter", price: 255 },
    ],
  },
  {
    id: 12,
    name: "Oreo Caramel",
    category: "Special Shake",
    emoji: "🥤",
    description: "Creamy caramel and biscuit blend with extra richness.",
    badge: "Soft",
    variants: [
      { label: "500 ML", price: 70 },
      { label: "Parcel", price: 135 },
      { label: "1 Liter", price: 255 },
    ],
  },
  {
    id: 13,
    name: "Oreo Sharjah",
    category: "Special Shake",
    emoji: "🍪",
    description: "Balanced biscuit shake with a smooth dessert finish.",
    badge: "Classic",
    variants: [
      { label: "500 ML", price: 70 },
      { label: "Parcel", price: 135 },
      { label: "1 Liter", price: 255 },
    ],
  },
  {
    id: 14,
    name: "Papaya Chickoo",
    category: "Special Shake",
    emoji: "🥭",
    description: "A mellow fruit blend for a fresh tropical sip.",
    badge: "Smooth",
    variants: [
      { label: "500 ML", price: 70 },
      { label: "Parcel", price: 135 },
      { label: "1 Liter", price: 255 },
    ],
  },
  {
    id: 15,
    name: "Papaya Mango",
    category: "Special Shake",
    emoji: "🥭",
    description: "A juicy fruit blend with a rich creamy balance.",
    badge: "Sunny",
    variants: [
      { label: "500 ML", price: 70 },
      { label: "Parcel", price: 135 },
      { label: "1 Liter", price: 255 },
    ],
  },
  {
    id: 16,
    name: "Papaya Sharjah",
    category: "Special Shake",
    emoji: "🥭",
    description: "Papaya-based shake with a mellow sweet finish.",
    badge: "Artsy",
    variants: [
      { label: "500 ML", price: 70 },
      { label: "Parcel", price: 135 },
      { label: "1 Liter", price: 255 },
    ],
  },
  {
    id: 17,
    name: "Saudi Caramel",
    category: "Special Shake",
    emoji: "🍯",
    description: "Golden caramel tones with a smooth dessert profile.",
    badge: "Rich",
    variants: [
      { label: "500 ML", price: 70 },
      { label: "Parcel", price: 135 },
      { label: "1 Liter", price: 255 },
    ],
  },
  {
    id: 18,
    name: "Sharjah Saudi",
    category: "Special Shake",
    emoji: "🌟",
    description: "A sweet, creamy indulgence with a classic café profile.",
    badge: "Cafe Special",
    variants: [
      { label: "500 ML", price: 70 },
      { label: "Parcel", price: 135 },
      { label: "1 Liter", price: 255 },
    ],
  },
  {
    id: 19,
    name: "Tender Butter",
    category: "Milk Shake",
    emoji: "🧈",
    description: "Creamy butter-flavoured shake with a mellow finish.",
    badge: "Smooth",
    variants: [
      { label: "500 ML", price: 90 },
      { label: "Parcel", price: 175 },
      { label: "1 Liter", price: 335 },
    ],
  },
  {
    id: 20,
    name: "Tender Cashew",
    category: "Milk Shake",
    emoji: "🥭",
    description: "Silky cashew-based shake with a premium aftertaste.",
    badge: "Nutty",
    variants: [
      { label: "500 ML", price: 100 },
      { label: "Parcel", price: 205 },
      { label: "1 Liter", price: 400 },
    ],
  },
  {
    id: 21,
    name: "Tender Chickoo",
    category: "Milk Shake",
    emoji: "🥭",
    description: "Comforting chickoo shake for a rich fruit-driven sip.",
    badge: "Classic",
    variants: [
      { label: "500 ML", price: 90 },
      { label: "Parcel", price: 175 },
      { label: "1 Liter", price: 335 },
    ],
  },
  {
    id: 22,
    name: "Tender Dates",
    category: "Milk Shake",
    emoji: "🌙",
    description: "Mild date sweetness with a smooth creamy finish.",
    badge: "Dessert",
    variants: [
      { label: "500 ML", price: 90 },
      { label: "Parcel", price: 175 },
      { label: "1 Liter", price: 335 },
    ],
  },
  {
    id: 23,
    name: "Tender Mango",
    category: "Milk Shake",
    emoji: "🥭",
    description: "Tropical mango richness in a lush smooth shake.",
    badge: "Summer",
    variants: [
      { label: "500 ML", price: 90 },
      { label: "Parcel", price: 175 },
      { label: "1 Liter", price: 335 },
    ],
  },
  {
    id: 24,
    name: "Tender Caramel",
    category: "Milk Shake",
    emoji: "🍯",
    description: "Creamy caramel shake with a smooth indulgent body.",
    badge: "Caramel",
    variants: [
      { label: "500 ML", price: 90 },
      { label: "Parcel", price: 175 },
      { label: "1 Liter", price: 335 },
    ],
  },
  {
    id: 25,
    name: "Tender Chocolate",
    category: "Milk Shake",
    emoji: "🍫",
    description: "Classic chocolate comfort with a velvety finish.",
    badge: "Classic",
    variants: [
      { label: "500 ML", price: 90 },
      { label: "Parcel", price: 175 },
      { label: "1 Liter", price: 335 },
    ],
  },
  {
    id: 26,
    name: "Anar",
    category: "Juice",
    emoji: "🍎",
    description: "Fresh pomegranate juice with a tart fruit burst.",
    badge: "Juicy",
    variants: [
      { label: "500 ML", price: 70 },
      { label: "Parcel", price: 135 },
      { label: "1 Liter", price: 260 },
    ],
  },
  {
    id: 27,
    name: "Apple",
    category: "Juice",
    emoji: "🍏",
    description: "Crisp apple refreshment with a clean finish.",
    badge: "Fresh",
    variants: [
      { label: "500 ML", price: 70 },
      { label: "Parcel", price: 135 },
      { label: "1 Liter", price: 260 },
    ],
  },
  {
    id: 28,
    name: "Carrot",
    category: "Juice",
    emoji: "🥕",
    description: "Bright carrot juice with a natural sweet finish.",
    badge: "Healthy",
    variants: [
      { label: "500 ML", price: 50 },
      { label: "Parcel", price: 105 },
      { label: "1 Liter", price: 200 },
    ],
  },
  {
    id: 29,
    name: "Cucumber",
    category: "Juice",
    emoji: "🥒",
    description: "Cooling cucumber refreshment with a light finish.",
    badge: "Cool",
    variants: [
      { label: "500 ML", price: 40 },
      { label: "Parcel", price: 85 },
      { label: "1 Liter", price: 160 },
    ],
  },
  {
    id: 30,
    name: "Dragon Fruit",
    category: "Juice",
    emoji: "🐉",
    description: "Vitamin-rich dragon fruit with a gentle sweetness.",
    badge: "Tropical",
    variants: [
      { label: "500 ML", price: 60 },
      { label: "Parcel", price: 125 },
      { label: "1 Liter", price: 250 },
    ],
  },
  {
    id: 31,
    name: "Gooseberry",
    category: "Juice",
    emoji: "🍏",
    description: "Tangy gooseberry juice with a fresh zesty taste.",
    badge: "Zesty",
    variants: [
      { label: "500 ML", price: 70 },
      { label: "Parcel", price: 135 },
      { label: "1 Liter", price: 260 },
    ],
  },
  {
    id: 32,
    name: "Grape",
    category: "Juice",
    emoji: "🍇",
    description: "Bold grape juice with a sweet refreshing finish.",
    badge: "Classic",
    variants: [
      { label: "500 ML", price: 50 },
      { label: "Parcel", price: 105 },
      { label: "1 Liter", price: 200 },
    ],
  },
  {
    id: 33,
    name: "Guava Lemon",
    category: "Juice",
    emoji: "🍈",
    description: "A crisp tangy cup with guava brightness.",
    badge: "Citrus",
    variants: [
      { label: "500 ML", price: 50 },
      { label: "Parcel", price: 105 },
      { label: "1 Liter", price: 200 },
    ],
  },
  {
    id: 34,
    name: "Kiwi",
    category: "Juice",
    emoji: "🥝",
    description: "Fresh kiwi juice with a vibrant green finish.",
    badge: "Bright",
    variants: [
      { label: "500 ML", price: 80 },
      { label: "Parcel", price: 165 },
      { label: "1 Liter", price: 320 },
    ],
  },
  {
    id: 35,
    name: "Lemon Fresh",
    category: "Juice",
    emoji: "🍋",
    description: "Cool lemon refreshment with a crisp clean edge.",
    badge: "Refreshing",
    variants: [
      { label: "500 ML", price: 30 },
      { label: "Parcel", price: 65 },
      { label: "1 Liter", price: 120 },
    ],
  },
  {
    id: 36,
    name: "Lemon Soda Chilli",
    category: "Juice",
    emoji: "🌶️",
    description: "Spiced lemonade with a zesty sparkling feel.",
    badge: "Bold",
    variants: [
      { label: "500 ML", price: 40 },
      { label: "Parcel", price: 85 },
      { label: "1 Liter", price: 160 },
    ],
  },
  {
    id: 37,
    name: "Lemon Grape",
    category: "Juice",
    emoji: "🍇",
    description: "A sweet grape twist on lemon sparkle.",
    badge: "Classic",
    variants: [
      { label: "500 ML", price: 50 },
      { label: "Parcel", price: 105 },
      { label: "1 Liter", price: 200 },
    ],
  },
  {
    id: 38,
    name: "Lemon Mint",
    category: "Juice",
    emoji: "🍋",
    description: "Minty lemon cooler for a brisk clean refresher.",
    badge: "Cooling",
    variants: [
      { label: "500 ML", price: 50 },
      { label: "Parcel", price: 105 },
      { label: "1 Liter", price: 200 },
    ],
  },
  {
    id: 39,
    name: "Lemon Pineapple",
    category: "Juice",
    emoji: "🍍",
    description: "Sweet pineapple paired with crisp lemon freshness.",
    badge: "Tropical",
    variants: [
      { label: "500 ML", price: 50 },
      { label: "Parcel", price: 105 },
      { label: "1 Liter", price: 200 },
    ],
  },
  {
    id: 40,
    name: "Mango",
    category: "Juice",
    emoji: "🥭",
    description: "Sweet mango juice with a mellow tropical body.",
    badge: "Best Seller",
    variants: [
      { label: "500 ML", price: 60 },
      { label: "Parcel", price: 125 },
      { label: "1 Liter", price: 240 },
    ],
  },
  {
    id: 41,
    name: "Mosambi",
    category: "Juice",
    emoji: "🍊",
    description: "Light, clean mosambi with a bright citrus profile.",
    badge: "Bright",
    variants: [
      { label: "500 ML", price: 60 },
      { label: "Parcel", price: 125 },
      { label: "1 Liter", price: 240 },
    ],
  },
  {
    id: 42,
    name: "Muskmelon",
    category: "Juice",
    emoji: "🍈",
    description: "Cool muskmelon juice with a soft mellow finish.",
    badge: "Smooth",
    variants: [
      { label: "500 ML", price: 50 },
      { label: "Parcel", price: 105 },
      { label: "1 Liter", price: 200 },
    ],
  },
  {
    id: 43,
    name: "Orange",
    category: "Juice",
    emoji: "🍊",
    description: "Classic orange juice with a juicy, citrus punch.",
    badge: "Classic",
    variants: [
      { label: "500 ML", price: 60 },
      { label: "Parcel", price: 125 },
      { label: "1 Liter", price: 240 },
    ],
  },
  {
    id: 44,
    name: "Orange Lemon",
    category: "Juice",
    emoji: "🍋",
    description: "A vibrant citrus blend with a zesty finish.",
    badge: "Zesty",
    variants: [
      { label: "500 ML", price: 60 },
      { label: "Parcel", price: 125 },
      { label: "1 Liter", price: 240 },
    ],
  },
  {
    id: 45,
    name: "Papaya",
    category: "Juice",
    emoji: "🥭",
    description: "Papaya juice with a creamy and mellow taste.",
    badge: "Soft",
    variants: [
      { label: "500 ML", price: 50 },
      { label: "Parcel", price: 105 },
      { label: "1 Liter", price: 200 },
    ],
  },
  {
    id: 46,
    name: "Passion Fruit",
    category: "Juice",
    emoji: "🍍",
    description: "Exotic passion fruit with a juicy tropical finish.",
    badge: "Exotic",
    variants: [
      { label: "500 ML", price: 80 },
      { label: "Parcel", price: 165 },
      { label: "1 Liter", price: 320 },
    ],
  },
  {
    id: 47,
    name: "Pineapple",
    category: "Juice",
    emoji: "🍍",
    description: "Sweet pineapple juice made for a sunny refresh.",
    badge: "Tropical",
    variants: [
      { label: "500 ML", price: 60 },
      { label: "Parcel", price: 125 },
      { label: "1 Liter", price: 240 },
    ],
  },
  {
    id: 48,
    name: "Strawberry",
    category: "Juice",
    emoji: "🍓",
    description: "Fresh strawberry juice with a bold fruit finish.",
    badge: "Sweet",
    variants: [
      { label: "500 ML", price: 70 },
      { label: "Parcel", price: 135 },
      { label: "1 Liter", price: 260 },
    ],
  },
  {
    id: 49,
    name: "Watermelon",
    category: "Juice",
    emoji: "🍉",
    description: "Juicy and chilled watermelon refresher.",
    badge: "Cool",
    variants: [
      { label: "500 ML", price: 50 },
      { label: "Parcel", price: 105 },
      { label: "1 Liter", price: 200 },
    ],
  },
  {
    id: 50,
    name: "Beetroot",
    category: "Fusion Shake",
    emoji: "🫚",
    description: "Earthy beetroot fusion with a sweet, smooth finish.",
    badge: "Healthy",
    variants: [
      { label: "500 ML", price: 50 },
      { label: "Parcel", price: 105 },
      { label: "1 Liter", price: 200 },
    ],
  },
  {
    id: 51,
    name: "ABC",
    category: "Fusion Shake",
    emoji: "🧃",
    description: "A classic mixed fruit fusion for a full-bodied sip.",
    badge: "Classic",
    variants: [
      { label: "500 ML", price: 90 },
      { label: "Parcel", price: 180 },
      { label: "1 Liter", price: 350 },
    ],
  },
  {
    id: 52,
    name: "Cucumber Lemon",
    category: "Fusion Shake",
    emoji: "🥒",
    description: "Fresh cucumber with refreshing lemon sparkle.",
    badge: "Cooling",
    variants: [
      { label: "500 ML", price: 50 },
      { label: "Parcel", price: 105 },
      { label: "1 Liter", price: 200 },
    ],
  },
  {
    id: 53,
    name: "Cucumber Pineapple",
    category: "Fusion Shake",
    emoji: "🥒",
    description: "Cool cucumber fused with bright pineapple sweetness.",
    badge: "Tropical",
    variants: [
      { label: "500 ML", price: 60 },
      { label: "Parcel", price: 125 },
      { label: "1 Liter", price: 250 },
    ],
  },
  {
    id: 54,
    name: "Cucumber Orange",
    category: "Fusion Shake",
    emoji: "🍊",
    description: "Crisp cucumber layered with citrus punch.",
    badge: "Bright",
    variants: [
      { label: "500 ML", price: 70 },
      { label: "Parcel", price: 135 },
      { label: "1 Liter", price: 260 },
    ],
  },
  {
    id: 55,
    name: "Avocado",
    category: "Milk Shake",
    emoji: "🥑",
    description: "Creamy avocado shake with a softly rich finish.",
    badge: "Smooth",
    variants: [
      { label: "500 ML", price: 60 },
      { label: "Parcel", price: 125 },
      { label: "1 Liter", price: 250 },
    ],
  },
  {
    id: 56,
    name: "Avocado Honey",
    category: "Milk Shake",
    emoji: "🥑",
    description: "Creamy avocado with gentle honey sweetness.",
    badge: "Premium",
    variants: [
      { label: "500 ML", price: 70 },
      { label: "Parcel", price: 135 },
      { label: "1 Liter", price: 255 },
    ],
  },
  {
    id: 57,
    name: "Badam",
    category: "Milk Shake",
    emoji: "🌰",
    description: "Classic badam shake with a rich nutty profile.",
    badge: "Nutty",
    variants: [
      { label: "500 ML", price: 50 },
      { label: "Parcel", price: 105 },
      { label: "1 Liter", price: 200 },
    ],
  },
  {
    id: 58,
    name: "Banana",
    category: "Milk Shake",
    emoji: "🍌",
    description: "Smooth banana shake with a mellow cream finish.",
    badge: "Comfort",
    variants: [
      { label: "500 ML", price: 50 },
      { label: "Parcel", price: 105 },
      { label: "1 Liter", price: 200 },
    ],
  },
  {
    id: 59,
    name: "Blueberry",
    category: "Milk Shake",
    emoji: "🫐",
    description: "Blueberry-infused smooth shake with a fruity finish.",
    badge: "Fruity",
    variants: [
      { label: "500 ML", price: 70 },
      { label: "Parcel", price: 135 },
      { label: "1 Liter", price: 260 },
    ],
  },
  {
    id: 60,
    name: "Boost",
    category: "Milk Shake",
    emoji: "⚡",
    description: "Energy-rich boost shake with strong creamy notes.",
    badge: "Energy",
    variants: [
      { label: "500 ML", price: 60 },
      { label: "Parcel", price: 125 },
      { label: "1 Liter", price: 240 },
    ],
  },
  {
    id: 61,
    name: "Brownie",
    category: "Milk Shake",
    emoji: "🍫",
    description: "Chocolate brownie shake with a dense dessert vibe.",
    badge: "Dessert",
    variants: [
      { label: "500 ML", price: 60 },
      { label: "Parcel", price: 125 },
      { label: "1 Liter", price: 240 },
    ],
  },
  {
    id: 62,
    name: "Butterscotch",
    category: "Milk Shake",
    emoji: "🧈",
    description: "Crisp buttery sweetness with a creamy finish.",
    badge: "Classic",
    variants: [
      { label: "500 ML", price: 50 },
      { label: "Parcel", price: 105 },
      { label: "1 Liter", price: 200 },
    ],
  },
  {
    id: 63,
    name: "Caramel",
    category: "Milk Shake",
    emoji: "🍯",
    description: "Soft caramel shake with a sweet rich body.",
    badge: "Sweet",
    variants: [
      { label: "500 ML", price: 60 },
      { label: "Parcel", price: 125 },
      { label: "1 Liter", price: 240 },
    ],
  },
  {
    id: 64,
    name: "Cherry",
    category: "Milk Shake",
    emoji: "🍒",
    description: "A fruity cherry sip with a smooth creamy profile.",
    badge: "Fruit Lift",
    variants: [
      { label: "500 ML", price: 50 },
      { label: "Parcel", price: 105 },
      { label: "1 Liter", price: 200 },
    ],
  },
  {
    id: 65,
    name: "Chickoo",
    category: "Milk Shake",
    emoji: "🥭",
    description: "Classic chickoo shake with smooth fruit sweetness.",
    badge: "Classic",
    variants: [
      { label: "500 ML", price: 60 },
      { label: "Parcel", price: 125 },
      { label: "1 Liter", price: 240 },
    ],
  },
  {
    id: 66,
    name: "Chocolate",
    category: "Milk Shake",
    emoji: "🍫",
    description: "A rich chocolate shake with a silky finish.",
    badge: "Popular",
    variants: [
      { label: "500 ML", price: 50 },
      { label: "Parcel", price: 105 },
      { label: "1 Liter", price: 200 },
    ],
  },
  {
    id: 67,
    name: "Coffee Blast",
    category: "Milk Shake",
    emoji: "☕",
    description: "Coffee-forward creamy shake for a bold kick.",
    badge: "Bold",
    variants: [
      { label: "500 ML", price: 60 },
      { label: "Parcel", price: 125 },
      { label: "1 Liter", price: 240 },
    ],
  },
  {
    id: 68,
    name: "Cold Coffee",
    category: "Milk Shake",
    emoji: "☕",
    description: "Chilled coffee blended into a smooth café-style sip.",
    badge: "Cafe",
    variants: [
      { label: "500 ML", price: 60 },
      { label: "Parcel", price: 125 },
      { label: "1 Liter", price: 240 },
    ],
  },
  {
    id: 69,
    name: "Custard Apple",
    category: "Milk Shake",
    emoji: "🍐",
    description: "Creamy custard apple shake with a soft fruity body.",
    badge: "Smooth",
    variants: [
      { label: "500 ML", price: 60 },
      { label: "Parcel", price: 125 },
      { label: "1 Liter", price: 240 },
    ],
  },
  {
    id: 70,
    name: "Dark Fantasy",
    category: "Milk Shake",
    emoji: "🍫",
    description: "Dark-themed chocolate indulgence with a silky finish.",
    badge: "Rich",
    variants: [
      { label: "500 ML", price: 50 },
      { label: "Parcel", price: 105 },
      { label: "1 Liter", price: 200 },
    ],
  },
  {
    id: 71,
    name: "Dates (Saudi)",
    category: "Milk Shake",
    emoji: "🌙",
    description: "Sweet date shake with a premium dessert tone.",
    badge: "Premium",
    variants: [
      { label: "500 ML", price: 50 },
      { label: "Parcel", price: 105 },
      { label: "1 Liter", price: 200 },
    ],
  },
  {
    id: 72,
    name: "Dry Fruits",
    category: "Milk Shake",
    emoji: "🥜",
    description: "Nut-rich dry fruit blend with a creamy finish.",
    badge: "Special",
    variants: [
      { label: "500 ML", price: 80 },
      { label: "Parcel", price: 165 },
      { label: "1 Liter", price: 320 },
    ],
  },
  {
    id: 73,
    name: "Grapes",
    category: "Milk Shake",
    emoji: "🍇",
    description: "A juicy grape blend with smooth creamy texture.",
    badge: "Fresh",
    variants: [
      { label: "500 ML", price: 50 },
      { label: "Parcel", price: 105 },
      { label: "1 Liter", price: 200 },
    ],
  },
  {
    id: 74,
    name: "Guava",
    category: "Milk Shake",
    emoji: "🍈",
    description: "Guava shake with mellow fruit sweetness.",
    badge: "Classic",
    variants: [
      { label: "500 ML", price: 50 },
      { label: "Parcel", price: 105 },
      { label: "1 Liter", price: 200 },
    ],
  },
  {
    id: 75,
    name: "Horlicks",
    category: "Milk Shake",
    emoji: "🥛",
    description: "Comforting health shake with a creamy smooth body.",
    badge: "Energy",
    variants: [
      { label: "500 ML", price: 60 },
      { label: "Parcel", price: 125 },
      { label: "1 Liter", price: 240 },
    ],
  },
  {
    id: 76,
    name: "Ice Apple",
    category: "Milk Shake",
    emoji: "🥭",
    description: "Naturally sweet ice apple shake with a fresh finish.",
    badge: "Cool",
    variants: [
      { label: "500 ML", price: 60 },
      { label: "Parcel", price: 125 },
      { label: "1 Liter", price: 240 },
    ],
  },
  {
    id: 77,
    name: "Malai Kulfi",
    category: "Milk Shake",
    emoji: "🍨",
    description: "A rich kulfi-inspired creamy shake.",
    badge: "Premium",
    variants: [
      { label: "500 ML", price: 80 },
      { label: "Parcel", price: 165 },
      { label: "1 Liter", price: 320 },
    ],
  },
  {
    id: 78,
    name: "Lotus",
    category: "Milk Shake",
    emoji: "🌸",
    description: "Lotus-flavoured shake with a luxurious creamy body.",
    badge: "Signature",
    variants: [
      { label: "500 ML", price: 60 },
      { label: "Parcel", price: 125 },
      { label: "1 Liter", price: 240 },
    ],
  },
  {
    id: 79,
    name: "Mixed Fruit",
    category: "Milk Shake",
    emoji: "🍍",
    description: "A balanced mixed fruit shake with plenty of lift.",
    badge: "Tropical",
    variants: [
      { label: "500 ML", price: 70 },
      { label: "Parcel", price: 135 },
      { label: "1 Liter", price: 260 },
    ],
  },
  {
    id: 80,
    name: "Oreo",
    category: "Milk Shake",
    emoji: "🍪",
    description: "Smooth Oreo shake with a creamy biscuit finish.",
    badge: "Favourite",
    variants: [
      { label: "500 ML", price: 50 },
      { label: "Parcel", price: 105 },
      { label: "1 Liter", price: 200 },
    ],
  },
  {
    id: 81,
    name: "Peanut Butter",
    category: "Milk Shake",
    emoji: "🥜",
    description: "A rich peanut butter shake with a nutty finish.",
    badge: "Nutty",
    variants: [
      { label: "500 ML", price: 80 },
      { label: "Parcel", price: 165 },
      { label: "1 Liter", price: 320 },
    ],
  },
  {
    id: 82,
    name: "Pomegranate (Anar)",
    category: "Milk Shake",
    emoji: "🍎",
    description: "Pomegranate-flavored shake with a fruity sweet edge.",
    badge: "Fruitful",
    variants: [
      { label: "500 ML", price: 70 },
      { label: "Parcel", price: 135 },
      { label: "1 Liter", price: 260 },
    ],
  },
  {
    id: 83,
    name: "Dryfruits Special",
    category: "Milk Shake",
    emoji: "🥜",
    description: "A more indulgent dry-fruit premium blend.",
    badge: "Luxury",
    variants: [
      { label: "500 ML", price: 100 },
      { label: "Parcel", price: 205 },
      { label: "1 Liter", price: 400 },
    ],
  },
  {
    id: 84,
    name: "Vanila",
    category: "Milk Shake",
    emoji: "🍦",
    description: "Vanilla cream shake with a clean silky finish.",
    badge: "Classic",
    variants: [
      { label: "500 ML", price: 50 },
      { label: "Parcel", price: 105 },
      { label: "1 Liter", price: 200 },
    ],
  },
  {
    id: 85,
    name: "Tender Coconut",
    category: "Milk Shake",
    emoji: "🥥",
    description: "Creamy coconut shake with a soft tropical taste.",
    badge: "Tropical",
    variants: [
      { label: "500 ML", price: 70 },
      { label: "Parcel", price: 145 },
      { label: "1 Liter", price: 280 },
    ],
  },
  {
    id: 86,
    name: "Black Currant",
    category: "Ice Cream",
    emoji: "🫐",
    description: "Deep black currant ice cream with a fruity finish.",
    badge: "Ice Cream",
    variants: [{ label: "Cup", price: 100 }],
  },
  {
    id: 87,
    name: "Butterscotch",
    category: "Ice Cream",
    emoji: "🧈",
    description: "Classic butterscotch scoop with caramel richness.",
    badge: "Ice Cream",
    variants: [{ label: "Cup", price: 100 }],
  },
  {
    id: 88,
    name: "Choco Chips",
    category: "Ice Cream",
    emoji: "🍫",
    description: "Chocolate base packed with crunchy chip texture.",
    badge: "Ice Cream",
    variants: [{ label: "Cup", price: 100 }],
  },
  {
    id: 89,
    name: "Chocolate",
    category: "Ice Cream",
    emoji: "🍫",
    description: "Classic chocolate ice cream with a rich smooth body.",
    badge: "Ice Cream",
    variants: [{ label: "Cup", price: 100 }],
  },
  {
    id: 90,
    name: "English Delight",
    category: "Ice Cream",
    emoji: "🍦",
    description: "A creamy, familiar dessert-style scoop.",
    badge: "Ice Cream",
    variants: [{ label: "Cup", price: 100 }],
  },
  {
    id: 91,
    name: "Fig Dates And Honey",
    category: "Ice Cream",
    emoji: "🍯",
    description: "Soft fig, date, and honey notes in a creamy scoop.",
    badge: "Ice Cream",
    variants: [{ label: "Cup", price: 100 }],
  },
  {
    id: 92,
    name: "Mango",
    category: "Ice Cream",
    emoji: "🥭",
    description: "Tropical mango ice cream for a sunny scoop.",
    badge: "Ice Cream",
    variants: [{ label: "Cup", price: 100 }],
  },
  {
    id: 93,
    name: "Mocha",
    category: "Ice Cream",
    emoji: "☕",
    description: "Coffee and chocolate tones in a smooth scoop.",
    badge: "Ice Cream",
    variants: [{ label: "Cup", price: 100 }],
  },
  {
    id: 94,
    name: "Pineapple",
    category: "Ice Cream",
    emoji: "🍍",
    description: "Tropical pineapple scoop with a light sweet finish.",
    badge: "Ice Cream",
    variants: [{ label: "Cup", price: 100 }],
  },
  {
    id: 95,
    name: "Pista",
    category: "Ice Cream",
    emoji: "🌰",
    description: "A nutty pista scoop with a creamy finish.",
    badge: "Ice Cream",
    variants: [{ label: "Cup", price: 100 }],
  },
  {
    id: 96,
    name: "Red Velvet",
    category: "Ice Cream",
    emoji: "🍰",
    description: "Smooth red velvet-inspired cream scoop.",
    badge: "Ice Cream",
    variants: [{ label: "Cup", price: 100 }],
  },
];

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
const bestSellerIds = [40, 66, 80, 92];

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

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationMessage("Location support is unavailable on this device.");
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

  const cartItems = useMemo(() => {
    const items: Array<{
      id: number;
      name: string;
      category: string;
      emoji: string;
      description: string;
      badge: string;
      variantLabel: string;
      price: number;
      quantity: number;
    }> = [];

    menuItems.forEach((item) => {
      item.variants.forEach((variant) => {
        const quantity = cart[`${item.id}:${variant.label}`] ?? 0;

        if (quantity > 0) {
          items.push({
            ...item,
            variantLabel: variant.label,
            price: variant.price,
            quantity,
          });
        }
      });
    });

    return items;
  }, [cart]);

  const filteredItems = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();

    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      const matchesSearch =
        normalizedTerm.length === 0 ||
        item.name.toLowerCase().includes(normalizedTerm) ||
        item.description.toLowerCase().includes(normalizedTerm) ||
        item.variants.some((variant) => variant.label.toLowerCase().includes(normalizedTerm));

      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  );

  const selectedBranch = branches.find((branch) => branch.id === branchId) ?? branches[0];

  const getVariantQuantity = (itemId: number, variantLabel: string) =>
    cart[`${itemId}:${variantLabel}`] ?? 0;

  const updateVariantQuantity = (itemId: number, variantLabel: string, delta: number) => {
    setCart((current) => {
      const key = `${itemId}:${variantLabel}`;
      const nextQty = (current[key] ?? 0) + delta;

      if (nextQty <= 0) {
        const { [key]: _, ...rest } = current;
        return rest;
      }

      return { ...current, [key]: nextQty };
    });
  };

  const removeItem = (itemId: number, variantLabel: string) => {
    setCart((current) => {
      const key = `${itemId}:${variantLabel}`;
      const { [key]: _, ...rest } = current;
      return rest;
    });
  };

  const sendToWhatsApp = () => {
    if (!cartItems.length) {
      return;
    }

    const orderLines = cartItems.map(
      (item) => `${item.quantity} × ${item.name} (${item.variantLabel}) ₹${item.price * item.quantity}`,
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
      "Total:",
      `₹${subtotal}`,
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
  };

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
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
            <a
              href="#checkout"
              className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-300"
            >
              Order Now
            </a>
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
                  Browse the full updated PDF menu, build your order with variant pricing, and send it directly to the selected PJ Ours outlet.
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
                  <p className="text-2xl font-bold text-amber-300">96</p>
                  <p className="text-sm text-zinc-300">Menu items updated</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-2xl font-bold text-emerald-300">2</p>
                  <p className="text-sm text-zinc-300">Outlet branches</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-2xl font-bold text-rose-300">Instant</p>
                  <p className="text-sm text-zinc-300">WhatsApp checkout</p>
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
                    <span className="text-xs text-zinc-300">From the new menu</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-4">
                    {menuItems
                      .filter((item) => bestSellerIds.includes(item.id))
                      .map((item) => (
                        <div key={item.id} className="rounded-2xl bg-white/5 p-3 text-center">
                          <div className="text-3xl">{item.emoji}</div>
                          <p className="mt-2 text-sm font-semibold">{item.name}</p>
                          <p className="text-xs text-zinc-300">₹{item.variants[0]?.price}</p>
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
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-amber-300">Interactive Menu</p>
            <h2 className="mt-2 text-3xl font-bold">Build your pickup order</h2>
          </div>
          <div className="flex w-full max-w-2xl flex-col gap-3 md:flex-row">
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search drinks, shakes, or ice cream"
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

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {filteredItems.map((item) => (
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
                  <span className="text-4xl">{item.emoji}</span>
                </div>
                <div className="mt-4 space-y-2">
                  <h3 className="text-xl font-semibold">{item.name}</h3>
                  <p className="text-sm text-zinc-300">{item.description}</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">{item.category}</p>
                </div>
              </div>
              <div className="mt-4 space-y-3 border-t border-white/10 p-4">
                {item.variants.map((variant) => {
                  const quantity = getVariantQuantity(item.id, variant.label);

                  return (
                    <div
                      key={`${item.id}-${variant.label}`}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-black/20 px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">{variant.label}</p>
                        <p className="text-xs text-amber-200">₹{variant.price}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateVariantQuantity(item.id, variant.label, -1)}
                          className="h-8 w-8 rounded-full bg-white/10 text-lg text-white"
                        >
                          −
                        </button>
                        <span className="min-w-6 text-center text-sm font-semibold">{quantity}</span>
                        <button
                          onClick={() => updateVariantQuantity(item.id, variant.label, 1)}
                          className="h-8 w-8 rounded-full bg-white/10 text-lg text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">Shopping Cart</p>
              <h2 className="mt-2 text-2xl font-bold">Your order</h2>
            </div>
            <div className="rounded-full bg-amber-400/15 px-3 py-1 text-sm font-semibold text-amber-200">
              Total ₹{subtotal}
            </div>
          </div>

          <div className="space-y-3">
            {cartItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-6 text-center text-zinc-300">
                Your cart is empty. Add a few drinks to get started.
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={`${item.id}-${item.variantLabel}`} className="rounded-2xl bg-black/20 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-zinc-300">{item.variantLabel} • ₹{item.price} each</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id, item.variantLabel)}
                      className="text-sm text-rose-300"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => updateVariantQuantity(item.id, item.variantLabel, -1)}
                      className="h-8 w-8 rounded-full bg-white/10 text-lg"
                    >
                      −
                    </button>
                    <span className="min-w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateVariantQuantity(item.id, item.variantLabel, 1)}
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
        </div>

        <div className="rounded-[1.6rem] border border-white/10 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 p-4 sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">Menu Highlights</p>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="font-semibold">Updated PDF catalog</p>
              <p className="text-sm text-zinc-300">Every listed drink and ice-cream item from the two-page menu is now present.</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="font-semibold">Variant pricing</p>
              <p className="text-sm text-zinc-300">Choose quantity per size variant directly from the catalog cards.</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="font-semibold">Fast pickup flow</p>
              <p className="text-sm text-zinc-300">The cart is converted into a formatted WhatsApp order for your selected branch.</p>
            </div>
          </div>
        </div>
      </section>

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
              onClick={sendToWhatsApp}
              disabled={!cartItems.length}
              className="mt-5 w-full rounded-full bg-emerald-400 px-5 py-3 font-semibold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-300"
            >
              Send order to WhatsApp
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
