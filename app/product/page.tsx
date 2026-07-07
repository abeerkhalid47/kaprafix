import { getProduct } from '@/lib/shopify';
import AnnouncementBar from '../components/AnnouncementBar';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import TrustBadges from '../components/TrustBadges';
import Benefits from '../components/Benefits';
import VideoSection from '../components/VideoSection';
import Reviews from '../components/Reviews';
import FAQ from '../components/FAQ';
import FinalCTA from '../components/FinalCTA';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import StickyAddToCart from '../components/StickyAddToCart';

export default async function ProductPage() {
  const product = await getProduct();

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main>
        <Hero product={product} />
        <TrustBadges />
        <Benefits />
        <VideoSection />
        <Reviews />
        <FAQ />
        <FinalCTA product={product} isProductPage={true} />
      </main>
      <Footer />
      <CartDrawer />
      <StickyAddToCart product={product} />
    </>
  );
}
