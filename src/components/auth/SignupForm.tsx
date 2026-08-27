'use client';

import { useState, useTransition } from 'react';
import { Mail, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function SignupForm() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isPending, startTransition] = useTransition();
  const [welcomeSent, setWelcomeSent] = useState(false);
  const router = Router();

  function Router() {
    try {
      return useRouter();
    } catch (e) {
      return { push: () => {} };
    }
  }

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    startTransition(async () => {
      try {
        const res = await fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'SEND_WELCOME',
            payload: {
              to: email,
              userName: name || email.split('@')[0],
              subject: 'Welcome to Sareethi Fashion — 10% OFF Voucher Inside!',
            },
          }),
        });

        const data = await res.json();
        if (data.success) {
          setWelcomeSent(true);
          setTimeout(() => {
            router.push('/catalog');
          }, 3000);
        }
      } catch (err) {
        console.error('Signup welcome email error:', err);
      }
    });
  };

  return (
    <div className="w-full text-left space-y-3">
      {welcomeSent ? (
        <div className="bg-purple-950 text-white p-4 rounded-xl text-center space-y-2 border border-purple-800 animate-in fade-in duration-300">
          <CheckCircle className="w-8 h-8 text-amber-400 mx-auto" />
          <h4 className="font-serif font-bold text-base text-amber-400">Account Created & Welcome Email Sent!</h4>
          <p className="text-xs text-purple-200">
            Check your inbox (<strong className="text-white">{email}</strong>) for your <strong className="text-amber-400">10% OFF</strong> welcome code (<code className="bg-purple-900 px-1 py-0.5 rounded">WELCOME10</code>).
          </p>
          <p className="text-[11px] text-purple-300 italic pt-1">Redirecting to catalog...</p>
        </div>
      ) : (
        <form onSubmit={handleSignup} className="space-y-3 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-950">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Fast Signup & Welcome Voucher
          </div>
          <div>
            <input
              type="text"
              placeholder="Your Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
            />
          </div>
          <div>
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
            />
          </div>
          <button
            type="submit"
            disabled={isPending || !email}
            className="w-full py-2.5 bg-purple-950 text-white font-bold text-xs rounded-xl hover:bg-purple-900 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
          >
            {isPending ? (
              'Creating Account & Sending Mail...'
            ) : (
              <>
                <Mail className="w-3.5 h-3.5 text-amber-400" /> Sign Up & Receive Welcome Email <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
