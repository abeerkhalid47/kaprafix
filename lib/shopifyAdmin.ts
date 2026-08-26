/**
 * Shopify Admin API Integration for Headless In-App Checkout
 */

export interface CreateOrderLineItemInput {
  variantId: string;
  quantity: number;
  price?: string | number;
  title?: string;
}

export interface CustomerAddressInput {
  firstName: string;
  lastName?: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string;
  country?: string;
  zip?: string;
}

export interface CreateOrderInput {
  customer: {
    firstName: string;
    lastName?: string;
    email?: string;
    phone: string;
  };
  shippingAddress: CustomerAddressInput;
  lineItems: CreateOrderLineItemInput[];
  note?: string;
  tags?: string[];
  totalPrice?: number;
}

export interface ShopifyOrderResult {
  success: boolean;
  orderId: string;
  orderNumber: string;
  totalPrice: string;
  currency: string;
  statusUrl?: string | null;
  isMock?: boolean;
  error?: string;
}

/**
 * Extracts numeric ID from Shopify GraphQL ID (e.g. "gid://shopify/ProductVariant/46519123456789" -> 46519123456789)
 */
function extractNumericId(id: string): number | null {
  if (!id) return null;
  const cleaned = id.trim();
  if (/^\d+$/.test(cleaned)) {
    return parseInt(cleaned, 10);
  }
  const match = cleaned.match(/ProductVariant\/(\d+)/);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  const anyNum = cleaned.match(/(\d{8,})/);
  if (anyNum && anyNum[1]) {
    return parseInt(anyNum[1], 10);
  }
  return null;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAdminAccessToken(domain: string): Promise<string | null> {
  // 1. Direct Admin Access Token (shpat_...)
  if (process.env.SHOPIFY_ADMIN_ACCESS_TOKEN && process.env.SHOPIFY_ADMIN_ACCESS_TOKEN !== 'your_admin_access_token_here') {
    return process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  }

  // 2. Client Credentials Grant using Client ID & Client Secret (shpss_...)
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

  if (clientId && clientSecret) {
    if (cachedToken && cachedToken.expiresAt > Date.now() + 60000) {
      return cachedToken.token;
    }

    try {
      const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
      const tokenUrl = `https://${cleanDomain}/admin/oauth/access_token`;

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId.trim(),
          client_secret: clientSecret.trim(),
          grant_type: 'client_credentials',
        }),
      });

      const data = await response.json();
      if (response.ok && data.access_token) {
        cachedToken = {
          token: data.access_token,
          expiresAt: Date.now() + ((data.expires_in || 86400) * 1000),
        };
        return data.access_token;
      } else {
        console.error('[Shopify OAuth Token Error]:', data);
      }
    } catch (err) {
      console.error('Error exchanging Shopify client credentials for token:', err);
    }
  }

  return null;
}

function normalizePakistanPhone(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.trim().replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+92')) {
    return cleaned;
  }
  if (cleaned.startsWith('0092')) {
    return '+' + cleaned.slice(2);
  }
  if (cleaned.startsWith('92')) {
    return '+' + cleaned;
  }
  if (cleaned.startsWith('0')) {
    return '+92' + cleaned.slice(1);
  }
  if (cleaned.length === 10 && cleaned.startsWith('3')) {
    return '+92' + cleaned;
  }
  return cleaned.startsWith('+') ? cleaned : `+92${cleaned}`;
}

/**
 * Places an order via Shopify Admin REST API (COD / Pending financial status)
 */
