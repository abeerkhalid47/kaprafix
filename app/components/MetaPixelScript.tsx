'use client';

import Script from 'next/script';

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

/**
 * Meta Pixel Script Loader Component
 */
export default function MetaPixelScript() {
  if (!FB_PIXEL_ID) {
    return null;
  }

  return (
    <>
      <Script
        id="fb-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${FB_PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
