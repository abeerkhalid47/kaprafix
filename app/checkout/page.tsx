import { Metadata } from 'next';
import { getProduct } from '@/lib/shopify';
import CheckoutClient from './CheckoutClient';

export const metadata: Metadata = {
  title: 'Secure Checkout | Kaprafix — Cash on Delivery Pakistan',
  description: 'Fast & Secure Cash on Delivery checkout for Kaprafix hem tape. Delivered in 2-3 business days across Pakistan.',
};

export default async function CheckoutPage() {
  const product = await getProduct();

  return <CheckoutClient product={product} />;
}
