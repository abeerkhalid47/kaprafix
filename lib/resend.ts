import { Resend } from 'resend';

export interface AdminOrderEmailInput {
  orderNumber: string;
  orderId?: string;
  customer: {
    firstName: string;
    lastName?: string;
    email?: string;
    phone: string;
  };
  shippingAddress: {
    address1: string;
    address2?: string;
    city: string;
    province?: string;
    zip?: string;
    country?: string;
  };
  lineItems: Array<{
    title: string;
    quantity: number;
    price: string | number;
  }>;
  subtotal: number;
  shippingFee: number;
  totalPrice: number;
  paymentMethod: 'bank_transfer' | 'cod';
  receiptUrl?: string | null;
  note?: string;
}

export async function sendAdminOrderEmail(input: AdminOrderEmailInput) {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    console.warn(
      '[Resend Email] RESEND_API_KEY is not configured yet. Skipping email notification to kaprafix@gmail.com.'
    );
    return { success: false, reason: 'api_key_missing' };
  }

  try {
    const resend = new Resend(apiKey);
    const isBankTransfer = input.paymentMethod === 'bank_transfer';
    const customerFullName = `${input.customer.firstName} ${input.customer.lastName || ''}`.trim();
    const formattedTotal = Number(input.totalPrice).toLocaleString();

    const subject = isBankTransfer
      ? `🚨 [BANK TRANSFER] Order ${input.orderNumber} - Rs. ${formattedTotal} (Proof Attached)`
      : `📦 [COD ORDER] Order ${input.orderNumber} - Rs. ${formattedTotal} - ${customerFullName}`;

    const itemsHtml = input.lineItems
      .map(
        (item) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 12px; font-size: 14px; color: #1e293b;">
            <strong>${item.title}</strong>
          </td>
          <td style="padding: 10px 12px; font-size: 14px; color: #475569; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 10px 12px; font-size: 14px; color: #1e293b; text-align: right; font-weight: 600;">
            Rs. ${(Number(item.price) * item.quantity).toLocaleString()}
          </td>
        </tr>
      `
      )
      .join('');

    const bankDetailsHtml = isBankTransfer
      ? `
        <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #166534; font-size: 16px; display: flex; align-items: center; gap: 6px;">
            🏦 Bank Transfer Verification Needed
          </h3>
          <p style="margin: 4px 0; font-size: 14px; color: #1e293b;">
            <strong>Target Account:</strong> Meezan Bank Limited<br />
            <strong>Account Title:</strong> ABEER KHALID<br />
            <strong>Account Number:</strong> 00300115740934<br />
            <strong>IBAN:</strong> PK68MEZN0000300115740934<br />
            <strong>Expected Transfer Amount:</strong> Rs. ${formattedTotal}
          </p>

          ${
            input.receiptUrl
              ? `
              <div style="margin-top: 14px; border-top: 1px dashed #bbf7d0; padding-top: 12px;">
                <p style="font-size: 13px; font-weight: 700; color: #166534; margin: 0 0 8px;">
                  Uploaded Payment Screenshot / Receipt:
                </p>
                <div style="text-align: center; background: #fff; padding: 10px; border-radius: 6px; border: 1px solid #dcfce7;">
                  <a href="${input.receiptUrl}" target="_blank" style="display: inline-block;">
                    <img src="${input.receiptUrl}" alt="Payment Screenshot" style="max-width: 100%; max-height: 420px; border-radius: 6px; object-fit: contain; box-shadow: 0 2px 8px rgba(0,0,0,0.08);" />
                  </a>
                  <div style="margin-top: 8px;">
                    <a href="${input.receiptUrl}" target="_blank" style="display: inline-block; background: #15803d; color: #ffffff; text-decoration: none; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 600;">
                      View Full Size Screenshot
                    </a>
                  </div>
                </div>
              </div>
            `
              : `<p style="color: #b91c1c; font-size: 13px; margin: 8px 0 0;">⚠️ No screenshot URL provided.</p>`
          }
        </div>
      `
      : `
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #334155;">
            <strong>Payment Method:</strong> Cash on Delivery (COD) — Courier collects Rs. ${formattedTotal} at delivery.
          </p>
        </div>
      `;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
            
            <!-- Header -->
            <div style="background: #1e293b; color: #ffffff; padding: 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 22px; letter-spacing: -0.02em;">KAPRA<span style="color: #4ade80;">FIX</span> ORDER ALERT</h1>
              <p style="margin: 6px 0 0; font-size: 14px; color: #94a3b8;">
                Order ${input.orderNumber} ${isBankTransfer ? '• Bank Transfer' : '• Cash on Delivery'}
              </p>
            </div>

            <div style="padding: 24px;">
              <!-- Quick Badge -->
              <div style="display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 700; ${
                isBankTransfer
                  ? 'background: #dcfce7; color: #15803d;'
                  : 'background: #e0f2fe; color: #0369a1;'
              }">
                ${isBankTransfer ? '💳 Advance Payment via Bank Transfer' : '🚚 Cash on Delivery'}
              </div>

              ${bankDetailsHtml}

              <!-- Customer Info -->
              <h3 style="color: #1e293b; font-size: 16px; margin: 24px 0 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
                Customer & Delivery Details
              </h3>
              <table style="width: 100%; font-size: 14px; color: #334155; line-height: 1.6;">
                <tr>
                  <td style="width: 130px; font-weight: 600; color: #64748b;">Customer Name:</td>
                  <td><strong>${customerFullName}</strong></td>
                </tr>
                <tr>
                  <td style="font-weight: 600; color: #64748b;">Phone:</td>
                  <td><a href="tel:${input.customer.phone}" style="color: #0284c7; text-decoration: none;">${input.customer.phone}</a> (<a href="https://wa.me/${input.customer.phone.replace(/[^0-9]/g, '')}" target="_blank" style="color: #16a34a; text-decoration: none;">WhatsApp</a>)</td>
                </tr>
                ${
                  input.customer.email
                    ? `<tr>
                        <td style="font-weight: 600; color: #64748b;">Email:</td>
                        <td><a href="mailto:${input.customer.email}" style="color: #0284c7; text-decoration: none;">${input.customer.email}</a></td>
                      </tr>`
                    : ''
                }
                <tr>
                  <td style="font-weight: 600; color: #64748b; vertical-align: top;">Address:</td>
                  <td>${input.shippingAddress.address1} ${input.shippingAddress.address2 || ''}</td>
                </tr>
                <tr>
                  <td style="font-weight: 600; color: #64748b;">City / Province:</td>
                  <td>${input.shippingAddress.city}, ${input.shippingAddress.province || 'Pakistan'} ${input.shippingAddress.zip ? `(${input.shippingAddress.zip})` : ''}</td>
                </tr>
                ${
                  input.note
                    ? `<tr>
                        <td style="font-weight: 600; color: #64748b; vertical-align: top;">Note / Instructions:</td>
                        <td style="color: #0f172a; font-style: italic;">${input.note}</td>
                      </tr>`
                    : ''
                }
              </table>

              <!-- Order Items -->
              <h3 style="color: #1e293b; font-size: 16px; margin: 24px 0 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
                Ordered Items
              </h3>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #f8fafc; border-bottom: 1px solid #cbd5e1;">
                    <th style="padding: 8px 12px; text-align: left; font-size: 12px; color: #64748b; text-transform: uppercase;">Item</th>
                    <th style="padding: 8px 12px; text-align: center; font-size: 12px; color: #64748b; text-transform: uppercase;">Qty</th>
                    <th style="padding: 8px 12px; text-align: right; font-size: 12px; color: #64748b; text-transform: uppercase;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <!-- Financial Summary -->
              <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 14px;">
                <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #64748b;">
                  <span>Subtotal:</span>
                  <span>Rs. ${input.subtotal.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #64748b;">
                  <span>Delivery Fee:</span>
                  <span style="${isBankTransfer ? 'color: #15803d; font-weight: 600;' : ''}">
                    Rs. ${input.shippingFee} ${isBankTransfer ? '(Discounted Delivery)' : ''}
                  </span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 18px; font-weight: 800; color: #0f172a; border-top: 2px solid #e2e8f0; margin-top: 6px;">
                  <span>Total Amount:</span>
                  <span style="color: #15803d;">Rs. ${formattedTotal}</span>
                </div>
              </div>

            </div>

            <!-- Footer -->
            <div style="background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
              Kaprafix Store Automated Order Notification • Sent to kaprafix@gmail.com
            </div>

          </div>
        </body>
      </html>
    `;

    const fromAddress = process.env.RESEND_FROM_EMAIL || 'Kaprafix Orders <onboarding@resend.dev>';

    const response = await resend.emails.send({
      from: fromAddress,
      to: 'kaprafix@gmail.com',
      subject: subject,
      html: html,
    });

    console.log(`[Resend Email] Successfully dispatched order notification email to kaprafix@gmail.com:`, response);
    return { success: true, response };
  } catch (error: any) {
    console.error('[Resend Email Error]: Failed to send order email:', error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
}
