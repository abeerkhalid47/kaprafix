'use client';
import { useCart } from '@/context/CartContext';
import type { ShopifyProduct } from '@/lib/shopify';
import { formatPrice } from '@/lib/shopify';

interface FinalCTAProps {
  product: ShopifyProduct;
  isProductPage?: boolean;
}

export default function FinalCTA({ product, isProductPage = true }: FinalCTAProps) {
  const { addItem, isLoading } = useCart();
  const variant = product.variants[0];

  return (
    <section className="final-cta">
      <div className="container">
        <p className="label" style={{ color: 'rgba(255,255,255,.5)', marginBottom: 12 }}>Limited Stock Available</p>
        <h2 className="display">Still Thinking?</h2>
        <p>Join thousands of happy customers across Pakistan who fixed their clothes in minutes — without a single stitch.</p>
        {variant && (
          isProductPage ? (
            <button
              id="final-cta-btn"
              className="btn btn-accent"
              onClick={() => addItem(variant.id, 1)}
              disabled={isLoading || !variant.availableForSale}
            >
              {isLoading ? 'Adding…' : `Order Now — ${formatPrice(variant.price)}`}
            </button>
          ) : (
            <a
              id="final-cta-btn"
              href="/product"
              className="btn btn-accent"
              style={{ display: 'inline-flex' }}
            >
              Order Now — {formatPrice(variant.price)}
            </a>
          )
        )}
        <div className="final-cta__badges" style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
          <span style={{ color: 'rgba(255,255,255,.6)', fontSize: 13 }}>✓ Cash on Delivery</span>
          <span style={{ color: 'rgba(255,255,255,.6)', fontSize: 13 }}>✓ 3–5 Day Delivery</span>
          <span style={{ color: 'rgba(255,255,255,.6)', fontSize: 13 }}>✓ Quality Guaranteed</span>
        </div>
      </div>
    </section>
  );
}
