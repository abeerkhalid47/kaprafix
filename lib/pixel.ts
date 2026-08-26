'use client';

export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || '';

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

// ─── Event Tracking Utility Functions ──────────────────────────────────────────

export interface PixelContentItem {
  id: string;
  quantity: number;
  item_price?: number;
  title?: string;
}

/**
 * Track Standard PageView
 */
export const trackPageView = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView');
  }
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
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_ids: data.content_ids,
      content_name: data.content_name,
      content_type: data.content_type || 'product',
      value: data.value,
      currency: data.currency || 'PKR',
    });
  }
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
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_ids: data.content_ids,
      content_name: data.content_name,
      content_type: data.content_type || 'product',
      value: data.value,
      currency: data.currency || 'PKR',
      quantity: data.quantity || 1,
      contents: data.contents || data.content_ids.map((id) => ({ id, quantity: data.quantity || 1, item_price: data.value })),
    });
  }
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
}) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      content_ids: data.content_ids || [],
      contents: data.contents || [],
      num_items: data.num_items || 1,
      value: data.value || 0,
      currency: data.currency || 'PKR',
      content_type: 'product',
    });
  }
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
}) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddPaymentInfo', {
      content_ids: data.content_ids || [],
      contents: data.contents || [],
      value: data.value || 0,
      currency: data.currency || 'PKR',
      content_type: 'product',
      payment_type: data.payment_type || 'Cash on Delivery',
    });
  }
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
}) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', {
      content_ids: data.content_ids || [],
      contents: data.contents || [],
      num_items: data.num_items || 1,
      value: data.value,
      currency: data.currency || 'PKR',
      content_type: 'product',
      order_id: data.order_id,
    }, {
      eventID: data.order_id, // For Conversions API deduplication if used
    });
  }
};
