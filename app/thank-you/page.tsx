import { Metadata } from 'next';
import { Suspense } from 'react';
import ThankYouClient from './ThankYouClient';

export const metadata: Metadata = {
  title: 'Order Confirmed! | Kaprafix — Cash on Delivery Pakistan',
  description: 'Thank you for your order. Your Kaprafix hem tape package is being prepared for dispatch.',
};

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>Loading order confirmation...</p>
        </div>
      }
    >
      <ThankYouClient />
    </Suspense>
  );
}
