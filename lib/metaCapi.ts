import crypto from 'crypto';

export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || '';
export const META_CAPI_ACCESS_TOKEN =
  process.env.META_CONVERSIONS_API_ACCESS_TOKEN ||
  process.env.FACEBOOK_CONVERSIONS_API_ACCESS_TOKEN ||
  process.env.META_ACCESS_TOKEN ||
  '';
export const META_TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE || '';

/**
 * Normalizes and SHA-256 hashes string data as required by Meta CAPI
 */
export function hashData(value?: string | null): string | undefined {
  if (!value) return undefined;
  const clean = value.trim().toLowerCase();
  if (!clean) return undefined;
  return crypto.createHash('sha256').update(clean).digest('hex');
}

/**
 * Normalizes phone numbers to E.164 without '+' or leading zeros, then hashes
 */
export function hashPhone(phone?: string | null): string | undefined {
  if (!phone) return undefined;
  let cleaned = phone.replace(/[^\d]/g, '');
  if (cleaned.startsWith('0092')) {
    cleaned = '92' + cleaned.slice(4);
  } else if (cleaned.startsWith('0')) {
    cleaned = '92' + cleaned.slice(1);
  } else if (cleaned.length === 10 && cleaned.startsWith('3')) {
    cleaned = '92' + cleaned;
  }
  return hashData(cleaned);
}

export interface MetaCapiEventPayload {
  eventName: 'Purchase' | 'AddPaymentInfo' | 'InitiateCheckout' | 'AddToCart' | 'ViewContent';
  eventId: string;
  eventTime?: number;
  eventSourceUrl?: string;
  user: {
    clientIpAddress?: string | null;
    clientUserAgent?: string | null;
    fbp?: string | null;
    fbc?: string | null;
    email?: string | null;
    phone?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    city?: string | null;
    province?: string | null;
    country?: string | null;
    zip?: string | null;
  };
  customData?: {
    value?: number;
    currency?: string;
    content_name?: string;
    content_type?: string;
    content_ids?: string[];
    contents?: Array<{
      id: string;
      quantity: number;
      item_price?: number;
      title?: string;
    }>;
    num_items?: number;
    order_id?: string;
    payment_type?: string;
  };
}

/**
 * Sends a Server-Side Event to Meta Conversions API (Graph API v20.0)
 */
export async function sendMetaCapiEvent(payload: MetaCapiEventPayload): Promise<{ success: boolean; data?: any; error?: string }> {
  if (!FB_PIXEL_ID || !META_CAPI_ACCESS_TOKEN) {
    // If token is not configured, log helpful info and exit gracefully without throwing
    if (!META_CAPI_ACCESS_TOKEN) {
      console.log('[Meta CAPI] Skipped: META_CONVERSIONS_API_ACCESS_TOKEN is not configured in .env');
    }
    return { success: false, error: 'Meta Pixel ID or Access Token not configured' };
  }

  try {
    const eventTime = payload.eventTime || Math.floor(Date.now() / 1000);

    const userData: Record<string, any> = {};

    if (payload.user.clientIpAddress) userData.client_ip_address = payload.user.clientIpAddress;
    if (payload.user.clientUserAgent) userData.client_user_agent = payload.user.clientUserAgent;
    if (payload.user.fbp) userData.fbp = payload.user.fbp;
    if (payload.user.fbc) userData.fbc = payload.user.fbc;

    const hashedEmail = hashData(payload.user.email);
    if (hashedEmail) userData.em = [hashedEmail];

    const hashedPhone = hashPhone(payload.user.phone);
    if (hashedPhone) userData.ph = [hashedPhone];

    const hashedFn = hashData(payload.user.firstName);
    if (hashedFn) userData.fn = [hashedFn];

    const hashedLn = hashData(payload.user.lastName);
    if (hashedLn) userData.ln = [hashedLn];

    const hashedCity = hashData(payload.user.city);
    if (hashedCity) userData.ct = [hashedCity];

    const hashedState = hashData(payload.user.province);
    if (hashedState) userData.st = [hashedState];

    const hashedZip = hashData(payload.user.zip);
    if (hashedZip) userData.zp = [hashedZip];

    userData.country = [hashData(payload.user.country || 'pk')];

    const eventObject: Record<string, any> = {
      event_name: payload.eventName,
      event_time: eventTime,
      event_id: payload.eventId,
      event_source_url: payload.eventSourceUrl || 'https://kaprafix.com/checkout',
      action_source: 'website',
      user_data: userData,
      custom_data: payload.customData || {},
    };

    const requestBody: Record<string, any> = {
      data: [eventObject],
    };

    if (META_TEST_EVENT_CODE) {
      requestBody.test_event_code = META_TEST_EVENT_CODE;
    }

    const endpoint = `https://graph.facebook.com/v20.0/${FB_PIXEL_ID}/events?access_token=${META_CAPI_ACCESS_TOKEN}`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      console.error('[Meta CAPI Error]:', data.error || data);
      return { success: false, error: data.error?.message || 'Failed to dispatch Meta CAPI event' };
    }

    console.log(`[Meta CAPI Success] Event "${payload.eventName}" dispatched successfully (event_id: ${payload.eventId})`);
    return { success: true, data };
  } catch (err: any) {
    console.error('[Meta CAPI Exception]:', err);
    return { success: false, error: err.message };
  }
}
