'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { ShopifyProduct } from '@/lib/shopify';
import { motion, AnimatePresence, Variants } from 'framer-motion';

const TAPE_IMAGES = [
  '/KapraFix/hero-1.jpg',
  '/KapraFix/hero-2.jpg',
  '/KapraFix/hero-3.jpg',
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { y: 40, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  }
};

const slideVariants = {
  enter: {
    x: '-100%',
    opacity: 0,
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: {
    zIndex: 0,
    x: '100%',
    opacity: 0,
  }
};

export default function HomeHero({ product }: { product: ShopifyProduct }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TAPE_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="hero-luxury">
      {/* Background Slider */}
      <div className="hero-luxury__bg-slider">
        <AnimatePresence initial={false}>
          <motion.div
            key={currentIndex}
            className="hero-luxury__bg-slide"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
              opacity: { duration: 1.2 }
            }}
          >
            <Image
              src={TAPE_IMAGES[currentIndex]}
              alt="Kaprafix Background"
              fill
              style={{ objectFit: 'cover' }}
              sizes="100vw"
              priority={currentIndex === 0}
            />
          </motion.div>
        </AnimatePresence>
        <div className="hero-luxury__overlay" />
      </div>

      <div className="container" style={{ maxWidth: '900px', position: 'relative', zIndex: 10 }}>
        <motion.div
          className="hero-luxury__content"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Subtle Label */}
          <div style={{ overflow: 'hidden' }}>
            <motion.div variants={itemVariants} className="hero-luxury__label">
              The Ultimate Fabric Adhesive
            </motion.div>
          </div>

          {/* Massive Headline */}
          <div style={{ overflow: 'hidden', paddingBottom: '8px' }}>
            <motion.h1 variants={itemVariants} className="hero-luxury__title hero-luxury__title--light">
              Fix, Hem & Repair Clothes In Seconds.
            </motion.h1>
          </div>

          {/* Refined Description */}
          {/* <div style={{ overflow: 'hidden' }}>
            <motion.p variants={itemVariants} className="hero-luxury__desc hero-luxury__desc--light">
              No sewing required. Create a strong, invisible, and machine-washable bond at home.
              The professional alternative to needle and thread.
            </motion.p>
          </div> */}

          {/* Action Area */}
          <motion.div variants={itemVariants} className="hero-luxury__actions">
            <a href="/product" className="btn-luxury btn-luxury-light">
              Order Now — Shop 50% Off
            </a>
            <div className="hero-luxury__trust hero-luxury__trust--light">
              <span>🚚 Cash on Delivery</span>
              <span className="dot">•</span>
              <span>⚡ 3–5 Day Delivery</span>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
