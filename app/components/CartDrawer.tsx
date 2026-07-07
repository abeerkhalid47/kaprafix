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
      />
      <div
        id="cart-drawer"
        className={`cart-drawer${isOpen ? ' open' : ''}`}
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
      >
        <div className="cart-drawer__header">
          <span className="cart-drawer__title">Your Cart</span>
          <button
            id="cart-drawer-close"
            className="cart-drawer__close"
            onClick={closeCart}
            aria-label="Close cart"
          >✕</button>
        </div>

        <div className="cart-drawer__body">
          {!cart || cart.lines.length === 0 ? (
            <div className="cart-drawer__empty">
              <div className="cart-drawer__empty-icon">🛍️</div>
              <p style={{ fontWeight: 600 }}>Your cart is empty</p>
              <p style={{ fontSize: 14 }}>Add Easy Fit Tape to get started!</p>
            </div>
          ) : (
            cart.lines.map((line) => (
              <div key={line.id} className="cart-line">
                {line.merchandise.product.imageUrl ? (
                  <Image
                    src={line.merchandise.product.imageUrl}
                    alt={line.merchandise.product.imageAlt ?? line.merchandise.product.title}
                    width={72}
                    height={72}
                    className="cart-line__img"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div className="cart-line__img" style={{ background: 'var(--bg-section)' }} />
                )}
                <div className="cart-line__info">
                  <div className="cart-line__name">{line.merchandise.product.title}</div>
                  <div className="cart-line__price">{formatPrice(line.merchandise.price)}</div>
                  <div className="cart-line__qty">
                    <button
                      className="cart-line__qty-btn"
                      onClick={() => updateItem(line.id, line.quantity - 1)}
                      aria-label="Decrease quantity"
                      disabled={isLoading}
                    >−</button>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{line.quantity}</span>
                    <button
                      className="cart-line__qty-btn"
                      onClick={() => updateItem(line.id, line.quantity + 1)}
                      aria-label="Increase quantity"
                      disabled={isLoading}
                    >+</button>
                    <button
                      onClick={() => removeItem(line.id)}
                      style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-light)', cursor: 'pointer', background: 'none', border: 'none' }}
                      disabled={isLoading}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart && cart.lines.length > 0 && (
          <div className="cart-drawer__footer">
            <div className="cart-drawer__cod">
              <span>💵</span>
              <span>Cash on Delivery Available</span>
            </div>
            <div className="cart-drawer__total">
              <span>Total</span>
              <span>{formatPrice(cart.totalAmount)}</span>
            </div>
            <button
              id="checkout-btn"
              className="btn btn-primary btn-lg btn-full"
              onClick={checkout}
              disabled={isLoading}
            >
              Proceed to Checkout →
            </button>
          </div>
        )}
      </div>
    </>
  );
}