export async function createShopifyOrder(
  input: CreateOrderInput
): Promise<ShopifyOrderResult> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN || 'kaprafix.myshopify.com';
  const adminToken = await getAdminAccessToken(domain);

  // If no admin token configured yet, create simulated order response so development/testing works seamlessly
  if (!adminToken) {
    console.warn(
      '[Shopify Admin API] Neither SHOPIFY_ADMIN_ACCESS_TOKEN nor SHOPIFY_CLIENT_ID/SHOPIFY_CLIENT_SECRET is configured. Creating simulated order.'
    );
    const mockOrderNum = `KFX-${Math.floor(1000 + Math.random() * 9000)}`;
    const mockOrderId = `mock_${Date.now()}`;
    const calculatedTotal =
      input.totalPrice !== undefined
        ? input.totalPrice.toString()
        : input.lineItems
            .reduce(
              (sum, item) =>
                sum + (parseFloat(item.price?.toString() || '0') || 0) * item.quantity,
              0
            )
            .toString();

    return {
      success: true,
      orderId: mockOrderId,
      orderNumber: mockOrderNum,
      totalPrice: calculatedTotal || '0',
      currency: 'PKR',
      isMock: true,
    };
  }

  try {
    const formattedPhone = normalizePakistanPhone(input.customer.phone || input.shippingAddress.phone);
    const cleanEmail = input.customer.email && input.customer.email.includes('@') ? input.customer.email.trim() : undefined;

    // Format line items for Shopify REST Order API
    const formattedLineItems = input.lineItems.map((item) => {
      const numericVariantId = extractNumericId(item.variantId);
      const lineItemObj: Record<string, any> = {
        quantity: item.quantity,
      };

      if (numericVariantId) {
        lineItemObj.variant_id = numericVariantId;
      }
      if (item.price) {
        lineItemObj.price = item.price.toString();
      }
      if (item.title) {
        lineItemObj.title = item.title;
      }
      return lineItemObj;
    });

    const tags = [
      'NextJS In-App Checkout',
      'Cash on Delivery',
      'COD',
      ...(input.tags || []),
    ].join(', ');

    const orderPayload = {
      order: {
        line_items: formattedLineItems,
        customer: {
          first_name: input.customer.firstName,
          last_name: input.customer.lastName || '',
          email: cleanEmail,
        },
        shipping_address: {
          first_name: input.shippingAddress.firstName,
          last_name: input.shippingAddress.lastName || '',
          phone: formattedPhone || undefined,
          address1: input.shippingAddress.address1,
          address2: input.shippingAddress.address2 || '',
          city: input.shippingAddress.city,
          province: input.shippingAddress.province || '',
          country: input.shippingAddress.country || 'Pakistan',
          zip: input.shippingAddress.zip || '',
        },
        billing_address: {
          first_name: input.shippingAddress.firstName,
          last_name: input.shippingAddress.lastName || '',
          phone: formattedPhone || undefined,
          address1: input.shippingAddress.address1,
          city: input.shippingAddress.city,
          province: input.shippingAddress.province || '',
          country: input.shippingAddress.country || 'Pakistan',
          zip: input.shippingAddress.zip || '',
        },
        email: cleanEmail,
        phone: formattedPhone || undefined,
        note: input.note || 'Order placed via Kaprafix in-app checkout (Cash on Delivery)',
        financial_status: 'pending', // Cash on delivery
        tags: tags,
        send_receipt: Boolean(cleanEmail),
        send_fulfillment_receipt: Boolean(cleanEmail),
        shipping_lines: [
          {
            title: 'Standard Delivery (Cash on Delivery)',
            price: '200.00',
            code: 'COD_200',
          },
        ],
      },
    };

    const apiVersion = process.env.SHOPIFY_API_VERSION || '2026-07';
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const endpoint = `https://${cleanDomain}/admin/api/${apiVersion}/orders.json`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': adminToken,
      },
      body: JSON.stringify(orderPayload),
    });

    const responseData = await response.json();

    if (!response.ok || !responseData.order) {
      const errorMsg =
        responseData?.errors && typeof responseData.errors === 'object'
          ? JSON.stringify(responseData.errors)
          : responseData?.errors || responseData?.message || 'Shopify Order API error';
      console.error('[Shopify Admin API Error]:', errorMsg);
      throw new Error(`Shopify Order Creation Failed: ${errorMsg}`);
    }

    const createdOrder = responseData.order;

    return {
      success: true,
      orderId: createdOrder.id.toString(),
      orderNumber: createdOrder.name || `#${createdOrder.order_number}`,
      totalPrice: createdOrder.total_price || createdOrder.current_total_price || '0',
      currency: createdOrder.currency || 'PKR',
      statusUrl: createdOrder.order_status_url || null,
      isMock: false,
    };
  } catch (error: any) {
    console.error('Error in createShopifyOrder:', error);
    return {
      success: false,
      orderId: '',
      orderNumber: '',
      totalPrice: '0',
      currency: 'PKR',
      error: error?.message || 'Failed to place order with Shopify',
    };
  }
}
