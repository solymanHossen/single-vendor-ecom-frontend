import Image from 'next/image';
import { EXPLORE_BUBBLES } from './data';

export function CategoriesSection({ onSelect }: { onSelect: () => void }) {
  return (
    <section className="py-10 bg-muted border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-normal text-foreground">
            Curated Categories <span className="font-serif italic">by Sustainable Craft</span>
          </h3>
          <span className="text-xs text-muted-foreground hidden sm:inline">Handcrafted & plastic-free</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {EXPLORE_BUBBLES.map((bubble) => (
            <div
              key={bubble.title}
              onClick={onSelect}
              className="group relative h-48 sm:h-60 rounded-3xl overflow-hidden shadow-sm cursor-pointer"
            >
              <Image
                src={bubble.img}
                alt={bubble.title}
                fill
                sizes="(min-width: 640px) 25vw, 50vw"
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              {/* Photo scrim exception — see hero-section.tsx */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex flex-col justify-end p-4 text-white">
                <p className="text-sm font-semibold tracking-wide">{bubble.title}</p>
                <div className="mt-2 inline-flex items-center gap-1 text-[11px] bg-accent text-accent-foreground px-3 py-1 rounded-full font-medium w-fit">
                  {bubble.tag}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
