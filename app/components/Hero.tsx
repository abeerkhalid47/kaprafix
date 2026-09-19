'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { type ShopifyProduct, formatPrice, getDiscountPercent } from '@/lib/shopify';

import { Minus, Plus, ShoppingBag, ChevronDown } from 'lucide-react';

const ACCORDIONS = [
  {
    title: 'How to Use',
    content: 'Simply cut the tape to the required length, place it inside the fabric fold, and press with a warm iron for 10-15 seconds. No sewing or experience needed.'
  },
  {
    title: 'Shipping Policy',
    content: 'Cash on delivery is available all across Pakistan in 2-3 working days. Once your order is confirmed, we’ll process and dispatch it promptly. You’ll receive your order through our trusted delivery partners'
  },
  {
    title: 'Easy Returns & Refunds',
    content: "Not satisfied with your order? No worries! you can get your money back . You can contact us for a return request and our team will guide you through the process. 📱 For returns & refunds: Chat with us on 0317-7299713."
  }
];

export default function Hero({ product }: { product: ShopifyProduct }) {
  const [qty, setQty] = useState(1);
  const [openDrawer, setOpenDrawer] = useState<number | null>(null);
  const { addItem, isLoading } = useCart();

  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants[0]?.id || 'mock-variant-pack-1'
  );

  const variant = product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];

  const [mainImageIndex, setMainImageIndex] = useState(0);

  async function handleAddToCart() {
    if (!variant) return;
    await addItem(variant.id, qty);
  }

  const handleDecrease = () => setQty((prev) => Math.max(1, prev - 1));
  const handleIncrease = () => setQty((prev) => prev + 1);

  const mainImage = product.images[mainImageIndex] || product.images[0];

  return (
    <section className="product-catalog-section">
      <div className="container">
        <div className="product-catalog-grid">
          {/* Left Column: Interactive Image Gallery */}
          <div className="product-catalog-gallery-interactive">
            <div className="product-gallery-main">
              <AnimatePresence mode="wait">
                <motion.div
                  key={mainImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ position: 'absolute', inset: 0 }}
                >
                  <Image
                    src={mainImage?.url || ''}
                    alt={mainImage?.altText ?? `${product.title} - main view`}
                    fill
                    style={{ objectFit: 'cover', borderRadius: '16px' }}
                    sizes="(max-width: 992px) 100vw, 55vw"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            </div>
            
            {/* Thumbnails Row */}
            {product.images.length > 1 && (
              <div className="product-gallery-thumbnails">
                {product.images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    type="button"
                    className={`product-gallery-thumb ${idx === mainImageIndex ? 'active' : ''}`}
                    onClick={() => setMainImageIndex(idx)}
                    aria-label={`View product image ${idx + 1}`}
                  >
                    <Image
                      src={img.url}
                      alt={img.altText ?? `Thumbnail ${idx + 1}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="100px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Pinned Product Panel */}
          <div className="product-catalog-panel">
            <div className="product-catalog-panel-inner">
              <span className="product-label-badge">In Stock</span>
              <h1 className="product-catalog-title">{product.title}</h1>

              {/* Price Details */}
              <div className="product-catalog-price-row">
                <div className="product-catalog-prices">
                  <span className="price-tag-large">{variant ? formatPrice(variant.price) : 'Rs. 999'}</span>
                  {variant?.compareAtPrice && (
                    <span className="price-tag-orig-large">{formatPrice(variant.compareAtPrice)}</span>
                  )}
                </div>
                {variant && getDiscountPercent(variant.price, variant.compareAtPrice) && (
                  <span className="discount-tag">
                    Save {getDiscountPercent(variant.price, variant.compareAtPrice)}%
                  </span>
                )}
              </div>

              <p className="product-catalog-desc">{product.description}</p>

              {/* Bundle Selector */}
              <div className="bundle-selector">
                <span className="bundle-selector-label">
                  Select Package & Save
                </span>
                {product.variants.map((v, idx) => {
                  const isSelected = v.id === selectedVariantId;
                  const discount = getDiscountPercent(v.price, v.compareAtPrice);
                  
                  let badge = null;
                  if (idx === 1) {
                    badge = 'Most Popular';
                  } else if (idx === 2) {
                    badge = 'Best Value';
                  }

                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`bundle-option-card ${isSelected ? 'selected' : ''}`}
                    >
                      {badge && (
                        <span className={`bundle-badge ${idx === 1 ? 'bundle-badge-popular' : 'bundle-badge-value'}`}>
                          {badge}
                        </span>
                      )}
                      
                      <div className="bundle-option-left">
                        <div className="bundle-radio-circle" />
                        <div className="bundle-option-info">
                          <div className="bundle-option-title">
                            {v.title}
                          </div>
                          {discount && (
                            <div className="bundle-option-discount">
                              Save {discount}%
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bundle-option-right">
                        <div className="bundle-option-price">
                          {formatPrice(v.price)}
                        </div>
                        {v.compareAtPrice && (
                          <div className="bundle-option-compare-price">
                            {formatPrice(v.compareAtPrice)}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Action Box */}
              <div className="product-checkout-panel">
                {/* Quantity Controls */}
                <div className="product-qty-row">
                  <span className="qty-row-label">Quantity</span>
                  <div className="qty-row-controls">
                    <button 
                      type="button"
                      onClick={handleDecrease}
                      className="qty-row-btn"
                      disabled={qty <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="qty-row-val">{qty}</span>
                    <button 
                      type="button"
                      onClick={handleIncrease}
                      className="qty-row-btn"
                      aria-label="Increase quantity"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* ATC Button */}
                <button
                  id="hero-atc-btn"
                  type="button"
                  className="btn-luxury btn-luxury-primary btn-full-width"
                  onClick={handleAddToCart}
                  disabled={isLoading || !variant?.availableForSale}
                >
                  <ShoppingBag size={18} style={{ marginRight: 8, flexShrink: 0 }} />
                  <span>{isLoading ? 'Adding to Bag...' : variant?.availableForSale ? 'Add to Cart' : 'Out of Stock'}</span>
                </button>
              </div>

              {/* Technical Accordion Drawers */}
              <div className="product-specs-accordions">
                {ACCORDIONS.map((acc, i) => {
                  const isOpen = openDrawer === i;
                  return (
                    <div key={i} className="spec-accordion-item">
                      <button
                        className="spec-accordion-header"
                        onClick={() => setOpenDrawer(isOpen ? null : i)}
                        aria-expanded={isOpen}
                      >
                        <span>{acc.title}</span>
                        <motion.span
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.25, ease: 'easeOut' }}
                        >
                          <ChevronDown size={16} />
                        </motion.span>
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div className="spec-accordion-content">
                              {acc.content}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
