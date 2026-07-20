'use client';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/shopify';

export default function CartDrawer() {
  const { cart, isOpen, isLoading, closeCart, updateItem, removeItem, checkout } = useCart();

  return (
    <>
      <div
        className={`cart-overlay${isOpen ? ' open' : ''}`}
        onClick={closeCart}
        aria-hidden="true"
        style={{ backdropFilter: isOpen ? 'blur(8px)' : 'none', WebkitBackdropFilter: isOpen ? 'blur(8px)' : 'none' }}
      />
      <div
        id="cart-drawer"
        className={`cart-drawer-luxury${isOpen ? ' open' : ''}`}
        role="dialog"
        aria-label="Shopping bag"
        aria-modal="true"
      >
        <div className="cart-drawer-luxury__header">
          <span className="cart-drawer-luxury__title">Shopping Bag</span>
          <button
            id="cart-drawer-close"
            className="cart-drawer-luxury__close"
            onClick={closeCart}
            aria-label="Close cart"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="cart-drawer-luxury__body">
          {!cart || cart.lines.length === 0 ? (
            <div className="cart-drawer-luxury__empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3, marginBottom: 16 }}><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              <p style={{ fontWeight: 500, color: 'var(--text)', fontSize: 16 }}>Your bag is empty</p>
              <p style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 4 }}>Add Kaprafix tape to get started</p>
            </div>
          ) : (
            cart.lines.map((line) => (
              <div key={line.id} className="cart-luxury-line">
                {line.merchandise.product.imageUrl ? (
                  <div className="cart-luxury-line__img-wrap">
                    <Image
                      src={line.merchandise.product.imageUrl}
                      alt={line.merchandise.product.imageAlt ?? line.merchandise.product.title}
                      width={80}
                      height={100}
                      className="cart-luxury-line__img"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ) : (
                  <div className="cart-luxury-line__img" style={{ background: 'var(--bg-section)' }} />
                )}
                <div className="cart-luxury-line__info">
                  <div className="cart-luxury-line__header">
                    <div className="cart-luxury-line__name">
                      {line.merchandise.product.title}
                      {line.merchandise.title && line.merchandise.title !== 'Default Title' && (
                        <span style={{ fontSize: '12px', color: 'var(--text-light)', display: 'block', fontWeight: 400, marginTop: '2px' }}>
                          Selected Pack: {line.merchandise.title}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(line.id)}
                      className="cart-luxury-line__remove"
                      disabled={isLoading}
                      aria-label="Remove item"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                  <div className="cart-luxury-line__price">{formatPrice(line.merchandise.price)}</div>
                  <div className="cart-luxury-line__actions">
                    <div className="cart-luxury-qty">
                      <button
                        className="cart-luxury-qty-btn"
                        onClick={() => updateItem(line.id, line.quantity - 1)}
                        aria-label="Decrease quantity"
                        disabled={isLoading}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      </button>
                      <span className="cart-luxury-qty-val">{line.quantity}</span>
                      <button
                        className="cart-luxury-qty-btn"
                        onClick={() => updateItem(line.id, line.quantity + 1)}
                        aria-label="Increase quantity"
                        disabled={isLoading}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart && cart.lines.length > 0 && (
          <div className="cart-drawer-luxury__footer">
            <div className="cart-drawer-luxury__cod">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }}><rect width="16" height="12" x="2" y="6" rx="2"/><path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M12 12h.01"/></svg>
              <span>Cash on Delivery Pakistan</span>
            </div>
            <div className="cart-drawer-luxury__total">
              <span>Subtotal</span>
              <span>{formatPrice(cart.totalAmount)}</span>
            </div>
            <button
              id="checkout-btn"
              className="btn-luxury btn-luxury-primary btn-full-width"
              onClick={checkout}
              disabled={isLoading}
              style={{ height: '52px' }}
            >
              <span>{isLoading ? 'Processing...' : 'Proceed to Checkout'}</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
