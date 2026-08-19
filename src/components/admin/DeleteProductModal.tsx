'use client';

import { useTransition } from 'react';
import { AlertTriangle } from 'lucide-react';
import { deleteProductAction } from '@/lib/actions/admin-store';

interface DeleteProductModalProps {
  product: { id: string; name: string };
  onClose: () => void;
}

export function DeleteProductModal({ product, onClose }: DeleteProductModalProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteProductAction(product.id);
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="font-serif text-lg font-bold text-gray-900">Delete Product?</h3>
        <p className="text-xs text-gray-600 leading-relaxed">
          Are you sure you want to delete <span className="font-bold text-gray-900">{product.name}</span> ({product.id})? This will perform a soft deletion and record an audit log.
        </p>

        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={isPending}
            className="w-1/2 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            CANCEL
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="w-1/2 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 shadow-md disabled:opacity-50"
          >
            {isPending ? 'Deleting...' : 'DELETE'}
          </button>
        </div>
      </div>
    </div>
  );
}
