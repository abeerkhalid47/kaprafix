'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function VideoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!sectionRef.current || !maskRef.current || !textRef.current || !overlayRef.current) return;

    let mm = gsap.matchMedia();

    mm.add('(min-width: 1025px)', () => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=150%', // Pin for 1.5x the viewport height
        pin: true,
        animation: gsap.timeline()
          .to(textRef.current, { opacity: 0, y: -50, duration: 0.5 }, 0)
          .to(maskRef.current, {
            width: '100vw',
            height: '100vh',
            borderRadius: '0px',
            marginTop: '0vh',
            duration: 1,
            ease: 'power2.inOut'
          }, 0)
          .to(overlayRef.current, { display: 'none', duration: 0.1 }, 1),
        scrub: 1,
      });
    });

    mm.add('(max-width: 1024px)', () => {
      gsap.set(overlayRef.current, { display: 'none' });
    });

    return () => mm.revert();
  }, { scope: sectionRef });

  return (
    <section className="video-cinematic" ref={sectionRef} id="how-it-works">
      <div className="video-cinematic__text" ref={textRef}>
        <span className="video-cinematic__label">How It Works</span>
        <h2 className="video-cinematic__title">Perfect hems in 3 simple steps.</h2>
        <div className="video-cinematic__steps">
          <span>1. Place</span>
          <span className="dot">•</span>
          <span>2. Iron</span>
          <span className="dot">•</span>
          <span>3. Done</span>
        </div>
      </div>

      <div className="video-cinematic__mask" ref={maskRef}>
        <iframe
          src="https://www.youtube.com/embed/2Vv-BfVoq4g?rel=0&modestbranding=1"
          title="How to Use Hem Tape"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="video-cinematic__iframe"
        />
        <div className="video-cinematic__overlay" ref={overlayRef}></div>
      </div>

      {/* Blinking Order Now button below video */}
      <div className="video-order-now-wrapper">
        <a href="/product" className="video-order-now-btn">
          🛒 Order Now
        </a>
      </div>
    </section>
  );
}
