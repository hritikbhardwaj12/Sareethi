'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function signInWithGoogle() {
  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function signOutAdmin() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

export async function getCurrentProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return {
    user,
    profile,
    isAdmin: profile?.role_id === 'OWNER',
  };
}

export async function updateProfileDetails(phone: string, shippingAddress: string, fullName?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const updatePayload: Record<string, any> = {
    email: user.email,
    phone: phone || null,
    shipping_address: shippingAddress || null,
    updated_at: new Date().toISOString()
  };

  if (fullName) {
    updatePayload.full_name = fullName;
  }

  const { error } = await supabase
    .from('profiles')
    .update(updatePayload)
    .eq('id', user.id);

  if (error) {
    throw new Error(error.message);
  }

  const { revalidatePath } = await import('next/cache');
  revalidatePath('/profile');
}

export async function sendWelcomeEmailAction(userEmail: string, userName?: string) {
  const { sendEmail } = await import('@/lib/email/mailer');
  const result = await sendEmail({
    to: userEmail,
    subject: 'Welcome to Sareethi Fashion — 10% OFF Voucher Inside!',
    customerName: userName || 'Valued Customer',
    type: 'WELCOME',
  });
  return result;
}

