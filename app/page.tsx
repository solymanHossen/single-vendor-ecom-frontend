import { Header } from '@/components/header';
import { Footer } from '@/components/storefront/footer';
import { HeroSection } from '@/components/home/hero-section';
import { CategoryAndFeaturedSection } from '@/components/home/category-and-featured-section';

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans antialiased selection:bg-primary selection:text-primary-foreground">
      <Header />
      <main className="flex-1 flex flex-col">
        <HeroSection />
        <CategoryAndFeaturedSection />
      </main>
      <Footer />
    </div>
  );
}


