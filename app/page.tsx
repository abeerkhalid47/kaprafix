import { getProduct } from '@/lib/shopify';
import AnnouncementBar from './components/AnnouncementBar';
import Navbar from './components/Navbar';
import HomeHero from './components/HomeHero';
import TrustBadges from './components/TrustBadges';
import Benefits from './components/Benefits';
import VideoSection from './components/VideoSection';
import Reviews from './components/Reviews';
import FAQ from './components/FAQ';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';

export default async function HomePage() {
  const product = await getProduct();

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main>
        <HomeHero product={product} />
        <TrustBadges />
        <Benefits />
        <VideoSection />
        <Reviews />
        <FAQ />
        <FinalCTA product={product} isProductPage={false} />
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
