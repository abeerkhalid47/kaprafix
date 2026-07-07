'use client';
import { useCart } from '@/context/CartContext';
import type { ShopifyProduct } from '@/lib/shopify';
import { formatPrice } from '@/lib/shopify';

export default function StickyAddToCart({ product }: { product: ShopifyProduct }) {
  const { addItem, isLoading } = useCart();
  const variant = product.variants[0];
  if (!variant) return null;

  return (
    <div className="sticky-bar" role="complementary" aria-label="Quick add to cart">
      <div className="sticky-bar__info">
        <span className="sticky-bar__price">{formatPrice(variant.price)}</span>
        {variant.compareAtPrice && (
          <span className="sticky-bar__orig">{formatPrice(variant.compareAtPrice)}</span>
        )}
      </div>
      <button
        id="sticky-atc-btn"
        className="btn btn-primary btn-lg sticky-bar__btn"
        onClick={() => addItem(variant.id, 1)}
        disabled={isLoading || !variant.availableForSale}
      >
        {isLoading ? 'Adding…' : 'Add to Cart'}
      </button>
    </div>
  );
}
