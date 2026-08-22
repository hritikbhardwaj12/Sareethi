'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { useStoreData } from '@/context/StoreDataContext';
import { Filter, SlidersHorizontal, ChevronDown } from 'lucide-react';

export default function ProductListingPage() {
  const { products } = useStoreData();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedColor, setSelectedColor] = useState<string>('ALL');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const activeProducts = products.filter((p) => p.status !== 'DELETED');

  const filteredProducts = activeProducts.filter((p) => {
    if (selectedCategory !== 'ALL' && p.category !== selectedCategory) return false;
    if (selectedColor !== 'ALL' && p.color !== selectedColor) return false;
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
                  onClick={() => {
                    setSelectedCategory('ALL');
                    setSelectedColor('ALL');
                  }}
                  className="text-[11px] text-rose-600 font-semibold hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <span className="font-bold text-gray-900 block uppercase tracking-wider text-[11px]">Category</span>
              <div className="space-y-1.5">
                {['ALL', 'Saree', 'Suit'].map((cat) => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer text-gray-700 hover:text-purple-950">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === cat}
                      onChange={() => setSelectedCategory(cat)}
                      className="accent-purple-950"
                    />
                    <span>{cat === 'ALL' ? 'All Styles' : `${cat}s`}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Color Filter */}
            <div className="space-y-2 pt-4 border-t border-gray-100">
              <span className="font-bold text-gray-900 block uppercase tracking-wider text-[11px]">Color Palette</span>
              <div className="grid grid-cols-2 gap-2">
                {['ALL', 'Pink', 'Black', 'Mustard', 'Burgundy', 'Blue', 'Green'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-2.5 py-1.5 rounded text-left border transition-colors ${
                      selectedColor === color
                        ? 'border-purple-950 bg-purple-50 font-bold text-purple-950'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <p className="text-sm font-semibold text-gray-800">No products match your selected filters.</p>
                <button
                  onClick={() => {
                    setSelectedCategory('ALL');
                    setSelectedColor('ALL');
                  }}
                  className="text-xs text-purple-950 font-bold underline"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
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
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-end">
          <div className="bg-white w-72 h-full p-6 space-y-6 overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="font-bold text-sm text-gray-900">Filters</h2>
              <button onClick={() => setMobileFilterOpen(false)} className="text-xs font-bold text-gray-500">
                Close
              </button>
            </div>
            {/* Category Filter */}
            <div className="space-y-2">
              <span className="font-bold text-gray-900 text-xs block">Category</span>
              {['ALL', 'Saree', 'Suit'].map((cat) => (
                <label key={cat} className="flex items-center gap-2 text-xs">
                  <input
                    type="radio"
                    name="mobile-cat"
                    checked={selectedCategory === cat}
                    onChange={() => setSelectedCategory(cat)}
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
            {/* Color Filter */}
            <div className="space-y-2 pt-3 border-t">
              <span className="font-bold text-gray-900 text-xs block">Color</span>
              {['ALL', 'Pink', 'Black', 'Mustard', 'Burgundy', 'Blue', 'Green'].map((col) => (
                <label key={col} className="flex items-center gap-2 text-xs">
                  <input
                    type="radio"
                    name="mobile-col"
                    checked={selectedColor === col}
                    onChange={() => setSelectedColor(col)}
                  />
                  <span>{col}</span>
                </label>
              ))}
            </div>
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full py-2.5 bg-purple-950 text-white font-bold text-xs rounded-lg mt-4"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
