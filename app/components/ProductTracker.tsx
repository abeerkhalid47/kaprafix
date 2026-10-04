'use client';

import { useEffect } from 'react';
import { trackProductView } from '@/lib/pixel';
import { type ShopifyProduct } from '@/lib/shopify';
import { trackTikTokEvent } from '@/lib/tiktok';

export default function ProductTracker({ product }: { product: ShopifyProduct }) {
  useEffect(() => {
    if (product) {
      const minPrice = parseFloat(product.priceRange.minVariantPrice.amount) || 0;
      trackProductView({
        content_ids: [product.id],
        content_name: product.title,
        value: minPrice,
        currency: product.priceRange.minVariantPrice.currencyCode || 'PKR',
      });
      trackTikTokEvent('ViewContent', {
  content_type: 'product',
  content_ids: [product.id],
  description: product.title,
  value: minPrice,
  currency: product.priceRange.minVariantPrice.currencyCode || 'PKR',
});
    }
  }, [product]);

  return null;
}
