'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { Heart, Truck, RefreshCw, ShieldCheck, ChevronDown, Check } from 'lucide-react';

const PRODUCT_DETAILS_MOCK = {
  id: 'SAR-00001',
  name: 'Pink Pochampally Ikkat Chiffon Saree With Unstitched Blouse Piece',
  sku: 'SAR-00001',
  category: 'Saree',
  selling_price: 1299,
  original_price: 3899,
  discount_percent: 67,
  color: 'Pink',
  fabric: 'Chiffon Silk Blend',
  style: 'Traditional Ikkat',
  occasion: 'Festive / Wedding',
  blouse: 'Unstitched Blouse Piece Included',
  images: [
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80',
  ],
  description:
    'Step into traditional elegance with this stunning Pink Pochampally Ikkat Chiffon Saree. Featuring delicate woven borders and rich drape quality, it comes complete with an unstitched blouse piece.',
  style_notes:
    'Pair with ethnic gold earrings and subtle metallic heels for weddings or festive celebrations.',
};

export default function ProductDetailPage() {
  const params = useParams();
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(PRODUCT_DETAILS_MOCK.images[0]);
  const [pincode, setPincode] = useState('');
  const [pincodeChecked, setPincodeChecked] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addItem({
      id: PRODUCT_DETAILS_MOCK.id,
      name: PRODUCT_DETAILS_MOCK.name,
      price: PRODUCT_DETAILS_MOCK.selling_price,
      original_price: PRODUCT_DETAILS_MOCK.original_price,
      discount_percent: PRODUCT_DETAILS_MOCK.discount_percent,
      image: selectedImage,
      size: 'ONESIZE',
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-xs text-gray-400 mb-6">Home / Sarees / {PRODUCT_DETAILS_MOCK.name}</p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Gallery Grid (Libas Inspired Left Gallery) */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row gap-4">
            <div className="flex sm:flex-col gap-2 order-2 sm:order-1 overflow-x-auto sm:overflow-y-auto">
              {PRODUCT_DETAILS_MOCK.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-20 border-2 rounded-lg overflow-hidden shrink-0 ${
                    selectedImage === img ? 'border-purple-950' : 'border-gray-200'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <div className="flex-1 order-1 sm:order-2 aspect-[3/4] bg-gray-50 rounded-xl overflow-hidden relative">
              <img src={selectedImage} alt={PRODUCT_DETAILS_MOCK.name} className="w-full h-full object-cover" />
              <button aria-label="Add to Wishlist" className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-xs rounded-full text-gray-600 hover:text-rose-600">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right Product Summary & Actions (Libas PDP Card) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">SKU: {PRODUCT_DETAILS_MOCK.sku}</span>
              <h1 className="font-serif text-2xl font-bold text-gray-900 mt-1 leading-snug">
                {PRODUCT_DETAILS_MOCK.name}
              </h1>
              <div className="flex items-baseline gap-3 mt-3">
                <span className="text-2xl font-bold text-gray-900">₹{PRODUCT_DETAILS_MOCK.selling_price.toLocaleString()}</span>
                <span className="text-sm text-gray-400 line-through">₹{PRODUCT_DETAILS_MOCK.original_price.toLocaleString()}</span>
                <span className="text-xs font-bold text-rose-600">{PRODUCT_DETAILS_MOCK.discount_percent}% Off</span>
                <span className="text-[10px] text-gray-400 ml-auto">Inclusive Of All Taxes</span>
              </div>
            </div>

            {/* Size Selector */}
            <div className="border-t border-b border-gray-100 py-4">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="font-semibold text-gray-900 uppercase">Size: ONESIZE</span>
                <button className="text-purple-950 font-bold hover:underline">View Size Chart</button>
              </div>
              <div className="w-12 h-12 bg-purple-950 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                ONESIZE
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleAddToCart}
              className="w-full py-4 bg-purple-950 text-white font-bold text-sm tracking-wider uppercase rounded-lg hover:bg-purple-900 transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              {added ? <><Check className="w-5 h-5" /> ADDED TO CART</> : 'ADD TO CART'}
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
                <p className="text-gray-600 pt-2 leading-relaxed">{PRODUCT_DETAILS_MOCK.description}</p>
              </details>

              <details className="group">
                <summary className="font-semibold text-gray-900 flex justify-between items-center cursor-pointer py-2 border-b border-gray-100">
                  <span>STYLE NOTES</span>
                  <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="text-gray-600 pt-2 leading-relaxed">{PRODUCT_DETAILS_MOCK.style_notes}</p>
              </details>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
