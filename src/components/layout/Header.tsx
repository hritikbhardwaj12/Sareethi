'use client';

import Link from 'next/link';
import { ShoppingBag, Search, User, Menu, X, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export function Header() {
  const { totalItems, isOpen, setIsOpen, items, removeItem, updateQuantity, totalAmount } = useCart();

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="p-2 -ml-2 text-gray-700 hover:text-purple-900 md:hidden" aria-label="Open menu">
              <Menu className="w-5 h-5" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold text-purple-950 tracking-tight">Sareethi</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
            <Link href="/" className="hover:text-purple-900 transition-colors">Home</Link>
            <Link href="/products?category=Saree" className="hover:text-purple-900 transition-colors">Sarees</Link>
            <Link href="/products?category=Suit" className="hover:text-purple-900 transition-colors">Suits</Link>
            <Link href="/products" className="hover:text-purple-900 transition-colors">New Arrivals</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/products" className="p-2 text-gray-700 hover:text-purple-900 transition-colors" aria-label="Search">
              <Search className="w-5 h-5" />
            </Link>
            <Link href="/profile" className="p-2 text-gray-700 hover:text-purple-900 transition-colors" aria-label="User Profile">
              <User className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setIsOpen(true)}
              className="p-2 text-gray-700 hover:text-purple-900 transition-colors relative"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 bg-purple-900 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Slide-over Cart Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={() => setIsOpen(false)} />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-serif font-bold text-gray-900">Shopping Cart ({totalItems})</h2>
                <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {items.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Your cart is currently empty.</p>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="flex gap-4 border-b border-gray-100 pb-4">
                      <img src={item.image} alt={item.name} className="w-20 h-24 object-cover rounded-lg bg-gray-50" />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-xs font-semibold text-gray-900 line-clamp-2">{item.name}</h3>
                          <div className="mt-1 flex items-baseline gap-2">
                            <span className="text-sm font-bold text-gray-900">₹{item.price.toLocaleString()}</span>
                            {item.original_price && (
                              <span className="text-xs text-gray-400 line-through">₹{item.original_price.toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-gray-200 rounded">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-0.5 text-xs text-gray-600">-</button>
                            <span className="px-2 text-xs font-medium">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-0.5 text-xs text-gray-600">+</button>
                          </div>
                          <button onClick={() => removeItem(item.id)} className="text-xs text-rose-600 hover:underline">Remove</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {items.length > 0 && (
                <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-4">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <span>Subtotal</span>
                    <span>₹{totalAmount.toLocaleString()}</span>
                  </div>
                  <Link
                    href="/checkout"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-3.5 bg-purple-950 text-white font-medium text-sm rounded-lg flex items-center justify-center gap-2 hover:bg-purple-900 transition-colors shadow-md"
                  >
                    PLACE ORDER <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
