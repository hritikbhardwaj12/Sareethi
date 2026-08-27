import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { SignupForm } from '@/components/auth/SignupForm';

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

        <div className="space-y-4">
          <GoogleAuthButton label="Continue with Google" />
          
          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">or sign up with email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <SignupForm />
        </div>

        <p className="text-[11px] text-gray-400 pt-2 border-t border-gray-100">
          By signing in, you access Sareethi Storefront & Admin Portal. Welcome emails are automatically dispatched upon registration.
        </p>
      </div>
    </main>
  );
}

