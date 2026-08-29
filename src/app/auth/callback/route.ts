import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/mailer';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'bhardwajhritik8@gmail.com';

      // Direct automated Welcome Email dispatch & Profile role assignment
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email) {
          const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0];
          const isOwnerEmail = user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

          // Save Google signup email and profile details to Supabase database profiles table
          try {
            await supabase.from('profiles').upsert({
              id: user.id,
              email: user.email,
              full_name: name,
              role_id: isOwnerEmail ? 'OWNER' : 'CUSTOMER',
              updated_at: new Date().toISOString(),
            }, { onConflict: 'id' });
          } catch (dbErr) {
            console.warn('Profile DB upsert notice:', dbErr);
          }

          // If user tried to sign in to admin portal with non-admin email
          if (next.startsWith('/admin') && !isOwnerEmail) {
            return NextResponse.redirect(`${origin}/admin/login?error=unauthorized`);
          }

          await sendEmail({
            to: user.email,
            subject: 'Welcome to Sareethi Fashion — 10% OFF Voucher Inside!',
            customerName: name,
            type: 'WELCOME',
          });
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
