'use client';

import { useState, useTransition } from 'react';
import { X } from 'lucide-react';
import { updateProductAction, UpdateProductPayload } from '@/lib/actions/admin-store';
import { Category } from '@/types/database';

interface EditProductModalProps {
  product: {
    id: string;
    name: string;
    category: Category;
    selling_price: number;
    cost_price?: number;
    stock_quantity: number;
    color?: string;
    fabric?: string;
    style?: string;
    occasion?: string;
  };
  onClose: () => void;
}

export function EditProductModal({ product, onClose }: EditProductModalProps) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<UpdateProductPayload>({
    id: product.id,
    name: product.name,
    category: product.category,
    selling_price: product.selling_price,
    cost_price: product.cost_price || 0,
    stock_quantity: product.stock_quantity,
    color: product.color || '',
    fabric: product.fabric || '',
    style: product.style || '',
    occasion: product.occasion || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await updateProductAction(formData);
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <h2 className="font-serif text-lg font-bold text-gray-900">Edit Product ({product.id})</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Product Title</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-950 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-950 focus:outline-none bg-white"
              >
                <option value="Saree">Saree</option>
                <option value="Suit">Suit</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Stock Quantity</label>
              <input
                type="number"
                min={0}
                required
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-950 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Selling Price (₹)</label>
              <input
                type="number"
                min={1}
                required
                value={formData.selling_price}
                onChange={(e) => setFormData({ ...formData, selling_price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-950 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-rose-700 mb-1">Cost Price (Admin Only ₹)</label>
              <input
                type="number"
                min={0}
                value={formData.cost_price}
                onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-rose-200 bg-rose-50/50 rounded-lg focus:ring-1 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Color</label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-950 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Fabric</label>
              <input
                type="text"
                value={formData.fabric}
                onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-950 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 bg-purple-950 text-white rounded-lg font-medium hover:bg-purple-900 shadow-md disabled:opacity-50"
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
