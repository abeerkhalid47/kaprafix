import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import DynamicTitle from './components/DynamicTitle';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: 'Easy Fit Tape — No-Stitch Hem Tape | Cash on Delivery Pakistan',
  description:
    'Easy Fit Tape is a premium iron-on fabric adhesive to shorten, repair, and adjust clothing without sewing. Strong, durable, invisible finish. COD available all over Pakistan.',
  keywords: 'hem tape pakistan, iron on tape, no stitch hem tape, fabric adhesive, clothing repair, COD pakistan',
  openGraph: {
    title: 'Easy Fit Tape — No-Stitch Hem Tape',
    description: 'Fix, hem and repair clothes in minutes — no sewing required. COD available.',
    images: ['/images/product-1.png'],
    locale: 'en_PK',
    type: 'website',
  },
};

import WhatsAppSticky from './components/WhatsAppSticky';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body suppressHydrationWarning>
        <CartProvider>
          <DynamicTitle />
          {children}
          <WhatsAppSticky />
        </CartProvider>
      </body>
    </html>
  );
}
