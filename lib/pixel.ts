'use client';

export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || '';

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

export interface PixelContentItem {
  id: string;
  quantity: number;
  item_price?: number;
  title?: string;
}

export interface PixelUserData {
  em?: string; // Email
  ph?: string; // Phone
  fn?: string; // First Name
  ln?: string; // Last Name
  ct?: string; // City
  st?: string; // State / Province
  zp?: string; // Zip
  country?: string;
}

/**
 * Safe caller for window.fbq
 */
function safeFbq(...args: any[]) {
  if (typeof window === 'undefined') return;

  if (window.fbq) {
    try {
      window.fbq(...args);
    } catch (e) {
      console.warn('[Meta Pixel] Error calling fbq:', e);
    }
  } else {
    // If fbq is not loaded yet, queue it safely
    window._fbq = window._fbq || [];
    window.fbq = function (...callArgs: any[]) {
      if (window.fbq.callMethod) {
        window.fbq.callMethod.apply(window.fbq, callArgs);
      } else {
        window.fbq.queue.push(callArgs);
      }
    };
    window.fbq.push = window.fbq;
    window.fbq.loaded = true;
    window.fbq.version = '2.0';
    window.fbq.queue = window.fbq.queue || [];
    window.fbq.queue.push(args);
  }
}

// ─── Event Tracking Utility Functions ──────────────────────────────────────────

/**
 * Track Standard PageView
 */
export const trackPageView = () => {
  safeFbq('track', 'PageView');
};

/**
 * Track Product View (ViewContent)
 */
export const trackProductView = (data: {
  content_ids: string[];
  content_name: string;
  content_type?: string;
  value?: number;
  currency?: string;
}) => {
  safeFbq('track', 'ViewContent', {
    content_ids: data.content_ids,
    content_name: data.content_name,
    content_type: data.content_type || 'product',
    value: data.value,
    currency: data.currency || 'PKR',
  });
};

/**
 * Track Add To Cart
 */
export const trackAddToCart = (data: {
  content_ids: string[];
  content_name: string;
  content_type?: string;
  value?: number;
  currency?: string;
  quantity?: number;
  contents?: PixelContentItem[];
}) => {
  safeFbq('track', 'AddToCart', {
    content_ids: data.content_ids,
    content_name: data.content_name,
    content_type: data.content_type || 'product',
    value: data.value,
    currency: data.currency || 'PKR',
    quantity: data.quantity || 1,
    contents: data.contents || data.content_ids.map((id) => ({
      id,
      quantity: data.quantity || 1,
      item_price: data.value,
    })),
  });
};

/**
 * Track Initiate Checkout
 */
export const trackInitiateCheckout = (data: {
  content_ids?: string[];
  contents?: PixelContentItem[];
  num_items?: number;
  value?: number;
  currency?: string;
  event_id?: string;
}) => {
  const eventOptions: Record<string, any> = {};
  if (data.event_id) {
    eventOptions.eventID = data.event_id;
  }

  safeFbq(
    'track',
    'InitiateCheckout',
    {
      content_ids: data.content_ids || [],
      contents: data.contents || [],
      num_items: data.num_items || 1,
      value: data.value || 0,
      currency: data.currency || 'PKR',
      content_type: 'product',
    },
    eventOptions
  );
};

/**
 * Track Add Payment Info
 */
export const trackAddPaymentInfo = (data: {
  content_ids?: string[];
  contents?: PixelContentItem[];
  value?: number;
  currency?: string;
  payment_type?: string;
  event_id?: string;
  userData?: PixelUserData;
}) => {
  const eventOptions: Record<string, any> = {};
  if (data.event_id) {
    eventOptions.eventID = data.event_id;
  }

  safeFbq(
    'track',
    'AddPaymentInfo',
    {
      content_ids: data.content_ids || [],
      contents: data.contents || [],
      value: data.value || 0,
      currency: data.currency || 'PKR',
      content_type: 'product',
      payment_type: data.payment_type || 'Cash on Delivery',
    },
    eventOptions
  );
};

/**
 * Track Purchase (with order_id for deduplication)
 */
export const trackPurchase = (data: {
  content_ids?: string[];
  contents?: PixelContentItem[];
  num_items?: number;
  value: number;
  currency?: string;
  order_id?: string;
  userData?: PixelUserData;
}) => {
  const orderIdentifier = data.order_id || `order_${Date.now()}`;

  safeFbq(
    'track',
    'Purchase',
    {
      content_ids: data.content_ids || [],
      contents: data.contents || [],
      num_items: data.num_items || 1,
      value: data.value,
      currency: data.currency || 'PKR',
      content_type: 'product',
      order_id: orderIdentifier,
    },
    {
      eventID: orderIdentifier, // Exact match with Conversions API event_id
    }
  );
};
