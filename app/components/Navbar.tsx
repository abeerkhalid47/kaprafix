'use client';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const { itemCount, openCart } = useCart();

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar__inner">
          <a href="/" className="navbar__logo" aria-label="Easy Fit Tape Home">
            <Image src="/images/logo.png" alt="Easy Fit Tape" width={140} height={36} priority />
          </a>
          <div className="navbar__actions">
            <button
              id="navbar-cart-btn"
              className="navbar__cart-btn"
              onClick={openCart}
              aria-label="Open cart"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              Cart
              {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
