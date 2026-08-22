'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { useStoreData } from '@/context/StoreDataContext';

export default function HomePage() {
  const { products } = useStoreData();
  const activeProducts = products.filter((p) => p.status !== 'DELETED').slice(0, 4);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Header />

      <main className="flex-1">
        {/* Mobile-First Hero Banner */}
        <section className="relative bg-purple-950 text-white overflow-hidden py-16 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#e0e7ff_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-900/80 rounded-full text-xs font-semibold text-purple-200 border border-purple-800">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> New Festive Arrivals 2026
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              Grace, Tradition & Modern Elegance
            </h1>
            <p className="text-sm sm:text-base text-purple-200 max-w-xl mx-auto leading-relaxed">
              Explore our handpicked collection of festive sarees, Banarsi silks, and designer suit sets crafted for women who appreciate timeless beauty.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Link
                href="/products"
                className="px-6 py-3 bg-white text-purple-950 font-medium text-sm rounded-lg hover:bg-purple-50 transition-colors shadow-md flex items-center gap-2"
              >
                Shop Sarees <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/products"
                className="px-6 py-3 bg-purple-900/60 text-white font-medium text-sm rounded-lg border border-purple-700 hover:bg-purple-900 transition-colors"
              >
                Shop Suit Sets
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Pillars */}
        <section className="border-b border-gray-100 bg-gray-50/50 py-6">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-3 gap-2 text-center">
            <div className="flex flex-col items-center">
              <Truck className="w-5 h-5 text-purple-900 mb-1" />
              <span className="text-[11px] font-bold text-gray-900">Express Shipping</span>
              <span className="text-[10px] text-gray-500">Across India</span>
            </div>
            <div className="flex flex-col items-center border-x border-gray-200">
              <ShieldCheck className="w-5 h-5 text-purple-900 mb-1" />
              <span className="text-[11px] font-bold text-gray-900">100% Authentic</span>
              <span className="text-[10px] text-gray-500">Handloom Quality</span>
            </div>
            <div className="flex flex-col items-center">
              <RefreshCw className="w-5 h-5 text-purple-900 mb-1" />
              <span className="text-[11px] font-bold text-gray-900">Easy Returns</span>
              <span className="text-[10px] text-gray-500">7-Day Guarantee</span>
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">Featured Sarees & Suits</h2>
              <p className="text-xs text-gray-500 mt-1">Discover trending ethnic wear curated for modern women</p>
            </div>
            <Link href="/products" className="text-xs font-bold text-purple-950 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {activeProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name,
                  category: product.category,
                  selling_price: product.selling_price,
                  original_price: product.original_price,
                  discount_percent: product.discount_percent,
                  status: product.status,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  images: (product.images || [product.image]).map((img, i) => ({
                    image_url: img,
                    is_primary: i === 0,
                  })),
                  product_attributes: [
                    {
                      color: product.color,
                      fabric: product.fabric,
                      size: product.size || 'ONESIZE',
                      occasion: product.occasion,
                    },
                  ],
                }}
              />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
