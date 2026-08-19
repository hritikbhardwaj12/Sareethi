import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-rose-50/50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl border border-rose-100 text-center">
        <div className="w-16 h-16 bg-rose-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
          S
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome to Sareethi</h1>
        <p className="text-sm text-gray-600 mb-6">
          AI-Powered Digital Operating System for Women's Fashion
        </p>

        <div className="space-y-4">
          <GoogleAuthButton label="Continue with Google" />
        </div>

        <p className="text-xs text-gray-400 mt-6">
          By continuing, you sign in to Sareethi Storefront & Admin Portal.
        </p>
      </div>
    </main>
  );
}
