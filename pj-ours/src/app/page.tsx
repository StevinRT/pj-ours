'use client';

import React, { useState } from 'react';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

const MENU_ITEMS: MenuItem[] = [
  // Ice Cream Shakes (Formerly "Ice Cream")
  { id: '1', name: 'Vanilla Shake', price: 120, category: 'Ice Cream Shakes' },
  { id: '2', name: 'Chocolate Shake', price: 140, category: 'Ice Cream Shakes' },
  { id: '3', name: 'Strawberry Shake', price: 130, category: 'Ice Cream Shakes' },

  // Ice Cream Desserts (Formerly "Ice Cream Shakes")
  { id: '4', name: 'Sundaes Delight', price: 180, category: 'Ice Cream Desserts' },
  { id: '5', name: 'Brownie Fudge Sundae', price: 210, category: 'Ice Cream Desserts' },
  { id: '6', name: 'Banana Split', price: 220, category: 'Ice Cream Desserts' },
];

export default function Home() {
  const [orderType, setOrderType] = useState<'dine-in' | 'parcel' | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.id === item.id);
      if (existing) {
        return prevCart.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) =>
      prevCart
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  // Calculations
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const packingCharge = orderType === 'parcel' ? totalItemCount * 5 : 0;
  const finalTotal = subtotal + packingCharge;

  // Categories
  const categories = Array.from(new Set(MENU_ITEMS.map((item) => item.category)));

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 relative pb-24 lg:pb-0">
      {/* 1. Mandatory Order Type Popup */}
      {orderType === null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-center space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              How would you like your order?
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setOrderType('dine-in')}
                className="flex flex-col items-center justify-center p-5 border-2 border-amber-500 rounded-xl hover:bg-amber-50 transition-all font-semibold text-lg"
              >
                <span className="text-3xl mb-2">🍽️</span>
                Dine In
              </button>
              <button
                onClick={() => setOrderType('parcel')}
                className="flex flex-col items-center justify-center p-5 border-2 border-amber-500 rounded-xl hover:bg-amber-50 transition-all font-semibold text-lg"
              >
                <span className="text-3xl mb-2">📦</span>
                Parcel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold text-amber-600">Dessert Corner</h1>
        {orderType && (
          <button
            onClick={() => setOrderType(null)}
            className="text-sm bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 font-medium"
          >
            Order Type: <span className="capitalize font-bold text-amber-600">{orderType}</span> (Change)
          </button>
        )}
      </header>

      <div className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Items List */}
        <main className="lg:col-span-2 space-y-8">
          {categories.map((category) => (
            <section key={category} className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2">
                {category}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {MENU_ITEMS.filter((item) => item.category === category).map((item) => {
                  const cartItem = cart.find((i) => i.id === item.id);
                  return (
                    <div
                      key={item.id}
                      className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center"
                    >
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-amber-600 font-medium">₹{item.price}</p>
                      </div>
                      {cartItem ? (
                        <div className="flex items-center space-x-2 bg-amber-50 border border-amber-200 rounded-lg p-1">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-7 h-7 bg-white text-amber-600 rounded font-bold shadow-sm"
                          >
                            -
                          </button>
                          <span className="font-bold px-2">{cartItem.quantity}</span>
                          <button
                            onClick={() => addToCart(item)}
                            className="w-7 h-7 bg-amber-500 text-white rounded font-bold shadow-sm"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(item)}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
                        >
                          Add
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </main>

        {/* 2. Desktop Sticky Sidebar Cart */}
        <aside className="hidden lg:block">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-24 space-y-4">
            <h2 className="text-lg font-bold border-b pb-3">Order Summary</h2>
            {cart.length === 0 ? (
              <p className="text-gray-500 text-sm">Your cart is empty.</p>
            ) : (
              <>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          ₹{item.price} x {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>

                <hr />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{subtotal}</span>
                  </div>

                  {orderType === 'parcel' && (
                    <div className="flex justify-between text-amber-700 bg-amber-50 p-2 rounded-md">
                      <span>Packing Charge ({totalItemCount} items × ₹5)</span>
                      <span className="font-semibold">₹{packingCharge}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t">
                    <span>Total</span>
                    <span>₹{finalTotal}</span>
                  </div>
                </div>

                <button className="w-full py-3 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition-colors">
                  Proceed to Checkout
                </button>
              </>
            )}
          </div>
        </aside>
      </div>

      {/* 3. Mobile Sticky Bottom Cart Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-20">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <div>
            <p className="text-xs text-gray-500">{totalItemCount} Items in Cart</p>
            <p className="text-lg font-bold text-gray-900">₹{finalTotal}</p>
            {orderType === 'parcel' && packingCharge > 0 && (
              <p className="text-[10px] text-amber-700">Incl. ₹{packingCharge} packing charge</p>
            )}
          </div>
          <button
            disabled={cart.length === 0}
            className="px-6 py-2.5 bg-amber-500 disabled:bg-gray-300 text-white font-bold rounded-lg"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}