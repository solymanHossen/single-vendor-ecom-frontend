import Image from 'next/image';
import { ArrowRight, Leaf, Sparkles } from 'lucide-react';

export function HeroSection({
  onShopClick,
  onExploreClick,
}: {
  onShopClick: () => void;
  onExploreClick: () => void;
}) {
  return (
    <section className="relative isolate overflow-hidden min-h-[580px] lg:min-h-[660px] flex items-center">
      <Image
        src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=2000&q=85"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover -z-10"
      />
      {/* Photo scrim + on-photo text below stay literal black/white rather
          than theme tokens — this is about legibility over a photograph,
          which needs to hold regardless of light/dark mode, not branding. */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/85 via-black/50 to-black/70" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6 pt-6 sm:pt-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs uppercase tracking-widest text-white">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Conscious Living · 2026 Collection</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight text-white leading-[1.1]">
              Eco-Friendly <br />
              <span className="font-serif italic font-semibold">Kitchenware</span> for <br />
              a greener home
            </h1>

            <p className="text-white/80 text-sm sm:text-base max-w-lg font-normal leading-relaxed">
              The eco-friendly kitchenware niche with a sense of urgency, crafted with non-toxic botanical
              minerals and reclaimed raw earth materials for everyday joy.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={onShopClick}
                className="inline-flex items-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground px-7 py-3 rounded-full font-medium text-sm sm:text-base transition-all transform hover:scale-105 active:scale-95 shadow-lg"
              >
                <span>Shop now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onExploreClick}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 text-white text-sm backdrop-blur-sm transition-all"
              >
                <span>Explore Bestsellers</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-end">
            <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-3xl p-7 text-white shadow-2xl max-w-xs w-full">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider font-semibold text-accent">Natural.</p>
                  <p className="text-xs uppercase tracking-wider font-semibold text-accent">Sustainable.</p>
                  <p className="text-xs uppercase tracking-wider font-semibold text-accent">Eco-conscious.</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-accent" />
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/15">
                <div className="font-serif text-6xl sm:text-7xl font-semibold italic text-white tracking-tight">
                  96%
                </div>
                <p className="text-xs text-white/80 mt-1">
                  Biodegradable or endlessly recyclable materials used across all products.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
