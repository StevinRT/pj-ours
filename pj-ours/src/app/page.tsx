"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type MenuVariant = {
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
  variants: MenuVariant[];
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
    name: "Anar",
    category: "Juice",
    emoji: "🍊",
    description: "Fresh anar juice with a bright fruit finish.",
    badge: "Juice",
    variants: [
      { label: "250 ml", price: 60 },
      { label: "500 ml", price: 120 },
      { label: "1 L", price: 230 },
    ],
  },
  {
    id: 2,
    name: "Apple",
    category: "Juice",
    emoji: "🍏",
    description: "Crisp apple juice served chilled.",
    badge: "Juice",
    variants: [
      { label: "250 ml", price: 50 },
      { label: "500 ml", price: 105 },
      { label: "1 L", price: 200 },
    ],
  },
  {
    id: 3,
    name: "Carrot",
    category: "Juice",
    emoji: "🥕",
    description: "Naturally sweet and vibrant carrot juice.",
    badge: "Juice",
    variants: [
      { label: "250 ml", price: 40 },
      { label: "500 ml", price: 85 },
      { label: "1 L", price: 160 },
    ],
  },
  {
    id: 4,
    name: "Cucumber",
    category: "Juice",
    emoji: "🥒",
    description: "Cooling cucumber juice with a clean finish.",
    badge: "Juice",
    variants: [
      { label: "250 ml", price: 40 },
      { label: "500 ml", price: 85 },
      { label: "1 L", price: 160 },
    ],
  },
  {
    id: 5,
    name: "Cucumber Lemon",
    category: "Juice",
    emoji: "🥒",
    description: "Cool cucumber blended with lemon sparkle.",
    badge: "Juice",
    variants: [
      { label: "250 ml", price: 40 },
      { label: "500 ml", price: 85 },
      { label: "1 L", price: 160 },
    ],
  },
  {
    id: 6,
    name: "Gooseberry & Kanthari",
    category: "Juice",
    emoji: "🍏",
    description: "A bold tangy blend with a spicy finish.",
    badge: "Juice",
    variants: [
      { label: "250 ml", price: 60 },
      { label: "500 ml", price: 125 },
      { label: "1 L", price: 240 },
    ],
  },
  {
    id: 7,
    name: "Grape",
    category: "Juice",
    emoji: "🍇",
    description: "Sweet and juicy grape refreshment.",
    badge: "Juice",
    variants: [
      { label: "250 ml", price: 40 },
      { label: "500 ml", price: 85 },
      { label: "1 L", price: 160 },
    ],
  },
  {
    id: 8,
    name: "Guava Lemon",
    category: "Juice",
    emoji: "🥝",
    description: "Soft guava with citrus lift.",
    badge: "Juice",
    variants: [
      { label: "250 ml", price: 40 },
      { label: "500 ml", price: 85 },
      { label: "1 L", price: 160 },
    ],
  },
  {
    id: 9,
    name: "Kiwi",
    category: "Juice",
    emoji: "🥝",
    description: "Tart-sweet kiwi with a fresh tropical feel.",
    badge: "Juice",
    variants: [
      { label: "250 ml", price: 80 },
      { label: "500 ml", price: 165 },
      { label: "1 L", price: 320 },
    ],
  },
  {
    id: 10,
    name: "Lemon (Fresh)",
    category: "Juice",
    emoji: "🍋",
    description: "Fresh lemon juice with a zesty snap.",
    badge: "Juice",
    variants: [
      { label: "250 ml", price: 30 },
      { label: "500 ml", price: 65 },
      { label: "1 L", price: 120 },
    ],
  },
  {
    id: 11,
    name: "Lemon Soda (Chilli)",
    category: "Juice",
    emoji: "🍋",
    description: "Citrus soda with a spicy chilli kick.",
    badge: "Juice",
    variants: [
      { label: "250 ml", price: 30 },
      { label: "500 ml", price: 65 },
      { label: "1 L", price: 120 },
    ],
  },
  {
    id: 12,
    name: "Lemon Grape",
    category: "Juice",
    emoji: "🍇",
    description: "Grape and lemon in an easy chilled blend.",
    badge: "Juice",
    variants: [
      { label: "250 ml", price: 40 },
      { label: "500 ml", price: 85 },
      { label: "1 L", price: 160 },
    ],
  },
  {
    id: 13,
    name: "Lemon Mint",
    category: "Juice",
    emoji: "🍋",
    description: "Minty lemon house special.",
    badge: "Juice",
    variants: [
      { label: "250 ml", price: 40 },
      { label: "500 ml", price: 85 },
      { label: "1 L", price: 160 },
    ],
  },
  {
    id: 14,
    name: "Lemon Pineapple",
    category: "Juice",
    emoji: "🍍",
    description: "Blended lemon and pineapple for a lively sip.",
    badge: "Juice",
    variants: [
      { label: "250 ml", price: 40 },
      { label: "500 ml", price: 85 },
      { label: "1 L", price: 160 },
    ],
  },
  {
    id: 15,
    name: "Mango",
    category: "Juice",
    emoji: "🥭",
    description: "Classic mango juice made for the regulars.",
    badge: "Juice",
    variants: [
      { label: "250 ml", price: 60 },
      { label: "500 ml", price: 125 },
      { label: "1 L", price: 240 },
    ],
  },
  {
    id: 16,
    name: "Mosambi",
    category: "Juice",
    emoji: "🍊",
    description: "Sweet and juicy mosambi refreshment.",
    badge: "Juice",
    variants: [
      { label: "250 ml", price: 50 },
      { label: "500 ml", price: 105 },
      { label: "1 L", price: 200 },
    ],
  },
  {
    id: 17,
    name: "Muskmelon (Shamam)",
    category: "Juice",
    emoji: "🍈",
    description: "Cooled melon juice with mellow sweetness.",
    badge: "Juice",
    variants: [
      { label: "250 ml", price: 40 },
      { label: "500 ml", price: 85 },
      { label: "1 L", price: 160 },
    ],
  },
  {
    id: 18,
    name: "Orange",
    category: "Juice",
    emoji: "🍊",
    description: "Classic orange juice for a bright morning lift.",
    badge: "Juice",
    variants: [
      { label: "250 ml", price: 50 },
      { label: "500 ml", price: 105 },
      { label: "1 L", price: 200 },
    ],
  },
  {
    id: 19,
    name: "Orange Lemon",
    category: "Juice",
    emoji: "🍊",
    description: "An orange and lemon blend with a neat citrus profile.",
    badge: "Juice",
    variants: [
      { label: "250 ml", price: 50 },
      { label: "500 ml", price: 105 },
      { label: "1 L", price: 200 },
    ],
  },
  {
    id: 20,
    name: "Papaya",
    category: "Juice",
    emoji: "🥭",
    description: "Creamy papaya juice served fresh.",
    badge: "Juice",
    variants: [
      { label: "250 ml", price: 40 },
      { label: "500 ml", price: 85 },
      { label: "1 L", price: 160 },
    ],
  },
  {
    id: 21,
    name: "Passion Fruit",
    category: "Juice",
    emoji: "🍍",
    description: "Passion fruit refreshment with tropical depth.",
    badge: "Juice",
    variants: [
      { label: "250 ml", price: 70 },
      { label: "500 ml", price: 145 },
      { label: "1 L", price: 280 },
    ],
  },
  {
    id: 22,
    name: "Pineapple",
    category: "Juice",
    emoji: "🍍",
    description: "Juicy pineapple sweetness with a clean finish.",
    badge: "Juice",
    variants: [
      { label: "250 ml", price: 50 },
      { label: "500 ml", price: 105 },
      { label: "1 L", price: 200 },
    ],
  },
  {
    id: 23,
    name: "Strawberry",
    category: "Juice",
    emoji: "🍓",
    description: "Bright strawberry layered into a chilled sip.",
    badge: "Juice",
    variants: [
      { label: "250 ml", price: 60 },
      { label: "500 ml", price: 125 },
      { label: "1 L", price: 240 },
    ],
  },
  {
    id: 24,
    name: "Water Melon",
    category: "Juice",
    emoji: "🍉",
    description: "Classic watermelon cooler for a refreshing reset.",
    badge: "Juice",
    variants: [
      { label: "250 ml", price: 40 },
      { label: "500 ml", price: 85 },
      { label: "1 L", price: 160 },
    ],
  },
  {
    id: 25,
    name: "Apple Chickoo",
    category: "Fusion Shake",
    emoji: "🍏",
    description: "A sweet fusion with apple and chickoo richness.",
    badge: "Fusion",
    variants: [
      { label: "250 ml", price: 60 },
      { label: "500 ml", price: 125 },
      { label: "1 L", price: 245 },
    ],
  },
  {
    id: 26,
    name: "Apple Papaya",
    category: "Fusion Shake",
    emoji: "🍏",
    description: "Smooth apple-papaya fusion in a creamy blend.",
    badge: "Fusion",
    variants: [
      { label: "250 ml", price: 60 },
      { label: "500 ml", price: 125 },
      { label: "1 L", price: 245 },
    ],
  },
  {
    id: 27,
    name: "Badam Pista",
    category: "Fusion Shake",
    emoji: "🥜",
    description: "Nutty, creamy, and satisfying.",
    badge: "Fusion",
    variants: [
      { label: "250 ml", price: 60 },
      { label: "500 ml", price: 125 },
      { label: "1 L", price: 245 },
    ],
  },
  {
    id: 28,
    name: "Chickoo Chocolate",
    category: "Fusion Shake",
    emoji: "🍫",
    description: "Chocolate-rich chickoo shake with a silky finish.",
    badge: "Fusion",
    variants: [
      { label: "250 ml", price: 60 },
      { label: "500 ml", price: 125 },
      { label: "1 L", price: 245 },
    ],
  },
  {
    id: 29,
    name: "Chickoo Sharjah",
    category: "Fusion Shake",
    emoji: "🫙",
    description: "A creamy chickoo sharjah special.",
    badge: "Fusion",
    variants: [
      { label: "250 ml", price: 60 },
      { label: "500 ml", price: 125 },
      { label: "1 L", price: 245 },
    ],
  },
  {
    id: 30,
    name: "Chickoo Custard Apple",
    category: "Fusion Shake",
    emoji: "🍏",
    description: "Custard apple blended with chickoo for a silky sip.",
    badge: "Fusion",
    variants: [
      { label: "250 ml", price: 60 },
      { label: "500 ml", price: 125 },
      { label: "1 L", price: 245 },
    ],
  },
  {
    id: 31,
    name: "Chocolate Caramel",
    category: "Fusion Shake",
    emoji: "🍫",
    description: "Chocolate and caramel layered for a dessert-like treat.",
    badge: "Fusion",
    variants: [
      { label: "250 ml", price: 60 },
      { label: "500 ml", price: 125 },
      { label: "1 L", price: 245 },
    ],
  },
  {
    id: 32,
    name: "Chocolate Oreo",
    category: "Fusion Shake",
    emoji: "🍪",
    description: "Cookie-rich chocolate profile with indulgent depth.",
    badge: "Fusion",
    variants: [
      { label: "250 ml", price: 60 },
      { label: "500 ml", price: 125 },
      { label: "1 L", price: 245 },
    ],
  },
  {
    id: 33,
    name: "Chocolate Sharjah",
    category: "Fusion Shake",
    emoji: "🍫",
    description: "Rich chocolate sharjah variation.",
    badge: "Fusion",
    variants: [
      { label: "250 ml", price: 60 },
      { label: "500 ml", price: 125 },
      { label: "1 L", price: 245 },
    ],
  },
  {
    id: 34,
    name: "Grape Pineapple",
    category: "Fusion Shake",
    emoji: "🍇",
    description: "Bright grape and pineapple fruit fusion.",
    badge: "Fusion",
    variants: [
      { label: "250 ml", price: 60 },
      { label: "500 ml", price: 125 },
      { label: "1 L", price: 245 },
    ],
  },
  {
    id: 35,
    name: "Kitkat Oreo",
    category: "Fusion Shake",
    emoji: "🍫",
    description: "Crunchy chocolate shake with classic cookie notes.",
    badge: "Fusion",
    variants: [
      { label: "250 ml", price: 60 },
      { label: "500 ml", price: 125 },
      { label: "1 L", price: 245 },
    ],
  },
  {
    id: 36,
    name: "Oreo Caramel",
    category: "Fusion Shake",
    emoji: "🍪",
    description: "Caramel cookie shake with a sweet finish.",
    badge: "Fusion",
    variants: [
      { label: "250 ml", price: 60 },
      { label: "500 ml", price: 125 },
      { label: "1 L", price: 245 },
    ],
  },
  {
    id: 37,
    name: "Oreo Sharjah",
    category: "Fusion Shake",
    emoji: "🍪",
    description: "Oreo sharjah with generous creamy notes.",
    badge: "Fusion",
    variants: [
      { label: "250 ml", price: 60 },
      { label: "500 ml", price: 125 },
      { label: "1 L", price: 245 },
    ],
  },
  {
    id: 38,
    name: "Papaya Chickoo",
    category: "Fusion Shake",
    emoji: "🥭",
    description: "Papaya and chickoo blended into a mellow shake.",
    badge: "Fusion",
    variants: [
      { label: "250 ml", price: 60 },
      { label: "500 ml", price: 125 },
      { label: "1 L", price: 245 },
    ],
  },
  {
    id: 39,
    name: "Papaya Mango",
    category: "Fusion Shake",
    emoji: "🥭",
    description: "Tropical papaya mangow blend with a lush texture.",
    badge: "Fusion",
    variants: [
      { label: "250 ml", price: 60 },
      { label: "500 ml", price: 125 },
      { label: "1 L", price: 245 },
    ],
  },
  {
    id: 40,
    name: "Papaya Sharjah",
    category: "Fusion Shake",
    emoji: "🥭",
    description: "Papaya sharjah special with creamy balance.",
    badge: "Fusion",
    variants: [
      { label: "250 ml", price: 60 },
      { label: "500 ml", price: 125 },
      { label: "1 L", price: 245 },
    ],
  },
  {
    id: 41,
    name: "Saudi Caramel",
    category: "Fusion Shake",
    emoji: "🧁",
    description: "Creamy caramel flavour with a sweet finish.",
    badge: "Fusion",
    variants: [
      { label: "250 ml", price: 60 },
      { label: "500 ml", price: 125 },
      { label: "1 L", price: 245 },
    ],
  },
  {
    id: 42,
    name: "Sharjah Saudi",
    category: "Fusion Shake",
    emoji: "🧁",
    description: "Signature sharjah style shake with rich creaminess.",
    badge: "Fusion",
    variants: [
      { label: "250 ml", price: 60 },
      { label: "500 ml", price: 125 },
      { label: "1 L", price: 245 },
    ],
  },
  {
    id: 43,
    name: "Tender Butter",
    category: "Fusion Shake",
    emoji: "🧈",
    description: "Buttery rich blend with smooth texture.",
    badge: "Fusion",
    variants: [
      { label: "250 ml", price: 80 },
      { label: "500 ml", price: 165 },
      { label: "1 L", price: 325 },
    ],
  },
  {
    id: 44,
    name: "Tender Cashew",
    category: "Fusion Shake",
    emoji: "🥜",
    description: "Silky cashew style shake with a creamy body.",
    badge: "Fusion",
    variants: [
      { label: "250 ml", price: 80 },
      { label: "500 ml", price: 165 },
      { label: "1 L", price: 325 },
    ],
  },
  {
    id: 45,
    name: "Tender Chickoo",
    category: "Fusion Shake",
    emoji: "🫙",
    description: "Smooth chickoo shake with mellow sweetness.",
    badge: "Fusion",
    variants: [
      { label: "250 ml", price: 80 },
      { label: "500 ml", price: 165 },
      { label: "1 L", price: 325 },
    ],
  },
  {
    id: 46,
    name: "Tender Dates",
    category: "Fusion Shake",
    emoji: "🌴",
    description: "Date-based creamy shake with a rich finish.",
    badge: "Fusion",
    variants: [
      { label: "250 ml", price: 80 },
      { label: "500 ml", price: 165 },
      { label: "1 L", price: 325 },
    ],
  },
  {
    id: 47,
    name: "Tender Mango",
    category: "Fusion Shake",
    emoji: "🥭",
    description: "Mango shake with dense, creamy consistency.",
    badge: "Fusion",
    variants: [
      { label: "250 ml", price: 80 },
      { label: "500 ml", price: 165 },
      { label: "1 L", price: 325 },
    ],
  },
  {
    id: 48,
    name: "Tender Caramel",
    category: "Fusion Shake",
    emoji: "🧁",
    description: "Creamy caramel shake with a soft finish.",
    badge: "Fusion",
    variants: [
      { label: "250 ml", price: 80 },
      { label: "500 ml", price: 165 },
      { label: "1 L", price: 325 },
    ],
  },
  {
    id: 49,
    name: "Tender Chocolate",
    category: "Fusion Shake",
    emoji: "🍫",
    description: "A rich creamy cocoa blend.",
    badge: "Fusion",
    variants: [
      { label: "250 ml", price: 80 },
      { label: "500 ml", price: 165 },
      { label: "1 L", price: 325 },
    ],
  },
  {
    id: 50,
    name: "Apple",
    category: "Milk Shake",
    emoji: "🍏",
    description: "Smooth apple creamy milk shake.",
    badge: "Milk Shake",
    variants: [
      { label: "250 ml", price: 50 },
      { label: "500 ml", price: 105 },
      { label: "1 L", price: 200 },
    ],
  },
  {
    id: 51,
    name: "Avocado (Butter)",
    category: "Milk Shake",
    emoji: "🥑",
    description: "Creamy avocado butter-style shake.",
    badge: "Milk Shake",
    variants: [
      { label: "250 ml", price: 60 },
      { label: "500 ml", price: 125 },
      { label: "1 L", price: 240 },
    ],
  },
  {
    id: 52,
    name: "Avocado Honey",
    category: "Milk Shake",
    emoji: "🥑",
    description: "Avocado with honey finishing in a smooth texture.",
    badge: "Milk Shake",
    variants: [
      { label: "250 ml", price: 90 },
      { label: "500 ml", price: 185 },
      { label: "1 L", price: 360 },
    ],
  },
  {
    id: 53,
    name: "Badam",
    category: "Milk Shake",
    emoji: "🥜",
    description: "Rich almond milk shake.",
    badge: "Milk Shake",
    variants: [
      { label: "250 ml", price: 40 },
      { label: "500 ml", price: 85 },
      { label: "1 L", price: 160 },
    ],
  },
  {
    id: 54,
    name: "Banana",
    category: "Milk Shake",
    emoji: "🍌",
    description: "Smooth banana milk shake.",
    badge: "Milk Shake",
    variants: [
      { label: "250 ml", price: 40 },
      { label: "500 ml", price: 85 },
      { label: "1 L", price: 160 },
    ],
  },
  {
    id: 55,
    name: "Blueberry",
    category: "Milk Shake",
    emoji: "🫐",
    description: "Blueberry cream shake with a smooth finish.",
    badge: "Milk Shake",
    variants: [
      { label: "250 ml", price: 60 },
      { label: "500 ml", price: 125 },
      { label: "1 L", price: 240 },
    ],
  },
  {
    id: 56,
    name: "Boost",
    category: "Milk Shake",
    emoji: "⚡",
    description: "Energy-boosting milk shake blend.",
    badge: "Milk Shake",
    variants: [
      { label: "250 ml", price: 60 },
      { label: "500 ml", price: 125 },
      { label: "1 L", price: 240 },
    ],
  },
  {
    id: 57,
    name: "Brownie",
    category: "Milk Shake",
    emoji: "🍫",
    description: "Fudgy brownie milk shake experience.",
    badge: "Milk Shake",
    variants: [
      { label: "250 ml", price: 60 },
      { label: "500 ml", price: 125 },
      { label: "1 L", price: 240 },
    ],
  },
  {
    id: 58,
    name: "Butterscotch",
    category: "Milk Shake",
    emoji: "🧈",
    description: "Caramel-butterscotch creamy shake.",
    badge: "Milk Shake",
    variants: [
      { label: "250 ml", price: 50 },
      { label: "500 ml", price: 105 },
      { label: "1 L", price: 200 },
    ],
  },
  {
    id: 59,
    name: "Caramel",
    category: "Milk Shake",
    emoji: "🧁",
    description: "Sweet caramel milk shake with creamy balance.",
    badge: "Milk Shake",
    variants: [
      { label: "250 ml", price: 50 },
      { label: "500 ml", price: 105 },
      { label: "1 L", price: 200 },
    ],
  },
  {
    id: 60,
    name: "Cherry (Kashmiri)",
    category: "Milk Shake",
    emoji: "🍒",
    description: "Kashmiri cherry milk shake.",
    badge: "Milk Shake",
    variants: [
      { label: "250 ml", price: 40 },
      { label: "500 ml", price: 85 },
      { label: "1 L", price: 160 },
    ],
  },
  {
    id: 61,
    name: "Chickoo",
    category: "Milk Shake",
    emoji: "🫙",
    description: "Velvety chickoo milk shake.",
    badge: "Milk Shake",
    variants: [
      { label: "250 ml", price: 50 },
      { label: "500 ml", price: 105 },
      { label: "1 L", price: 200 },
    ],
  },
  {
    id: 62,
    name: "Chocolate",
    category: "Milk Shake",
    emoji: "🍫",
    description: "Classic chocolate milk shake.",
    badge: "Milk Shake",
    variants: [
      { label: "250 ml", price: 40 },
      { label: "500 ml", price: 85 },
      { label: "1 L", price: 160 },
    ],
  },
  {
    id: 63,
    name: "Coffee Blast",
    category: "Milk Shake",
    emoji: "☕",
    description: "Coffee-forward creamy shake.",
    badge: "Milk Shake",
    variants: [
      { label: "250 ml", price: 60 },
      { label: "500 ml", price: 125 },
      { label: "1 L", price: 240 },
    ],
  },
  {
    id: 64,
    name: "Cold Coffee",
    category: "Milk Shake",
    emoji: "☕",
    description: "Iced cold coffee shake with espresso notes.",
    badge: "Milk Shake",
    variants: [
      { label: "250 ml", price: 50 },
      { label: "500 ml", price: 105 },
      { label: "1 L", price: 200 },
    ],
  },
  {
    id: 65,
    name: "Custard Apple",
    category: "Milk Shake",
    emoji: "🍏",
    description: "Creamy custard apple milk shake.",
    badge: "Milk Shake",
    variants: [
      { label: "250 ml", price: 50 },
      { label: "500 ml", price: 105 },
      { label: "1 L", price: 200 },
    ],
  },
  {
    id: 66,
    name: "Dark Fantasy",
    category: "Milk Shake",
    emoji: "🍪",
    description: "Creamy cookie-inspired dark fantasy shake.",
    badge: "Milk Shake",
    variants: [
      { label: "250 ml", price: 45 },
      { label: "500 ml", price: 95 },
      { label: "1 L", price: 180 },
    ],
  },
  {
    id: 67,
    name: "Dates (Saudi)",
    category: "Milk Shake",
    emoji: "🌴",
    description: "Smooth date milk shake with rich sweetness.",
    badge: "Milk Shake",
    variants: [
      { label: "250 ml", price: 40 },
      { label: "500 ml", price: 85 },
      { label: "1 L", price: 160 },
    ],
  },
  {
    id: 68,
    name: "Dry Fruits",
    category: "Milk Shake",
    emoji: "🥜",
    description: "Rich dry fruit shake with nutty body.",
    badge: "Milk Shake",
    variants: [
      { label: "250 ml", price: 60 },
      { label: "500 ml", price: 125 },
      { label: "1 L", price: 240 },
    ],
  },
  {
    id: 69,
    name: "Grape",
    category: "Milk Shake",
    emoji: "🍇",
    description: "Creamy grape milk shake.",
    badge: "Milk Shake",
    variants: [
      { label: "250 ml", price: 40 },
      { label: "500 ml", price: 85 },
      { label: "1 L", price: 160 },
    ],
  },
  {
    id: 70,
    name: "Guava",
    category: "Milk Shake",
    emoji: "🥝",
    description: "Guava milk shake with fruity softness.",
    badge: "Milk Shake",
    variants: [
      { label: "250 ml", price: 40 },
      { label: "500 ml", price: 85 },
      { label: "1 L", price: 160 },
    ],
  },
  {
    id: 71,
    name: "Horlicks",
    category: "Milk Shake",
    emoji: "🥛",
    description: "Toasty malt shake, smooth and comforting.",
    badge: "Milk Shake",
    variants: [
      { label: "250 ml", price: 50 },
      { label: "500 ml", price: 105 },
      { label: "1 L", price: 200 },
    ],
  },
  {
    id: 72,
    name: "Ice Apple (Pananongu)",
    category: "Milk Shake",
    emoji: "🫧",
    description: "Cool ice apple shake with a mellow finish.",
    badge: "Milk Shake",
    variants: [
      { label: "250 ml", price: 50 },
      { label: "500 ml", price: 105 },
      { label: "1 L", price: 200 },
    ],
  },
  {
    id: 73,
    name: "Jack Fruit",
    category: "Milk Shake",
    emoji: "🥭",
    description: "Jackfruit shake with creamy fruit notes.",
    badge: "Milk Shake",
    variants: [
      { label: "250 ml", price: 55 },
      { label: "500 ml", price: 115 },
      { label: "1 L", price: 220 },
    ],
  },
  {
    id: 74,
    name: "Malai Kulfi",
    category: "Milk Shake",
    emoji: "🍦",
    description: "Kulfi-inspired creamy shake.",
    badge: "Milk Shake",
    variants: [
      { label: "250 ml", price: 80 },
      { label: "500 ml", price: 165 },
      { label: "1 L", price: 320 },
    ],
  },
  {
    id: 75,
    name: "Kiwi",
    category: "Milk Shake",
    emoji: "🥝",
    description: "Kiwi milk shake with bright fruit notes.",
    badge: "Milk Shake",
    variants: [
      { label: "250 ml", price: 80 },
      { label: "500 ml", price: 165 },
      { label: "1 L", price: 320 },
    ],
  },
  {
    id: 76,
    name: "Lotus Biscoff",
    category: "Milk Shake",
    emoji: "🍪",
    description: "Lotus Biscoff-inspired creamy shake.",
    badge: "Milk Shake",
    variants: [
      { label: "250 ml", price: 85 },
      { label: "500 ml", price: 175 },
      { label: "1 L", price: 340 },
    ],
  },
  {
    id: 77,
    name: "Mango",
    category: "Milk Shake",
    emoji: "🥭",
    description: "Mango milk shake with soft creamy body.",
    badge: "Milk Shake",
    variants: [
      { label: "250 ml", price: 60 },
      { label: "500 ml", price: 125 },
      { label: "1 L", price: 240 },
    ],
  },
  {
    id: 78,
    name: "Mixed Fruit",
    category: "Milk Shake",
    emoji: "🍇",
    description: "A mixed fruit shake with a playful finish.",
    badge: "Milk Shake",
    variants: [
      { label: "250 ml", price: 50 },
      { label: "500 ml", price: 105 },
      { label: "1 L", price: 200 },
    ],
  },
  {
    id: 79,
    name: "Muskmelon (Shamam)",
    category: "Milk Shake",
    emoji: "🍈",
    description: "Melon milk shake with a mellow fruity body.",
    badge: "Milk Shake",
    variants: [
      { label: "250 ml", price: 40 },
      { label: "500 ml", price: 85 },
      { label: "1 L", price: 160 },
    ],
  },
  {
    id: 80,
    name: "Oreo",
    category: "Milk Shake",
    emoji: "🍪",
    description: "Classic Oreo shake with a rich creamy finish.",
    badge: "Milk Shake",
    variants: [
      { label: "250 ml", price: 40 },
      { label: "500 ml", price: 85 },
      { label: "1 L", price: 160 },
    ],
  },
  {
    id: 81,
    name: "Papaya",
    category: "Milk Shake",
    emoji: "🥭",
    description: "Papaya milk shake with a soft mellow texture.",
    badge: "Milk Shake",
    variants: [
      { label: "250 ml", price: 40 },
      { label: "500 ml", price: 85 },
      { label: "1 L", price: 160 },
    ],
  },
  {
    id: 82,
    name: "Peanut Butter",
    category: "Milk Shake",
    emoji: "🥜",
    description: "Creamy peanut butter shake with rich depth.",
    badge: "Milk Shake",
    variants: [
      { label: "250 ml", price: 80 },
      { label: "500 ml", price: 165 },
      { label: "1 L", price: 320 },
    ],
  },
  {
    id: 83,
    name: "Pineapple",
    category: "Milk Shake",
    emoji: "🍍",
    description: "Pineapple milk shake with bright sweetness.",
    badge: "Milk Shake",
    variants: [
      { label: "250 ml", price: 40 },
      { label: "500 ml", price: 85 },
      { label: "1 L", price: 160 },
    ],
  },
  {
    id: 84,
    name: "Pista",
    category: "Milk Shake",
    emoji: "🥜",
    description: "Pista-flavoured creamy shake.",
    badge: "Milk Shake",
    variants: [
      { label: "250 ml", price: 40 },
      { label: "500 ml", price: 85 },
      { label: "1 L", price: 160 },
    ],
  },
  {
    id: 85,
    name: "Pomegranate",
    category: "Milk Shake",
    emoji: "🍎",
    description: "Pomegranate milk shake with bright fruity notes.",
    badge: "Milk Shake",
    variants: [
      { label: "250 ml", price: 60 },
      { label: "500 ml", price: 125 },
      { label: "1 L", price: 240 },
    ],
  },
  {
    id: 86,
    name: "Strawberry",
    category: "Milk Shake",
    emoji: "🍓",
    description: "Classic strawberry creamy shake.",
    badge: "Milk Shake",
    variants: [
      { label: "250 ml", price: 50 },
      { label: "500 ml", price: 105 },
      { label: "1 L", price: 200 },
    ],
  },
  {
    id: 87,
    name: "Special Dry Fruits",
    category: "Milk Shake",
    emoji: "🥜",
    description: "Premium dry fruit shake with extra richness.",
    badge: "Milk Shake",
    variants: [
      { label: "250 ml", price: 90 },
      { label: "500 ml", price: 185 },
      { label: "1 L", price: 360 },
    ],
  },
  {
    id: 88,
    name: "Vanilla",
    category: "Milk Shake",
    emoji: "🍦",
    description: "Creamy vanilla milk shake.",
    badge: "Milk Shake",
    variants: [
      { label: "250 ml", price: 40 },
      { label: "500 ml", price: 85 },
      { label: "1 L", price: 160 },
    ],
  },
  {
    id: 89,
    name: "Tender Coconut",
    category: "Milk Shake",
    emoji: "🥥",
    description: "Tender coconut milk shake with a fresh tropical note.",
    badge: "Milk Shake",
    variants: [
      { label: "250 ml", price: 70 },
      { label: "500 ml", price: 145 },
      { label: "1 L", price: 280 },
    ],
  },
];

