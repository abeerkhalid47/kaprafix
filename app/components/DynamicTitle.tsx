'use client';

import { useEffect } from 'react';

export default function DynamicTitle() {
  useEffect(() => {
    const titles = [
      'KapraFix | No Stitching Required',
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
