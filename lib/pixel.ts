'use client';

export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || '';

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

// ─── Event Tracking Utility Functions ──────────────────────────────────────────

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
}) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_ids: data.content_ids,
      content_name: data.content_name,
      content_type: data.content_type || 'product',
      value: data.value,
      currency: data.currency || 'PKR',
      quantity: data.quantity || 1,
    });
  }
};

/**
 * Track Initiate Checkout
 */
export const trackInitiateCheckout = (data: {
  content_ids?: string[];
  num_items?: number;
  value?: number;
  currency?: string;
}) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      content_ids: data.content_ids || [],
      num_items: data.num_items || 1,
      value: data.value || 0,
      currency: data.currency || 'PKR',
    });
  }
};

/**
 * Track Purchase
 */
export const trackPurchase = (data: {
  content_ids?: string[];
  num_items?: number;
  value: number;
  currency?: string;
}) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', {
      content_ids: data.content_ids || [],
      num_items: data.num_items || 1,
      value: data.value,
      currency: data.currency || 'PKR',
    });
  }
};
