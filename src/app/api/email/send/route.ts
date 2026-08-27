import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/mailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body || {};

    if (action === 'SEND_FOLLOWUP') {
      const { to, customerName, messageText, subject } = payload || {};
      const recipient = to ? to.trim() : '';

      if (!recipient || !recipient.includes('@')) {
        return NextResponse.json({ success: false, error: 'Valid recipient email address is required' }, { status: 400 });
      }

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
      const recipient = to ? to.trim() : '';

      if (!recipient || !recipient.includes('@')) {
        return NextResponse.json({ success: false, error: 'Valid recipient email address is required' }, { status: 400 });
      }

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

    if (action === 'SEND_ORDER_INVOICE') {
      const { to, customerName, orderId, items, totalPrice, shippingAddress, subject } = payload || {};
      const recipient = to ? to.trim() : '';

      if (!recipient || !recipient.includes('@')) {
        return NextResponse.json({ success: false, error: 'Valid customer email address is required' }, { status: 400 });
      }

      const emailSubject = subject || `Order Confirmed: ${orderId} Receipt & Special Follow-up from Sareethi!`;

      const result = await sendEmail({
        to: recipient,
        subject: emailSubject,
        customerName: customerName || 'Valued Customer',
        orderId: orderId || 'ORD-STORE',
        items: items || [],
        totalPrice: totalPrice || 0,
        shippingAddress: shippingAddress || '',
        type: 'ORDER_INVOICE',
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
