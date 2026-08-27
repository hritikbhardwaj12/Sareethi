import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/mailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body || {};

    if (action === 'SEND_FOLLOWUP') {
      const { to, customerName, messageText, subject } = payload || {};
      const recipient = to || 'customer@example.com';
      const emailSubject = subject || `Special Update from Sareethi Fashion Retail`;

      const result = await sendEmail({
        to: recipient,
        subject: emailSubject,
        customerName: customerName || 'Valued Customer',
        messageText: messageText || 'Thank you for shopping with Sareethi!',
        type: 'FOLLOWUP',
      });

      return NextResponse.json({
        success: result.success,
        error: result.error,
        channel: 'EMAIL',
        recipient,
        result,
      });
    }

    if (action === 'SEND_WELCOME') {
      const { to, userName, subject } = payload || {};
      const recipient = to || 'user@example.com';
      const emailSubject = subject || `Welcome to Sareethi Fashion — 10% OFF Your First Order!`;

      const result = await sendEmail({
        to: recipient,
        subject: emailSubject,
        customerName: userName || 'Valued Customer',
        type: 'WELCOME',
      });

      return NextResponse.json({
        success: result.success,
        error: result.error,
        channel: 'EMAIL',
        recipient,
        result,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Unsupported email action' },
      { status: 400 }
    );
  } catch (err: any) {
    console.error('[API /api/email/send Error]', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Email Sending Error' },
      { status: 500 }
    );
  }
}
