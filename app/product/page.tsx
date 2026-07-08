import { getProduct } from '@/lib/shopify';
import AnnouncementBar from '../components/AnnouncementBar';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ProductDetailSections from '../components/ProductDetailSections';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';

export default async function ProductPage() {
  const product = await getProduct();

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main>
        <Hero product={product} />
        <ProductDetailSections />
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
