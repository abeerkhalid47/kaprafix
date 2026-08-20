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
  const textRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!sectionRef.current || !textRef.current || !maskRef.current) return;

    gsap.from(textRef.current.children, {
      y: 24,
      opacity: 0,
      duration: 0.7,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: textRef.current,
        start: 'top 85%',
        once: true,
      },
    });

    gsap.from(maskRef.current, {
      y: 32,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: maskRef.current,
        start: 'top 85%',
        once: true,
      },
    });
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
          src="https://www.youtube.com/embed/i0ZO2hfgU9A?rel=0&modestbranding=1&playsinline=1&enablejsapi=1"
          title="How to Use Hem Tape"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="video-cinematic__iframe"
        />
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
