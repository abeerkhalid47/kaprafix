'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const NARRATIVE_STEPS = [
  {
    title: 'No sewing required.',
    desc: 'Hem and repair clothes without any needle, thread, or sewing machine. Perfect for anyone who wants professional results instantly.',
    img: '/images/tape_bg_2.png',
  },
  {
    title: 'An invisible finish.',
    desc: 'The adhesive melts and blends seamlessly inside the fabric, leaving a clean, flawless appearance that looks tailored.',
    img: '/images/tape_bg_1.png',
  },
  {
    title: 'Wash-resistant hold.',
    desc: 'Engineered to withstand the toughest washing machines. The powerful bond holds securely through everyday wear and regular cleaning.',
    img: '/images/tape_bg_3.png',
  },
];

export default function Benefits() {
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
        id: 'benefits-pin'
      });

      const rightItems = gsap.utils.toArray('.narrative-image-wrapper') as HTMLElement[];
      const leftTextItems = gsap.utils.toArray('.narrative-text-item') as HTMLElement[];

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
    <section className="narrative-section" ref={containerRef} id="benefits">
      <div className="narrative-container">
        {/* Left Side: Pinned Text (Desktop) / Stacked Cards (Mobile) */}
        <div className="narrative-left" ref={leftRef}>
          <div className="narrative-left-content">
            <span className="narrative-label">The Engineering</span>
            <div className="narrative-text-stack">
              {NARRATIVE_STEPS.map((step, idx) => (
                <div 
                  key={idx} 
                  className="narrative-text-item" 
                  style={{ 
                    // These inline styles are overridden by !important in mobile CSS
                    opacity: idx === 0 ? 1 : 0, 
                    visibility: idx === 0 ? 'visible' : 'hidden',
                    transform: idx === 0 ? 'translateY(0)' : 'translateY(10px)' 
                  }}
                >
                  <h2 className="narrative-title">{step.title}</h2>
                  <p className="narrative-desc">{step.desc}</p>
                  
                  {/* Inline Image for Mobile Only */}
                  <div className="narrative-mobile-img">
                    <Image
                      src={step.img}
                      alt={step.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Scrolling Images (Desktop Only) */}
        <div className="narrative-right" ref={rightRef}>
          <div className="narrative-right-content">
            {NARRATIVE_STEPS.map((step, idx) => (
              <div key={idx} className="narrative-image-wrapper">
                <div className="narrative-image-inner">
                  <Image
                    src={step.img}
                    alt={step.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
