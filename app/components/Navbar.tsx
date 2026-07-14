'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

export default function Navbar() {
  const { itemCount, openCart } = useCart();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <motion.nav
      variants={{
        visible: { y: 0, opacity: 1 },
        hidden: { y: "-100%", opacity: 0 }
      }}
      initial="visible"
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="navbar"
    >
      <div className="container">
        <div className="navbar__inner">
          {/* Left: Logo */}
          <a href="/" className="navbar__logo" aria-label="KAPRAFIX Home" style={{ display: 'flex', alignItems: 'center', height: '30px' }}>
            <Image 
              src="/images/kaprafix.png" 
              alt="KAPRAFIX Logo" 
              width={300} 
              height={300} 
              className="navbar__logo-img"
              priority
            />
          </a>

          {/* Center: Brand Text */}
          <a href="/" className="navbar__logo-text navbar__center-text" aria-label="KAPRAFIX Home">
            K A P R A F I X
          </a>
          <div className="navbar__actions">
            <button
              id="navbar-cart-btn"
              className="navbar__cart-btn-luxury"
              onClick={openCart}
              aria-label="Open cart"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              <span className="navbar__cart-text">Bag</span>
              <span className="cart-count-luxury">({itemCount})</span>
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
