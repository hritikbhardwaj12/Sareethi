import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 1. Guard against unconfigured or mock Supabase
  const isConfigured =
    Boolean(supabaseUrl) &&
    !supabaseUrl?.includes('example.supabase.co') &&
    Boolean(supabaseAnonKey) &&
    supabaseAnonKey !== 'example-key' &&
    !supabaseAnonKey?.includes('mock');

  if (!isConfigured) {
    return { response: supabaseResponse, user: null };
  }

  // 2. Check if auth cookies exist before making any external network requests
  const cookies = request.cookies.getAll();
  const hasAuthCookie = cookies.some(
    (c) => c.name.startsWith('sb-') && (c.name.includes('token') || c.name.includes('auth'))
  );

  if (!hasAuthCookie) {
    return { response: supabaseResponse, user: null };
  }

  try {
    const supabase = createServerClient(
      supabaseUrl!,
      supabaseAnonKey!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // 3. Enforce a strict 2.5-second timeout to prevent Vercel 504 Edge Middleware Invocation Timeout
    const timeoutPromise = new Promise<{ data: { user: null }; error: Error }>((resolve) =>
      setTimeout(() => resolve({ data: { user: null }, error: new Error('Supabase getUser timeout') }), 2500)
    );

    const {
      data: { user },
    } = await Promise.race([supabase.auth.getUser(), timeoutPromise]);

    return { response: supabaseResponse, user };
  } catch (err) {
    console.error('Middleware updateSession error:', err);
    return { response: supabaseResponse, user: null };
  }
}
