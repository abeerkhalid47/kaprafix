import Image from 'next/image';
import type { ShopifyProduct } from '@/lib/shopify';

export default function HomeHero({ product }: { product: ShopifyProduct }) {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero__grid">
          {/* Main Image Showcase */}
          <div className="gallery">
            <div className="gallery__main">
              <Image
                src={product.images[0]?.url ?? '/images/product-1.png'}
                alt={product.images[0]?.altText ?? product.title}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width:768px) 100vw, 50vw"
                priority
              />
            </div>
          </div>

          {/* Marketing Copy */}
          <div className="product-info" style={{ justifyContent: 'center' }}>
            <div>
              <span className="badge badge-sale">🔥 FLAT 50% OFF - TODAY ONLY</span>
            </div>

            <h1 className="product-info__title" style={{ fontSize: 'clamp(28px, 4.5vw, 44px)', lineHeight: 1.15 }}>
              Fix, Hem & Repair Clothes In Seconds — No Sewing Required
            </h1>

            <p className="product-info__desc">
              Easy Fit Tape is the ultimate iron-on fabric adhesive. Shorten trousers, mend torn seams, and adjust curtains quickly at home. Creates a strong, machine-washable, and completely invisible bond in minutes.
            </p>

            <ul className="benefits-list" style={{ margin: '12px 0 24px 0' }}>
              <li>
                <span className="check">✓</span>
                <span><strong>No Needle or Thread Needed</strong> – Perfect for quick alterations</span>
              </li>
              <li>
                <span className="check">✓</span>
                <span><strong>100% Invisible Finish</strong> – Blends neatly inside your clothing</span>
              </li>
              <li>
                <span className="check">✓</span>
                <span><strong>Wash-Resistant Hold</strong> – Stays strong through multiple machine washes</span>
              </li>
            </ul>

            <div>
              <a href="/product" className="btn btn-primary btn-lg btn-full text-center" style={{ display: 'flex' }}>
                Order Now — Shop 50% OFF
              </a>
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 16, fontSize: '13px', color: 'var(--text-muted)' }}>
                <span>🚚 Cash on Delivery</span>
                <span>⚡ 3–5 Day Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
