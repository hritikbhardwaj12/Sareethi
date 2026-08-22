import { NextRequest, NextResponse } from 'next/server';

const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || 'sareethi_meta_webhook_secret_2026';

/**
 * Meta Webhook Handshake Verification (GET)
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[Meta Webhook Verified Successfully]');
    return new Response(challenge, { status: 200 });
  }

  return new Response('Verification token mismatch', { status: 403 });
}

/**
 * Meta Webhook Incoming Event Receiver (POST)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('[Meta Webhook Event Received]:', JSON.stringify(body, null, 2));

    // Handle delivery receipts or incoming customer replies if needed
    return NextResponse.json({ status: 'EVENT_RECEIVED' });
  } catch (err: any) {
    console.error('[Meta Webhook Error]:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
