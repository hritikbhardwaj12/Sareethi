import Link from 'next/link';
import { Heart, Star } from 'lucide-react';
import { Product } from '@/types/database';

interface ProductCardProps {
  product: Product & {
    images?: { image_url: string; is_primary: boolean }[];
    product_attributes?: { color?: string; fabric?: string; size?: string }[];
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage =
    product.images?.find((img) => img.is_primary)?.image_url ||
    product.images?.[0]?.image_url ||
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';

  const fabric = product.product_attributes?.[0]?.fabric;
  const size = product.product_attributes?.[0]?.size || 'ONESIZE';

  return (
    <div className="group relative flex flex-col bg-white rounded-lg overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300">
      <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
        {/* NEW Badge */}
        <span className="absolute top-2 left-2 z-10 bg-white/90 backdrop-blur-xs text-[10px] font-bold text-gray-900 px-2 py-0.5 rounded uppercase tracking-wider">
          NEW
        </span>

        {/* Wishlist Button */}
        <button
          aria-label="Add to Wishlist"
          className="absolute top-2 right-2 z-10 w-8 h-8 bg-white/80 backdrop-blur-xs rounded-full flex items-center justify-center text-gray-600 hover:text-rose-600 transition-colors shadow-xs"
        >
          <Heart className="w-4 h-4" />
        </button>

        {/* Product Image */}
        <Link href={`/products/${product.id}`} className="block w-full h-full">
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Rating Badge Overlay */}
        <div className="absolute bottom-2 left-2 z-10 bg-white/90 backdrop-blur-xs px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 text-gray-800 shadow-xs">
          <span>4.60</span>
          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
          <span className="text-gray-400 border-l border-gray-200 pl-1">5</span>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-3 flex flex-col flex-1 justify-between">
        <div>
          <Link href={`/products/${product.id}`} className="block">
            <h3 className="text-xs font-semibold text-gray-900 line-clamp-1 group-hover:text-purple-900 transition-colors">
              {product.name}
            </h3>
          </Link>
          {fabric && <p className="text-[11px] text-gray-500 mt-0.5">{fabric}</p>}
        </div>

        <div className="mt-2 pt-2 border-t border-gray-50">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-gray-900">₹{product.selling_price.toLocaleString()}</span>
            {product.original_price && (
              <span className="text-xs text-gray-400 line-through">₹{product.original_price.toLocaleString()}</span>
            )}
            {product.discount_percent && product.discount_percent > 0 && (
              <span className="text-[11px] font-bold text-rose-600 ml-auto">{product.discount_percent}% OFF</span>
            )}
          </div>
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">{size}</p>
        </div>
      </div>
    </div>
  );
}
