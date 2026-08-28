'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Receipt, Sparkles, Shield, RotateCcw, AlertTriangle, Users, AlertOctagon, Cpu, Package, LogOut } from 'lucide-react';
import { SareethiLogo } from '@/components/ui/SareethiLogo';
import { signOutAdmin } from '@/lib/auth/actions';

export function AdminHeader() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Orders', href: '/admin/orders', icon: Package },
    { label: 'Store', href: '/admin/store', icon: ShoppingBag },
    { label: 'Catalogue', href: '/admin/catalogue', icon: Sparkles },
    { label: 'Billing', href: '/admin/billing', icon: Receipt },
    { label: 'Returns', href: '/admin/returns', icon: RotateCcw },
    { label: 'Exceptions', href: '/admin/exceptions', icon: AlertTriangle },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Approvals', href: '/admin/approvals', icon: Shield },
  ];

  return (
    <header className="bg-purple-950 text-white border-b border-purple-900 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <SareethiLogo size="sm" showText={true} textColor="light" />
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
          <form action={signOutAdmin} className="inline-block">
            <button
              type="submit"
              className="text-purple-200 hover:text-white underline text-[11px] flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" /> Logout Admin
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