const branches: Branch[] = [
  {
    id: "east-fort",
    name: "East Fort",
    phone: "+91XXXXXXXXXX",
    maps: "https://maps.google.com/?q=East+Fort",
    hours: "11:00 AM - 11:00 PM",
    coords: { lat: 8.4874, lng: 76.9569 },
  },
  {
    id: "west-fort",
    name: "West Fort",
    phone: "+91XXXXXXXXXX",
    maps: "https://maps.google.com/?q=West+Fort",
    hours: "12:00 PM - 10:30 PM",
    coords: { lat: 8.4978, lng: 76.9524 },
  },
  {
    id: "college-road",
    name: "College Road",
    phone: "+91XXXXXXXXXX",
    maps: "https://maps.google.com/?q=College+Road",
    hours: "10:30 AM - 10:30 PM",
    coords: { lat: 8.5121, lng: 76.9477 },
  },
  {
    id: "pallimoola",
    name: "Pallimoola",
    phone: "+91XXXXXXXXXX",
    maps: "https://maps.google.com/?q=Pallimoola",
    hours: "11:30 AM - 11:00 PM",
    coords: { lat: 8.5067, lng: 76.9621 },
  },
];

const categories = ["All", ...new Set(menuItems.map((item) => item.category))];
const bestSellerIds = [1, 2, 5];

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

  const getCartKey = (itemId: number, variantLabel: string) =>
    `${itemId}::${variantLabel}`;

  const cartItems = useMemo(
    () =>
      menuItems.flatMap((item) =>
        item.variants
          .filter((variant) => (cart[getCartKey(item.id, variant.label)] ?? 0) > 0)
          .map((variant) => ({
            itemId: item.id,
            itemName: item.name,
            itemCategory: item.category,
            variantLabel: variant.label,
            price: variant.price,
            quantity: cart[getCartKey(item.id, variant.label)],
          })),
      ),
    [cart],
  );

  const filteredItems = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();

    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      const matchesSearch =
        normalizedTerm.length === 0 ||
        item.name.toLowerCase().includes(normalizedTerm) ||
        item.description.toLowerCase().includes(normalizedTerm);

      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  );

  const getVariantQuantity = (itemId: number, variantLabel: string) =>
    cart[getCartKey(itemId, variantLabel)] ?? 0;

  const selectedBranch = branches.find((branch) => branch.id === branchId) ?? branches[0];

  const addToCart = (itemId: number, variantLabel: string) => {
    const key = getCartKey(itemId, variantLabel);

    setCart((current) => ({
      ...current,
      [key]: (current[key] ?? 0) + 1,
    }));
  };

  const updateQuantity = (itemId: number, variantLabel: string, delta: number) => {
    const key = getCartKey(itemId, variantLabel);

    setCart((current) => {
      const nextQty = (current[key] ?? 0) + delta;

      if (nextQty <= 0) {
        const { [key]: _, ...rest } = current;
        return rest;
      }

      return { ...current, [key]: nextQty };
    });
  };

  const removeItem = (itemId: number, variantLabel: string) => {
    const key = getCartKey(itemId, variantLabel);

    setCart((current) => {
      const { [key]: _, ...rest } = current;
      return rest;
    });
  };

  const sendToWhatsApp = () => {
    if (!cartItems.length) {
      return;
    }

    const orderLines = cartItems.map(
      (item) => `${item.quantity} × ${item.itemName} (${item.variantLabel}) ₹${item.price * item.quantity}`,
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
                  <p className="text-2xl font-bold text-amber-300">4</p>
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
                          <p className="text-sm text-zinc-300">₹{item.variants[0]?.price}</p>
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
                  <p className="text-lg font-bold text-amber-300">
                    From ₹{item.variants[0]?.price}
                  </p>
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
                          onClick={() => updateQuantity(item.id, variant.label, -1)}
                          className="h-8 w-8 rounded-full bg-white/10 text-lg text-white"
                        >
                          −
                        </button>
                        <span className="min-w-6 text-center text-sm font-semibold">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, variant.label, 1)}
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
                <div key={`${item.itemId}-${item.variantLabel}`} className="rounded-2xl bg-black/20 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{item.itemName}</p>
                      <p className="text-sm text-zinc-300">{item.variantLabel} • ₹{item.price} each</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.itemId, item.variantLabel)}
                      className="text-sm text-rose-300"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.itemId, item.variantLabel, -1)}
                      className="h-8 w-8 rounded-full bg-white/10 text-lg"
                    >
                      −
                    </button>
                    <span className="min-w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.itemId, item.variantLabel, 1)}
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
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">Offers & Combos</p>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="font-semibold">Combo Saver</p>
              <p className="text-sm text-zinc-300">Any two shakes + free mint cooler.</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="font-semibold">Weekend Treat</p>
              <p className="text-sm text-zinc-300">Buy 3 Mojitos and get one ice cream add-on.</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="font-semibold">Pickup Advantage</p>
              <p className="text-sm text-zinc-300">Place an order and sync it directly with the selected branch.</p>
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
