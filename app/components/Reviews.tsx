'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const REVIEWS_NARRATIVE = [
  {
    name: 'Ali',
    location: 'Lahore',
    text: 'Quality expectation se bhi achi hai! Bilkul waisi kaam ki jaise claim kiya tha. Repeat order karunga zaroor.',
    initials: 'A',
    img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1200&auto=format&fit=crop',
    label: 'Perfect Trousers Hem'
  },
  {
    name: 'Usman',
    location: 'Karachi',
    text: 'Bahut acha product hai. Meri pants ka hem bilkul perfect ho gaya. Kisi ko bhi nahi pata ke tape use ki hai. Sab ko recommend karunga.',
    initials: 'U',
    img: '/images/tape_bg_2.png',
    label: 'Invisible Alteration'
  },
  {
    name: 'Ayesha',
    location: 'Islamabad',
    text: 'Fast delivery aur packaging bhi solid thi. Product ne bilkul kaam kiya. Meri bachi ke school uniform ka hem perfect ho gaya 5 minutes mein.',
    initials: 'Ay',
    img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
    label: 'Quick Clothing Fix'
  },
  {
    name: 'Sana',
    location: 'Multan',
    text: 'Pehle trust nahi tha online products pe, but is ne sach mein kaam kiya! Mere curtains ka hem bhi isi se kiya. Zabardast!',
    initials: 'S',
    img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop',
    label: 'Perfect Curtains Hem'
  }
];

export default function Reviews() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current || !leftRef.current || !rightRef.current) return;

    let mm = gsap.matchMedia();

    mm.add('(min-width: 1025px)', () => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        pin: leftRef.current,
        id: 'reviews-pin'
      });

      const rightItems = gsap.utils.toArray('.review-image-wrapper') as HTMLElement[];
      const leftTextItems = gsap.utils.toArray('.review-text-item') as HTMLElement[];

      const setActiveText = (index: number) => {
        leftTextItems.forEach((textItem, i) => {
          if (i === index) {
            gsap.to(textItem, { autoAlpha: 1, duration: 0.4, y: 0, overwrite: true });
          } else {
            gsap.to(textItem, { autoAlpha: 0, duration: 0.4, y: 10, overwrite: true });
          }
        });
      };

      rightItems.forEach((item, index) => {
        ScrollTrigger.create({
          trigger: item,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => setActiveText(index),
          onEnterBack: () => setActiveText(index),
        });
      });
    });

    return () => mm.revert();
  }, { scope: containerRef });

  return (
    <section className="narrative-section reviews-narrative-section" ref={containerRef} id="reviews">
      <div className="narrative-container">
        {/* Left Side: Pinned Testimonials (Desktop) / Stacked (Mobile) */}
        <div className="narrative-left" ref={leftRef}>
          <div className="narrative-left-content">
            <span className="narrative-label">Testimonials</span>
            <div className="narrative-text-stack">
              {REVIEWS_NARRATIVE.map((r, idx) => (
                <div
                  key={idx}
                  className="narrative-text-item review-text-item"
                  style={{
                    opacity: idx === 0 ? 1 : 0,
                    visibility: idx === 0 ? 'visible' : 'hidden',
                    transform: idx === 0 ? 'translateY(0)' : 'translateY(10px)'
                  }}
                >
                  <div className="stars" style={{ marginBottom: 16 }}>★★★★★</div>
                  <h2 className="narrative-title" style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontStyle: 'italic', fontWeight: 400 }}>
                    "{r.text}"
                  </h2>
                  <div className="review-marquee-card__author" style={{ marginTop: 32 }}>
                    <div className="review-marquee-card__avatar">{r.initials}</div>
                    <div>
                      <div className="review-marquee-card__name" style={{ color: 'var(--text)' }}>{r.name}</div>
                      <div className="review-marquee-card__location">{r.location}</div>
                    </div>
                  </div>

                  {/* Inline Image for Mobile Only */}
                  <div className="narrative-mobile-img">
                    <Image
                      src={r.img}
                      alt={r.label}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    <div className="narrative-image-label">{r.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Scrolling Images (Desktop Only) */}
        <div className="narrative-right" ref={rightRef}>
          <div className="narrative-right-content">
            {REVIEWS_NARRATIVE.map((r, idx) => (
              <div key={idx} className="narrative-image-wrapper review-image-wrapper">
                <div className="narrative-image-inner">
                  <Image
                    src={r.img}
                    alt={r.label}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="narrative-image-label">{r.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
