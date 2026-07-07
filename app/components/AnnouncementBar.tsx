"use client";

import { useState, useEffect } from 'react';

const announcements = [
  "🚚 Cash on Delivery Available All Over Pakistan",
  "⚡ Fast 3–5 Day Delivery",
  "🔥 50% OFF - Limited Time Sale!"
];

export default function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 4000); // Rotates every 4 seconds (3-5 sec)

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="announcement-bar" style={{ overflow: 'hidden', padding: 0, height: '40px' }}>
      <div
        style={{
          display: 'flex',
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: 'transform 600ms cubic-bezier(0.4, 0, 0.2, 1)',
          height: '100%',
          width: '100%',
        }}
      >
        {announcements.map((announcement, index) => (
          <div
            key={index}
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {announcement}
          </div>
        ))}
      </div>
    </div>
  );
}
