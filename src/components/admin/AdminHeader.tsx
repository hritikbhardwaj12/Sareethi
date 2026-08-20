'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Receipt, Sparkles, Shield, RotateCcw, AlertTriangle, Users, AlertOctagon, Cpu } from 'lucide-react';

export function AdminHeader() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Store', href: '/admin/store', icon: ShoppingBag },
    { label: 'Catalogue', href: '/admin/catalogue', icon: Sparkles },
    { label: 'Billing', href: '/admin/billing', icon: Receipt },
    { label: 'Returns', href: '/admin/returns', icon: RotateCcw },
    { label: 'Exceptions', href: '/admin/exceptions', icon: AlertTriangle },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Failure Demo', href: '/admin/failure-demo', icon: AlertOctagon },
    { label: 'Approvals', href: '/admin/approvals', icon: Shield },
  ];

  return (
    <header className="bg-purple-950 text-white border-b border-purple-900 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold tracking-tight text-white">Sareethi</span>
            <span className="bg-amber-400 text-purple-950 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded">
              ADMIN
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    isActive
                      ? 'bg-purple-900 text-white font-bold'
                      : 'text-purple-200 hover:bg-purple-900/50 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 bg-purple-900/80 border border-purple-800 px-3 py-1.5 rounded-full">
            <Cpu className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-purple-200 font-mono text-[11px]">AI Worker:</span>
            <span className="font-bold text-emerald-400">OPERATIONAL</span>
          </div>
          <Link href="/products" className="text-purple-200 hover:text-white underline text-[11px]">
            Exit Admin
          </Link>
        </div>
      </div>
    </header>
  );
}
