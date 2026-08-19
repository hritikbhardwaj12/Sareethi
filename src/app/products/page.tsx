'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { Filter, SlidersHorizontal, ChevronDown } from 'lucide-react';

const PRODUCTS_DATA = [
  {
    id: 'SAR-00001',
    name: 'Pink Pochampally Ikkat Chiffon Saree With Unstitched Blouse Piece',
    category: 'Saree' as const,
    selling_price: 1299,
    original_price: 3899,
    discount_percent: 67,
    status: 'ACTIVE' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', is_primary: true }],
    product_attributes: [{ color: 'Pink', fabric: 'Chiffon', size: 'ONESIZE', occasion: 'Festive' }],
  },
  {
    id: 'SAR-00002',
    name: 'Black Woven Design Banarsi Silk Blend Saree',
    category: 'Saree' as const,
    selling_price: 1349,
    original_price: 4249,
    discount_percent: 68,
    status: 'ACTIVE' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80', is_primary: true }],
    product_attributes: [{ color: 'Black', fabric: 'Banarsi Silk Blend', size: 'ONESIZE', occasion: 'Wedding' }],
  },
  {
    id: 'SAR-00003',
    name: 'Mustard Printed Silk Blend Saree With Zari Border',
    category: 'Saree' as const,
    selling_price: 999,
    original_price: 3449,
    discount_percent: 71,
    status: 'ACTIVE' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ image_url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80', is_primary: true }],
    product_attributes: [{ color: 'Mustard', fabric: 'Silk Blend', size: 'ONESIZE', occasion: 'Casual' }],
  },
  {
    id: 'SAR-00004',
    name: 'Burgundy Solid Satin Saree With Embellished Border',
    category: 'Saree' as const,
    selling_price: 979,
    original_price: 2949,
    discount_percent: 67,
    status: 'ACTIVE' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ image_url: 'https://images.unsplash.com/photo-1610030469668-98e550d6193c?auto=format&fit=crop&w=800&q=80', is_primary: true }],
    product_attributes: [{ color: 'Burgundy', fabric: 'Satin', size: 'ONESIZE', occasion: 'Party' }],
  },
  {
    id: 'SUIT-00001',
    name: 'Royal Blue Straight Chanderi Silk Suit Set With Dupatta',
    category: 'Suit' as const,
    selling_price: 1899,
    original_price: 4999,
    discount_percent: 62,
    status: 'ACTIVE' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80', is_primary: true }],
    product_attributes: [{ color: 'Blue', fabric: 'Chanderi Silk', size: 'M', occasion: 'Festive' }],
  },
  {
    id: 'SUIT-00002',
    name: 'Emerald Green Anarkali Cotton Suit Set',
    category: 'Suit' as const,
    selling_price: 1699,
    original_price: 3999,
    discount_percent: 57,
    status: 'ACTIVE' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', is_primary: true }],
    product_attributes: [{ color: 'Green', fabric: 'Cotton', size: 'L', occasion: 'Casual' }],
  },
];

export default function ProductListingPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedColor, setSelectedColor] = useState<string>('ALL');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const filteredProducts = PRODUCTS_DATA.filter((p) => {
    if (selectedCategory !== 'ALL' && p.category !== selectedCategory) return false;
    if (selectedColor !== 'ALL' && p.product_attributes[0]?.color !== selectedColor) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb & Category Header */}
        <div className="border-b border-gray-100 pb-6 mb-8">
          <p className="text-xs text-gray-400 mb-1">Home / Sarees & Suits for Women</p>
          <h1 className="font-serif text-3xl font-bold text-gray-900">Women's Collection</h1>
          <p className="text-xs text-gray-500 mt-2 max-w-2xl leading-relaxed">
            Discover exquisite sarees and suit sets crafted with traditional handloom techniques, vibrant shades, and elegant embroidery.
          </p>
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
            <span>Showing {filteredProducts.length} items</span>
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="md:hidden flex items-center gap-1.5 font-semibold text-purple-950 border border-gray-200 px-3 py-1.5 rounded-lg"
            >
              <Filter className="w-3.5 h-3.5" /> Filters
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filter Sidebar (Libas Style) */}
          <aside className="hidden md:block w-64 shrink-0 space-y-6 text-xs border-r border-gray-100 pr-6">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200 font-bold uppercase tracking-wider text-gray-900">
              <span className="flex items-center gap-1.5"><SlidersHorizontal className="w-3.5 h-3.5" /> Filters</span>
              {(selectedCategory !== 'ALL' || selectedColor !== 'ALL') && (
                <button
                  onClick={() => { setSelectedCategory('ALL'); setSelectedColor('ALL'); }}
                  className="text-rose-600 text-[10px] lowercase hover:underline"
                >
                  reset
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <div className="flex items-center justify-between font-semibold text-gray-900 mb-2">
                <span>CATEGORY</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <div className="space-y-1.5 pl-1">
                {['ALL', 'Saree', 'Suit'].map((cat) => (
                  <label key={cat} className="flex items-center gap-2 text-gray-600 hover:text-purple-950 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === cat}
                      onChange={() => setSelectedCategory(cat)}
                      className="accent-purple-950"
                    />
                    <span>{cat === 'ALL' ? 'All Categories' : cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Color Filter */}
            <div>
              <div className="flex items-center justify-between font-semibold text-gray-900 mb-2">
                <span>COLORS</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <div className="space-y-1.5 pl-1">
                {['ALL', 'Pink', 'Black', 'Mustard', 'Burgundy', 'Blue', 'Green'].map((col) => (
                  <label key={col} className="flex items-center gap-2 text-gray-600 hover:text-purple-950 cursor-pointer">
                    <input
                      type="radio"
                      name="color"
                      checked={selectedColor === col}
                      onChange={() => setSelectedColor(col)}
                      className="accent-purple-950"
                    />
                    <span>{col}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Fabric */}
            <div>
              <div className="flex items-center justify-between font-semibold text-gray-900 mb-2">
                <span>FABRIC</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <div className="space-y-1 text-gray-500 pl-1">
                <p>Chiffon</p>
                <p>Banarsi Silk</p>
                <p>Chanderi Silk</p>
                <p>Cotton</p>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
