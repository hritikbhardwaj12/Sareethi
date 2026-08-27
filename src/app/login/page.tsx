import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-purple-950/5 flex flex-col justify-center items-center p-4 font-sans">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl border border-purple-100 text-center space-y-6">
        <div>
          <div className="w-16 h-16 bg-purple-950 rounded-2xl flex items-center justify-center text-amber-400 text-2xl font-bold font-serif mx-auto mb-3 shadow-lg border border-purple-900">
            S
          </div>
          <h1 className="text-2xl font-serif font-bold text-purple-950">Welcome to Sareethi</h1>
          <p className="text-xs text-gray-500 mt-1">
            AI-Powered Digital Operating System for Women's Fashion & Festive Retail
          </p>
        </div>

        <div className="space-y-4 pt-2">
          <GoogleAuthButton label="Continue with Google" />
        </div>

        <p className="text-[11px] text-gray-400 pt-4 border-t border-gray-100">
          Sign in with Google to access Sareethi Storefront & Admin Portal. First-time signups automatically receive a welcome email with a 10% OFF voucher!
        </p>
      </div>
    </main>
  );
}


