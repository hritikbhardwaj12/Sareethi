import { NextRequest, NextResponse } from 'next/server';
import {
  sendWhatsAppTextMessage,
  sendWhatsAppDocumentMessage,
  sendWhatsAppBroadcast,
} from '@/lib/whatsapp/meta-client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    if (action === 'SEND_INVOICE') {
      const { to, customerName, billNumber, orderId, totalAmount, items, invoiceUrl } = payload;

      const itemsText = Array.isArray(items)
        ? items
            .map(
              (it: any) =>
                `• ${it.product_name || it.name} (Qty: ${it.quantity || 1}) - ₹${(
                  (it.unit_price || it.price) * (it.quantity || 1)
                ).toLocaleString()}`
            )
            .join('\n')
        : '';

      const invoiceLink =
        invoiceUrl || `https://sareethi.vercel.app/invoice/${encodeURIComponent(billNumber)}`;

      const message =
        `*SAREETHI FASHION RETAIL - DIGITAL INVOICE*\n\n` +
        `Hello *${customerName || 'Valued Customer'}*,\n` +
        `Thank you for shopping with us! Here is your official purchase receipt:\n\n` +
        `📄 *Bill No:* ${billNumber}\n` +
        `📦 *Order ID:* ${orderId || 'ORD-STORE'}\n` +
        `📅 *Date:* ${new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}\n\n` +
        `*Items Purchased:*\n` +
        `${itemsText}\n\n` +
        `💰 *Total Amount Paid:* ₹${Number(totalAmount).toLocaleString()}\n` +
        `✅ *Payment Status:* Confirmed\n\n` +
        `📄 *View / Download Official Invoice:*\n` +
        `${invoiceLink}\n\n` +
        `We hope you love your purchase! Visit us again soon at Sareethi.\n` +
        `_Sareethi Fashion Retail - Deoghar & Online_`;

      const result = await sendWhatsAppTextMessage({
        to,
        message,
      });

      return NextResponse.json({ success: true, result });
    }

    if (action === 'SEND_FOLLOWUP') {
      const { to, customerName, messageText } = payload;
      const result = await sendWhatsAppTextMessage({
        to,
        message: messageText || `Hi ${customerName}, thank you for choosing Sareethi!`,
      });
      return NextResponse.json({ success: true, result });
    }

    if (action === 'SEND_BROADCAST') {
      const { recipients, messageTemplate } = payload;
      const result = await sendWhatsAppBroadcast({
        recipients,
        messageTemplate,
      });
      return NextResponse.json({ success: true, result });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('[WhatsApp Send API Error]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
