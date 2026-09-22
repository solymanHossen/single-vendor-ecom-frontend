import { Header } from '@/components/header';
import { Footer } from '@/components/storefront/footer';
import { HeroSection } from '@/components/home/hero-section';
import { CategoryAndFeaturedSection } from '@/components/home/category-and-featured-section';
import { getHeroBanners, type HeroBanner } from '@/lib/backend-hero';

function toBannerSlide(banner: HeroBanner) {
  return { id: String(banner.id), title: banner.title, image: banner.imageUrl, href: banner.href };
}

export default async function Page() {
  const [mainBanners, sideBanners] = await Promise.all([
    getHeroBanners('MAIN'),
    getHeroBanners('SIDE'),
  ]);
  const mainSlides = mainBanners.map(toBannerSlide);
  const sideCards = sideBanners.map(toBannerSlide);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans antialiased selection:bg-primary selection:text-primary-foreground">
      <Header />
      <main className="flex-1 flex flex-col">
        <HeroSection mainSlides={mainSlides} sideCards={sideCards} />
        <CategoryAndFeaturedSection />
      </main>
      <Footer />
    </div>
  );
}


