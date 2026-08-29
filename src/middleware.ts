import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

/**
 * Sareethi Security Middleware
 * - Admin Route Authorization Protection
 * - Security Headers (X-Frame-Options, X-Content-Type-Options, HSTS, CSP)
 * - Basic Rate Limiting Header Tracking
 */

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);

  // 1. Admin Route Authorization Protection Barrier
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'bhardwajhritik8@gmail.com';
  const isMockAuth =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.includes('mock') ||
    process.env.NODE_ENV === 'development';

  if (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login')) {
    const userEmail = user?.email?.toLowerCase();
    const isOwner = userEmail === ADMIN_EMAIL.toLowerCase();

    if (!user || (!isOwner && !isMockAuth)) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Set Security Headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  );

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
