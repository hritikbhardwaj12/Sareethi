import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/profile';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Send automated Welcome Email on signup
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email) {
          const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0];
          await fetch(`${origin}/api/email/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'SEND_WELCOME',
              payload: {
                to: user.email,
                userName: name,
                subject: `Welcome to Sareethi Fashion — 10% OFF Voucher Inside!`,
              },
            }),
          }).catch((err) => console.warn('Welcome Email trigger warning:', err));
        }
      } catch (welcomeErr) {
        console.warn('Welcome Email dispatch error:', welcomeErr);
      }

      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } else {
      console.error('Supabase Auth Exchange Error:', error);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=No+code+provided`);
}
