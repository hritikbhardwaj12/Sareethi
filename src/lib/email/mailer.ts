import nodemailer from 'nodemailer';

export interface SendEmailOptions {
  to: string;
  subject: string;
  customerName?: string;
  messageText?: string;
  orderId?: string;
  items?: Array<{ name: string; price: number; quantity: number; image?: string; size?: string }>;
  totalPrice?: number;
  shippingAddress?: string;
  type?: 'FOLLOWUP' | 'WELCOME' | 'ORDER_INVOICE' | 'CUSTOM';
}

export function renderFollowupEmailHtml(customerName: string, messageText: string): string {
  const name = customerName || 'Valued Customer';
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exclusive Update from Sareethi</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Georgia', 'Times New Roman', serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 1px solid #f1f5f9;">
          
          <!-- Brand Header -->
          <tr>
            <td style="background-color: #2e0229; padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; color: #f59e0b; font-size: 28px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">
                SAREETHI
              </h1>
              <p style="margin: 6px 0 0 0; color: #f3e8ff; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; font-family: sans-serif;">
                Women's Fashion & Festive Retail
              </p>
            </td>
          </tr>

          <!-- Decorative Accent Bar -->
          <tr>
            <td style="background: linear-gradient(90deg, #d97706 0%, #f59e0b 50%, #d97706 100%); height: 4px;"></td>
          </tr>

          <!-- Email Content Body -->
          <tr>
            <td style="padding: 36px 32px;">
              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #2e0229;">
                Hello ${name},
              </h2>

              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #334155; font-family: sans-serif;">
                We hope you are having a wonderful day! Here is an exclusive personal update from our team at Sareethi:
              </p>

              <!-- Highlighted Message Box -->
              <div style="background-color: #faf5ff; border-left: 4px solid #7e22ce; border-radius: 8px; padding: 20px 24px; margin-bottom: 28px;">
                <p style="margin: 0; font-size: 15px; line-height: 1.7; color: #4c1d95; font-style: italic; font-family: 'Georgia', serif;">
                  "${messageText}"
                </p>
              </div>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 28px 0 20px 0;">
                <tr>
                  <td align="center" style="border-radius: 12px; background-color: #2e0229;">
                    <a href="https://sareethi.vercel.app/catalog" target="_blank" style="font-size: 14px; font-family: sans-serif; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 12px; padding: 14px 28px; display: inline-block; background-color: #2e0229; border: 1px solid #4c1d95;">
                      Explore New Arrivals &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 28px 0 0 0; font-size: 14px; line-height: 1.5; color: #64748b; font-family: sans-serif;">
                Warm regards,<br>
                <strong style="color: #2e0229;">The Sareethi AI Customer Care Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1e1b1e; padding: 24px; text-align: center; font-family: sans-serif; font-size: 12px; color: #94a3b8; border-top: 1px solid #334155;">
              <p style="margin: 0 0 8px 0; font-weight: 600; color: #e2e8f0;">
                Sareethi Fashion Retail • Luxury Sarees & Suits
              </p>
              <p style="margin: 0; color: #64748b; font-size: 11px;">
                Deoghar Outlet & Online Storefront • <a href="https://sareethi.vercel.app" style="color: #f59e0b; text-decoration: none;">sareethi.vercel.app</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function renderWelcomeEmailHtml(userName: string): string {
  const name = userName || 'Valued Fashion Lover';
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Sareethi Fashion</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Georgia', 'Times New Roman', serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 1px solid #f1f5f9;">
          
          <!-- Brand Header -->
          <tr>
            <td style="background-color: #2e0229; padding: 36px 24px; text-align: center;">
              <div style="display: inline-block; background-color: #2e0229; border: 2px solid #4a0a43; color: #f59e0b; font-weight: bold; width: 48px; height: 48px; line-height: 48px; border-radius: 14px; font-size: 26px; margin-bottom: 12px; font-family: Georgia, serif; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                S
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 700; letter-spacing: 1.5px;">
                Welcome to Sareethi
              </h1>
              <p style="margin: 6px 0 0 0; color: #f3e8ff; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; font-family: sans-serif;">
                Handcrafted Festive Sarees & Suit Ensembles
              </p>
            </td>
          </tr>

          <!-- Gold Line -->
          <tr>
            <td style="background: linear-gradient(90deg, #d97706 0%, #f59e0b 50%, #d97706 100%); height: 4px;"></td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 32px;">
              <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #2e0229;">
                Welcome, ${name}! ✨
              </h2>

              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #334155; font-family: sans-serif;">
                Thank you for joining Sareethi! We are thrilled to have you as part of our exclusive fashion community. Discover our curated collection of Pochampally Ikkat, Banarsi silk sarees, Chanderi suits, and festive wear.
              </p>

              <!-- Special Welcome Discount Card -->
              <div style="background-color: #fffbe0; border: 2px dashed #d97706; border-radius: 12px; padding: 20px 24px; margin: 24px 0; text-align: center;">
                <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #92400e; text-transform: uppercase; font-family: sans-serif; letter-spacing: 1px;">
                  Exclusive Welcome Offer
                </p>
                <h3 style="margin: 0 0 8px 0; font-size: 24px; color: #78350f; font-weight: bold;">
                  10% OFF YOUR FIRST ORDER
                </h3>
                <p style="margin: 0 0 12px 0; font-size: 13px; color: #a16207; font-family: sans-serif;">
                  Use voucher code at checkout:
                </p>
                <div style="display: inline-block; background-color: #2e0229; color: #f59e0b; font-family: monospace; font-size: 18px; font-weight: bold; padding: 8px 20px; border-radius: 8px; letter-spacing: 2px;">
                  WELCOME10
                </div>
              </div>

              <!-- CTA -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 28px 0 20px 0; width: 100%;">
                <tr>
                  <td align="center">
                    <a href="https://sareethi.vercel.app/catalog" target="_blank" style="font-size: 15px; font-family: sans-serif; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 12px; padding: 14px 32px; display: inline-block; background-color: #2e0229; border: 1px solid #4c1d95;">
                      Start Shopping Now &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 28px 0 0 0; font-size: 14px; line-height: 1.5; color: #64748b; font-family: sans-serif;">
                Need styling assistance or order help? Our team is always here for you.<br><br>
                Warmest regards,<br>
                <strong style="color: #2e0229;">The Sareethi Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1e1b1e; padding: 24px; text-align: center; font-family: sans-serif; font-size: 12px; color: #94a3b8; border-top: 1px solid #334155;">
              <p style="margin: 0 0 8px 0; font-weight: 600; color: #e2e8f0;">
                Sareethi Fashion Retail
              </p>
              <p style="margin: 0; color: #64748b; font-size: 11px;">
                You received this email because you signed up on Sareethi • <a href="https://sareethi.vercel.app" style="color: #f59e0b; text-decoration: none;">sareethi.vercel.app</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function renderOrderInvoiceEmailHtml(
  customerName: string,
  orderId: string,
  items: Array<{ name: string; price: number; quantity: number; image?: string; size?: string }>,
  totalPrice: number,
  shippingAddress: string
): string {
  const name = customerName || 'Valued Customer';
  const itemList = items || [];
  const total = totalPrice || 0;

  const itemRowsHtml = itemList
    .map(
      (it) => `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 12px 0; font-family: sans-serif; font-size: 13px; color: #1e293b;">
          <strong>${it.name}</strong><br>
          <span style="font-size: 11px; color: #64748b;">Qty: ${it.quantity || 1} • Size: ${it.size || 'ONESIZE'}</span>
        </td>
        <td align="right" style="padding: 12px 0; font-family: sans-serif; font-size: 13px; font-weight: bold; color: #2e0229;">
          ₹${((it.price || 0) * (it.quantity || 1)).toLocaleString()}
        </td>
      </tr>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Receipt & Invoice — Sareethi Fashion</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Georgia', 'Times New Roman', serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 1px solid #f1f5f9;">
          
          <!-- Brand Header -->
          <tr>
            <td style="background-color: #2e0229; padding: 36px 24px; text-align: center;">
              <div style="display: inline-block; background-color: #2e0229; border: 2px solid #4a0a43; color: #f59e0b; font-weight: bold; width: 48px; height: 48px; line-height: 48px; border-radius: 14px; font-size: 26px; margin-bottom: 12px; font-family: Georgia, serif; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                S
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 700; letter-spacing: 1.5px;">
                Thank You for Your Order!
              </h1>
              <p style="margin: 6px 0 0 0; color: #f3e8ff; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; font-family: sans-serif;">
                Order Confirmation & Official Bill Receipt
              </p>
            </td>
          </tr>

          <!-- Gold Accent Line -->
          <tr>
            <td style="background: linear-gradient(90deg, #d97706 0%, #f59e0b 50%, #d97706 100%); height: 4px;"></td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #2e0229;">
                Hello ${name},
              </p>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #334155; font-family: sans-serif;">
                We have received your order <strong>${orderId}</strong> and our workshop is carefully preparing your garments for dispatch! Here is your official order receipt:
              </p>

              <!-- Order Summary Box -->
              <div style="background-color: #faf5ff; border: 1px solid #e9d5ff; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <table width="100%" cellspacing="0" cellpadding="0" style="font-family: sans-serif; font-size: 13px;">
                  <tr>
                    <td style="color: #6b21a8; font-weight: bold;">Order Reference:</td>
                    <td align="right" style="color: #2e0229; font-weight: bold; font-family: monospace; font-size: 14px;">${orderId}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b21a8; font-weight: bold; padding-top: 6px;">Payment Status:</td>
                    <td align="right" style="color: #15803d; font-weight: bold; padding-top: 6px;">CONFIRMED ✓</td>
                  </tr>
                  ${
                    shippingAddress
                      ? `
                  <tr>
                    <td colSpan="2" style="padding-top: 10px; border-top: 1px solid #f3e8ff; color: #4c1d95; font-size: 12px;">
                      <strong>Delivery Address:</strong> ${shippingAddress}
                    </td>
                  </tr>
                  `
                      : ''
                  }
                </table>
              </div>

              <!-- Itemized Table -->
              <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: bold; color: #2e0229; text-transform: uppercase; font-family: sans-serif; letter-spacing: 0.5px;">
                Purchased Garments
              </h3>
              <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; border-collapse: collapse;">
                ${itemRowsHtml}
                <tr>
                  <td style="padding: 16px 0 0 0; font-family: sans-serif; font-size: 15px; font-weight: bold; color: #1e293b;">
                    Total Paid
                  </td>
                  <td align="right" style="padding: 16px 0 0 0; font-family: sans-serif; font-size: 18px; font-weight: bold; color: #2e0229;">
                    ₹${total.toLocaleString()}
                  </td>
                </tr>
              </table>

              <!-- AI Worker Loyalty Thank-You & Follow-up Box -->
              <div style="background-color: #fffbe0; border: 2px dashed #d97706; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 28px;">
                <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; color: #92400e; text-transform: uppercase; font-family: sans-serif; letter-spacing: 1px;">
                  Exclusive Sareethi Reward
                </p>
                <h4 style="margin: 0 0 8px 0; font-size: 18px; color: #78350f; font-weight: bold;">
                  GET 5% OFF YOUR NEXT SAREE & SUIT PURCHASE!
                </h4>
                <p style="margin: 0 0 10px 0; font-size: 12px; color: #a16207; font-family: sans-serif;">
                  We love having you in our Sareethi family! Use code at your next checkout:
                </p>
                <div style="display: inline-block; background-color: #2e0229; color: #f59e0b; font-family: monospace; font-size: 16px; font-weight: bold; padding: 6px 18px; border-radius: 6px; letter-spacing: 1.5px;">
                  THANKYOU5
                </div>
              </div>

              <!-- Action Buttons -->
              <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="https://sareethi.vercel.app/orders" target="_blank" style="font-size: 14px; font-family: sans-serif; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 10px; padding: 12px 24px; display: inline-block; background-color: #2e0229; margin-right: 8px;">
                      Track Order Status &rarr;
                    </a>
                    <a href="https://sareethi.vercel.app/products" target="_blank" style="font-size: 14px; font-family: sans-serif; font-weight: bold; color: #2e0229; text-decoration: none; border-radius: 10px; padding: 12px 24px; display: inline-block; background-color: #f3e8ff; border: 1px solid #d8b4fe;">
                      Shop Collection
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #64748b; font-family: sans-serif;">
                Have questions about your order? Reply directly to this email or contact customer care.<br><br>
                Warmest regards,<br>
                <strong style="color: #2e0229;">Sareethi AI Customer Operations Worker</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1e1b1e; padding: 20px; text-align: center; font-family: sans-serif; font-size: 11px; color: #94a3b8; border-top: 1px solid #334155;">
              <p style="margin: 0 0 6px 0; font-weight: 600; color: #e2e8f0;">
                Sareethi Fashion Retail • Handcrafted Sarees & Designer Suits
              </p>
              <p style="margin: 0; color: #64748b;">
                Deoghar Outlet & Online Storefront • <a href="https://sareethi.vercel.app" style="color: #f59e0b; text-decoration: none;">sareethi.vercel.app</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function sendEmail(options: SendEmailOptions) {
  const {
    to,
    subject,
    customerName = '',
    messageText = '',
    orderId = '',
    items = [],
    totalPrice = 0,
    shippingAddress = '',
    type = 'FOLLOWUP',
  } = options;

  let html = renderFollowupEmailHtml(customerName, messageText);
  if (type === 'WELCOME') {
    html = renderWelcomeEmailHtml(customerName);
  } else if (type === 'ORDER_INVOICE') {
    html = renderOrderInvoiceEmailHtml(customerName, orderId, items, totalPrice, shippingAddress);
  }

  // Check for external SMTP environment variables
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : undefined;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const isGmail = smtpHost.toLowerCase().includes('gmail');
      const transporterConfig: any = isGmail
        ? {
            service: 'gmail',
            auth: { user: smtpUser, pass: smtpPass },
          }
        : {
            host: smtpHost,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
            auth: { user: smtpUser, pass: smtpPass },
          };

      const transporter = nodemailer.createTransport(transporterConfig);
      const sender = process.env.EMAIL_FROM || `"Sareethi Fashion" <${smtpUser}>`;

      const info = await transporter.sendMail({
        from: sender,
        to,
        subject,
        html,
      });

      console.log(`[SMTP Live Dispatch Success] Sent email to ${to}, Message ID: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId,
        channel: 'EMAIL',
        mode: 'LIVE_SMTP',
        recipient: to,
      };
    } catch (err: any) {
      console.error('[SMTP Transport Failure]', err?.message || err);
      return {
        success: false,
        error: err?.message || 'SMTP Authentication / Transport Error',
        channel: 'EMAIL',
        mode: 'SMTP_FAILED',
        recipient: to,
      };
    }
  }

  // Fallback when environment variables are not set on server
  console.log(`[ENV MISSING] SMTP_HOST/USER/PASS missing on server. Sent to: ${to}`);

  return {
    success: false,
    error: 'Vercel Environment Variables (SMTP_HOST, SMTP_USER, SMTP_PASS) not detected on server. Please redeploy Vercel project.',
    channel: 'EMAIL',
    mode: 'ENV_VARIABLES_MISSING',
    recipient: to,
  };
}
