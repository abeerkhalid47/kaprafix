'use client';

import { useEffect } from 'react';
import { trackProductView } from '@/lib/pixel';
import { type ShopifyProduct } from '@/lib/shopify';

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
    }
  }, [product]);

  return null;
}
