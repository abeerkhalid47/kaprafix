'use client';
import Image from 'next/image';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import type { ShopifyProduct } from '@/lib/shopify';
import { formatPrice, getDiscountPercent } from '@/lib/shopify';

const BENEFITS = [
  'No Sewing Required – Hem and repair clothes without a needle or thread',
  'Quick & Easy to Use – Professional-looking results in just minutes',
  'Strong & Durable Hold – Keeps hems securely in place for everyday wear',
  'Invisible Finish – Blends neatly inside the fabric for a clean appearance',
  'Works on Multiple Fabrics – Jeans, trousers, skirts, dresses, curtains & more',
  'Saves Time & Money – Avoid expensive tailoring for simple adjustments',
];

export default function Hero({ product }: { product: ShopifyProduct }) {
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const { addItem, isLoading } = useCart();

  const variant = product.variants[0];
  const salePrice = variant?.price;
  const origPrice = variant?.compareAtPrice;
  const discount = salePrice && origPrice ? getDiscountPercent(salePrice, origPrice) : null;

  async function handleAddToCart() {
    if (!variant) return;
    await addItem(variant.id, qty);
  }

  return (
    <section className="hero">
      <div className="container">
        <div className="hero__grid">
          {/* Gallery */}
          <div className="gallery">
            <div className="gallery__main">
              <Image
                src={product.images[activeImg]?.url ?? '/images/product-1.png'}
                alt={product.images[activeImg]?.altText ?? product.title}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width:768px) 100vw, 50vw"
                priority
              />
            </div>
            {product.images.length > 1 && (
              <div className="gallery__thumbs">
                {product.images.slice(0, 4).map((img, i) => (
                  <button
                    key={img.id}
                    className={`gallery__thumb${i === activeImg ? ' active' : ''}`}
                    onClick={() => setActiveImg(i)}
                    aria-label={`View image ${i + 1}`}
                  >
                    <Image
                      src={img.url}
                      alt={img.altText ?? `Product image ${i + 1}`}
                      width={120}
                      height={120}
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info">
            <h1 className="product-info__title">{product.title}</h1>

            <div className="product-info__price">
              {salePrice && <span className="price-sale">{formatPrice(salePrice)}</span>}
              {origPrice && <span className="price-orig">{formatPrice(origPrice)}</span>}
              {discount && <span className="badge badge-sale">{discount}% OFF</span>}
            </div>

            <div className="product-info__badges">
              <span className="badge badge-cod">✓ Cash on Delivery</span>
              <span className="badge badge-trust">🔒 Secure Checkout</span>
            </div>

            <p className="product-info__desc">{product.description}</p>

            <ul className="benefits-list">
              {BENEFITS.map((b, i) => (
                <li key={i}>
                  <span className="check">✓</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            {/* Qty + ATC */}
            <div className="atc-row">
              <div className="qty-selector" role="group" aria-label="Quantity">
                <button
                  id="qty-decrease"
                  className="qty-btn"
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >−</button>
                <span className="qty-value" aria-live="polite">{qty}</span>
                <button
                  id="qty-increase"
                  className="qty-btn"
                  onClick={() => setQty(q => q + 1)}
                  aria-label="Increase quantity"
                >+</button>
              </div>
              <button
                id="hero-atc-btn"
                className="btn btn-primary btn-lg atc-btn"
                onClick={handleAddToCart}
                disabled={isLoading || !variant?.availableForSale}
              >
                {isLoading ? 'Adding…' : variant?.availableForSale ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>

            {/* Trust row */}
            <div className="trust-row">
              <div className="trust-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12l5 5L20 7"/>
                </svg>
                Quality Guaranteed
              </div>
              <div className="trust-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="3" width="15" height="13" rx="1"/>
                  <path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="1.5"/><circle cx="18.5" cy="18.5" r="1.5"/>
                </svg>
                Free Delivery Over Rs. 1500
              </div>
              <div className="trust-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                03177299713
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
