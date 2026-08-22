'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { useStoreData } from '@/context/StoreDataContext';
import { Heart, Truck, RefreshCw, ShieldCheck, ChevronDown, Check, ArrowLeft } from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  const { products } = useStoreData();
  const { addItem } = useCart();

  const product = products.find((p) => p.id === productId) || products[0];

  const productImages = product?.images && product.images.length > 0
    ? product.images
    : [product?.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80'];

  const [selectedImage, setSelectedImage] = useState(productImages[0]);
  const [pincode, setPincode] = useState('');
  const [pincodeChecked, setPincodeChecked] = useState(false);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-16 text-center space-y-4">
          <h1 className="font-serif text-2xl font-bold text-gray-900">Product Not Found</h1>
          <Link href="/products" className="text-purple-950 font-bold text-xs underline">
            Return to Catalogue
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.selling_price,
      original_price: product.original_price,
      discount_percent: product.discount_percent,
      image: selectedImage || product.image,
      size: product.size || 'ONESIZE',
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link href="/products" className="hover:text-purple-950 flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Back
          </Link>
          <span>/</span>
          <span>{product.category}s</span>
          <span>/</span>
          <span className="text-gray-700 truncate max-w-xs">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Gallery Grid */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row gap-4">
            <div className="flex sm:flex-col gap-2 order-2 sm:order-1 overflow-x-auto sm:overflow-y-auto">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-20 border-2 rounded-lg overflow-hidden shrink-0 ${
                    (selectedImage || productImages[0]) === img ? 'border-purple-950' : 'border-gray-200'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <div className="flex-1 order-1 sm:order-2 aspect-[3/4] bg-gray-50 rounded-xl overflow-hidden relative">
              <img src={selectedImage || productImages[0]} alt={product.name} className="w-full h-full object-cover" />
              <button aria-label="Add to Wishlist" className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-xs rounded-full text-gray-600 hover:text-rose-600">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right Product Summary & Actions */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest font-mono">SKU: {product.id}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${product.stock_quantity > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700'}`}>
                  {product.stock_quantity > 0 ? `${product.stock_quantity} In Stock` : 'Out of Stock'}
                </span>
              </div>
              <h1 className="font-serif text-2xl font-bold text-gray-900 mt-1 leading-snug">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-3 mt-3">
                <span className="text-2xl font-bold text-gray-900">₹{product.selling_price.toLocaleString()}</span>
                {product.original_price && (
                  <span className="text-sm text-gray-400 line-through">₹{product.original_price.toLocaleString()}</span>
                )}
                {product.discount_percent && product.discount_percent > 0 && (
                  <span className="text-xs font-bold text-rose-600">{product.discount_percent}% Off</span>
                )}
                <span className="text-[10px] text-gray-400 ml-auto">Inclusive Of All Taxes</span>
              </div>
            </div>

            {/* Size Selector */}
            <div className="border-t border-b border-gray-100 py-4">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="font-semibold text-gray-900 uppercase">Size: {product.size || 'ONESIZE'}</span>
                <button className="text-purple-950 font-bold hover:underline">View Size Chart</button>
              </div>
              <div className="w-12 h-12 bg-purple-950 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                {product.size || 'ONESIZE'}
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock_quantity <= 0}
              className="w-full py-4 bg-purple-950 text-white font-bold text-sm tracking-wider uppercase rounded-lg hover:bg-purple-900 disabled:opacity-50 transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              {product.stock_quantity <= 0 ? (
                'OUT OF STOCK'
              ) : added ? (
                <><Check className="w-5 h-5" /> ADDED TO CART</>
              ) : (
                'ADD TO CART'
              )}
            </button>

            {/* Delivery Pincode Check */}
            <div className="bg-gray-50 p-4 rounded-xl space-y-3">
              <label className="text-xs font-semibold text-gray-900 block">Delivery Availability</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter your Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-950 bg-white"
                />
                <button
                  onClick={() => setPincodeChecked(true)}
                  className="px-4 py-2 bg-white border border-purple-950 text-purple-950 font-bold text-xs rounded-lg hover:bg-purple-50"
                >
                  CHECK
                </button>
              </div>
              {pincodeChecked && (
                <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Express delivery available for {pincode || 'your pin'}
                </p>
              )}
            </div>

            {/* Value Badges */}
            <div className="space-y-2 text-xs text-gray-600 pt-2">
              <p className="flex items-center gap-2"><Truck className="w-4 h-4 text-purple-950" /> Express Shipping Available</p>
              <p className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-purple-950" /> Cash on Delivery Available</p>
              <p className="flex items-center gap-2"><RefreshCw className="w-4 h-4 text-purple-950" /> Easy 7 Days Return Policy</p>
            </div>

            {/* Accordions */}
            <div className="border-t border-gray-200 pt-4 space-y-3 text-xs">
              <details className="group" open>
                <summary className="font-semibold text-gray-900 flex justify-between items-center cursor-pointer py-2 border-b border-gray-100">
                  <span>DESCRIPTION</span>
                  <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="text-gray-600 pt-2 leading-relaxed">
                  {product.description || `Step into elegance with this beautiful ${product.color || ''} ${product.name}. Handcrafted with premium ${product.fabric || 'fabric'} for graceful drapes.`}
                </p>
              </details>

              <details className="group">
                <summary className="font-semibold text-gray-900 flex justify-between items-center cursor-pointer py-2 border-b border-gray-100">
                  <span>STYLE NOTES</span>
                  <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="text-gray-600 pt-2 leading-relaxed">
                  {product.style_notes || `Pair with matching earrings and ethnic footwear for festive occasions or weddings.`}
                </p>
              </details>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
