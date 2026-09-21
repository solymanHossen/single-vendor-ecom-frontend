import { Header } from '@/components/header';
import { Footer } from '@/components/storefront/footer';

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans antialiased selection:bg-primary selection:text-primary-foreground">
      <Header />
      <main className="min-h-screen flex-1 flex flex-col" />
      <Footer />
    </div>
  );
}

