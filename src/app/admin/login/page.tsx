import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { SareethiLogo } from '@/components/ui/SareethiLogo';
import { ShieldCheck, Cpu, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Admin Portal Login — Sareethi Store Control Center',
  description: 'Authorized Store Owner Login for Sareethi AI-Operated Digital Operating System.',
};

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-purple-950 flex flex-col justify-center items-center p-4 font-sans text-white relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-purple-900/60 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl border border-purple-800 text-center space-y-6 relative z-10">
        <div className="flex flex-col items-center">
          <Link href="/products" className="inline-flex items-center gap-1.5 text-xs text-purple-300 hover:text-amber-400 mb-6 transition-colors self-start">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Storefront
          </Link>

          <SareethiLogo size="xl" showText={false} textColor="light" className="mb-3" />

          <span className="bg-amber-400 text-purple-950 text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md mb-2 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> STORE OWNER ADMIN PORTAL
          </span>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">Admin Control Login</h1>
          <p className="text-xs text-purple-200 mt-1 max-w-xs">
            Sign in to access your Sareethi Control Center, Billing Engine, and AI Worker.
          </p>
        </div>

        <div className="space-y-4 pt-2">
          <GoogleAuthButton label="Sign In with Google (Admin)" nextUrl="/admin/dashboard" />
        </div>

        <div className="pt-4 border-t border-purple-800/80 space-y-3">
          <div className="flex items-center justify-center gap-2 text-[11px] text-emerald-400 font-mono">
            <Cpu className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>AI Worker: OPERATIONAL & SECURED</span>
          </div>

          <p className="text-[10px] text-purple-300">
            Protected by Level 3 Autonomy Policy & Supabase RLS. Financial actions, catalog operations, and approvals require authenticated owner credentials.
          </p>
        </div>

        <div className="pt-2">
          <Link href="/login" className="text-xs text-amber-400 hover:underline font-medium">
            Not an Admin? Go to Customer Login &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}
