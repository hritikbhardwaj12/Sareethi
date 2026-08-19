import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-purple-950 text-purple-100 border-t border-purple-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-serif text-2xl font-bold text-white mb-3">Sareethi</h3>
          <p className="text-xs text-purple-200 leading-relaxed">
            AI-operated fashion retail operating platform. Beautiful sarees, suits, and ethnic wear curated for modern elegance.
          </p>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-3">Shop Categories</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/products?category=Saree" className="hover:text-white transition-colors">Festive Sarees</Link></li>
            <li><Link href="/products?category=Saree" className="hover:text-white transition-colors">Banarsi Silk Sarees</Link></li>
            <li><Link href="/products?category=Suit" className="hover:text-white transition-colors">Anarkali Suit Sets</Link></li>
            <li><Link href="/products?category=Suit" className="hover:text-white transition-colors">Chanderi Suits</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-3">Customer Care</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/orders" className="hover:text-white transition-colors">Track Orders</Link></li>
            <li><Link href="/profile" className="hover:text-white transition-colors">Account Profile</Link></li>
            <li><span className="text-purple-300">Easy 7 Days Return Policy</span></li>
            <li><span className="text-purple-300">Express Shipping Available</span></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-3">Store Policy</h4>
          <p className="text-xs text-purple-200">
            Powered by Sareethi AI Worker. Operational automation keeping local retailers in complete control.
          </p>
        </div>
      </div>
      <div className="border-t border-purple-900/50 text-center py-6 text-[11px] text-purple-400">
        © 2026 Sareethi AI Retail Operating System. All Rights Reserved.
      </div>
    </footer>
  );
}
