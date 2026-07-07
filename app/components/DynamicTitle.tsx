'use client';

import { useEffect } from 'react';

export default function DynamicTitle() {
  useEffect(() => {
    const titles = [
      'Easy Fit Tape — No-Stitch Hem Tape | Cash on Delivery Pakistan',
      'I love you',
    ];
    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % titles.length;
      document.title = titles[currentIndex];
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
