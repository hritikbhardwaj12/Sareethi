/**
 * Meta WhatsApp Cloud API Client
 * Sends automated transactional messages, PDF documents, and bulk promotional broadcasts.
 */

export interface WhatsAppTextMessageParams {
  to: string;
  message: string;
}

export interface WhatsAppDocumentMessageParams {
  to: string;
  documentUrl: string;
  fileName: string;
  caption?: string;
}

export interface WhatsAppBroadcastParams {
  recipients: { phone: string; name: string }[];
  messageTemplate: string;
}

export interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  simulated?: boolean;
}

function cleanPhoneNumber(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 10) {
    return `91${digits}`; // Default India Country Code
  }
  return digits;
}

const DEFAULT_TOKEN =
  process.env.META_WHATSAPP_TOKEN ||
  'EAAPOadgSZCp4BSYCsAg8f2LOZBIl2f3y0t4V2Nsvn2OgpYbvrsZAXqc4ZALhGZAPchg3ARm9tU6m0opLbRFUw2iGWDUbEx7Pm6tYxHdnRZAWW3cxMbmqIUluuQj8C9BIGYY1xgvjTjwsktkWtJ4Sl9R4xQG2VsEpxQ8pYryZAOK3EvsdmxFLdqEcTJaWkwsEF7scjm0ZArAcBVmIgR9ZAwMAlVVO52ERFFLwLckroziAWEtR9cOH6HZA2OHrwiSJg7BA55eNuU0jeN5qyma4vaj8vjDl2ZA7wZDZD';

const DEFAULT_PHONE_ID = process.env.META_PHONE_NUMBER_ID || '1269767522888414';

/**
 * Sends a text message to a WhatsApp number via Meta Cloud API.
 */
export async function sendWhatsAppTextMessage({
  to,
  message,
}: WhatsAppTextMessageParams): Promise<WhatsAppResponse> {
  const token = DEFAULT_TOKEN;
  const phoneNumberId = DEFAULT_PHONE_ID;
  const recipient = cleanPhoneNumber(to);

  if (!token || !phoneNumberId || token.startsWith('mock-')) {
    console.log(`[Meta WhatsApp Simulation] To: ${recipient}\nMessage:\n${message}`);
    return {
      success: true,
      messageId: `sim_${Date.now()}`,
      simulated: true,
    };
  }

  try {
    const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;

    // Attempt 1: Standard formatted text message
    let res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipient,
        type: 'text',
        text: {
          preview_url: true,
          body: message,
        },
      }),
    });

    let data = await res.json();

    // If Meta requires an active template (e.g. outside 24h window), send official template
    if (!res.ok && (data.error?.code === 131047 || data.error?.message?.includes('template'))) {
      console.log('[Meta WhatsApp] Outside 24hr window, sending pre-approved template fallback...');
      res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: recipient,
          type: 'template',
          template: {
            name: 'hello_world',
            language: {
              code: 'en_US',
            },
          },
        }),
      });
      data = await res.json();
    }

    if (!res.ok) {
      console.error('[Meta WhatsApp API Error]', data);
      return {
        success: false,
        error: data.error?.message || 'Failed to send WhatsApp message via Meta Cloud API',
      };
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    };
  } catch (err: any) {
    console.error('[Meta WhatsApp Network Error]', err);
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Sends a PDF document attachment via Meta WhatsApp Cloud API.
 */
export async function sendWhatsAppDocumentMessage({
  to,
  documentUrl,
  fileName,
  caption,
}: WhatsAppDocumentMessageParams): Promise<WhatsAppResponse> {
  const token = DEFAULT_TOKEN;
  const phoneNumberId = DEFAULT_PHONE_ID;
  const recipient = cleanPhoneNumber(to);

  if (!token || !phoneNumberId || token.startsWith('mock-')) {
    console.log(`[Meta WhatsApp Doc Simulation] To: ${recipient}, File: ${fileName}, URL: ${documentUrl}`);
    return {
      success: true,
      messageId: `sim_doc_${Date.now()}`,
      simulated: true,
    };
  }

  try {
    const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipient,
        type: 'document',
        document: {
          link: documentUrl,
          filename: fileName,
          caption: caption || '',
        },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('[Meta WhatsApp Doc API Error]', data);
      return {
        success: false,
        error: data.error?.message || 'Failed to send document via Meta Cloud API',
      };
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    };
  } catch (err: any) {
    console.error('[Meta WhatsApp Doc Network Error]', err);
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Sends a promotional broadcast to a list of customer recipients.
 */
export async function sendWhatsAppBroadcast({
  recipients,
  messageTemplate,
}: WhatsAppBroadcastParams): Promise<{ total: number; sent: number; failed: number; results: any[] }> {
  let sent = 0;
  let failed = 0;
  const results: any[] = [];

  for (const customer of recipients) {
    const personalizedMessage = messageTemplate
      .replace(/{{name}}/gi, customer.name)
      .replace(/{{customer_name}}/gi, customer.name);

    const res = await sendWhatsAppTextMessage({
      to: customer.phone,
      message: personalizedMessage,
    });

    if (res.success) {
      sent++;
    } else {
      failed++;
    }

    results.push({
      phone: customer.phone,
      name: customer.name,
      status: res.success ? 'SENT' : 'FAILED',
      messageId: res.messageId,
      error: res.error,
    });

    // Small throttling delay between messages
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  return {
    total: recipients.length,
    sent,
    failed,
    results,
  };
}
