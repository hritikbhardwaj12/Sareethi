'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { EditProductModal } from '@/components/admin/EditProductModal';
import { DeleteProductModal } from '@/components/admin/DeleteProductModal';
import { Edit3, Trash2, Shield, Eye, DollarSign } from 'lucide-react';
import { Category } from '@/types/database';

const INITIAL_ADMIN_PRODUCTS = [
  {
    id: 'SAR-00001',
    name: 'Pink Pochampally Ikkat Chiffon Saree With Unstitched Blouse Piece',
    category: 'Saree' as Category,
    selling_price: 1299,
    cost_price: 750,
    original_price: 3899,
    discount_percent: 67,
    stock_quantity: 12,
    status: 'ACTIVE',
    color: 'Pink',
    fabric: 'Chiffon',
    style: 'Traditional Ikkat',
    occasion: 'Festive',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'SAR-00002',
    name: 'Black Woven Design Banarsi Silk Blend Saree',
    category: 'Saree' as Category,
    selling_price: 1349,
    cost_price: 800,
    original_price: 4249,
    discount_percent: 68,
    stock_quantity: 8,
    status: 'ACTIVE',
    color: 'Black',
    fabric: 'Banarsi Silk Blend',
    style: 'Classic Woven',
    occasion: 'Wedding',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'SUIT-00001',
    name: 'Royal Blue Straight Chanderi Silk Suit Set With Dupatta',
    category: 'Suit' as Category,
    selling_price: 1899,
    cost_price: 1100,
    original_price: 4999,
    discount_percent: 62,
    stock_quantity: 10,
    status: 'ACTIVE',
    color: 'Blue',
    fabric: 'Chanderi Silk',
    style: 'Straight',
    occasion: 'Festive',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
  },
];

export default function AdminStorePage() {
  const [products, setProducts] = useState(INITIAL_ADMIN_PRODUCTS);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<{ id: string; name: string } | null>(null);

  const activeProducts = products.filter((p) => p.status !== 'DELETED');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Store Bar */}
        <div className="bg-purple-950 text-white p-6 rounded-2xl shadow-lg mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              <h1 className="font-serif text-2xl font-bold">Admin Store Management</h1>
            </div>
            <p className="text-xs text-purple-200 mt-1">
              Store Owner Mode: Manage catalogue items, update private cost prices, edit stock, or soft-delete products.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/products"
              className="px-4 py-2 bg-purple-900 text-white text-xs font-semibold rounded-lg hover:bg-purple-800 flex items-center gap-1.5 border border-purple-700"
            >
              <Eye className="w-3.5 h-3.5" /> Customer View
            </Link>
          </div>
        </div>

        {/* Product Cards Grid with Admin Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeProducts.map((p) => (
            <div key={p.id} className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-xs flex flex-col">
              <div className="relative aspect-[3/4] bg-gray-100">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 bg-purple-950 text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                  {p.id}
                </span>
                <span className="absolute top-2 right-2 bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  {p.stock_quantity} in stock
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-gray-900 line-clamp-2">{p.name}</h3>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-gray-900 text-sm">₹{p.selling_price.toLocaleString()}</span>
                      <span className="text-gray-400 line-through text-[11px] ml-1.5">₹{p.original_price.toLocaleString()}</span>
                    </div>
                    <div className="bg-rose-50 text-rose-700 border border-rose-100 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-0.5">
                      <DollarSign className="w-3 h-3" /> Cost: ₹{p.cost_price}
                    </div>
                  </div>
                  <p className="text-[11px] text-emerald-700 font-medium mt-1">
                    Profit Margin: ₹{(p.selling_price - p.cost_price).toLocaleString()}
                  </p>
                </div>

                {/* Owner Control Actions */}
                <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setEditingProduct(p)}
                    className="w-full py-2 bg-purple-950 text-white font-bold text-xs rounded-lg hover:bg-purple-900 flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> [ EDIT ]
                  </button>
                  <button
                    onClick={() => setDeletingProduct({ id: p.id, name: p.name })}
                    className="w-full py-2 bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs rounded-lg hover:bg-rose-100 flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> [ DELETE ]
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Edit Modal */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <DeleteProductModal
          product={deletingProduct}
          onClose={() => setDeletingProduct(null)}
        />
      )}

      <Footer />
    </div>
  );
}
