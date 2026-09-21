import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { GALLERY_ITEMS } from './data';

export function GallerySection({ onItemClick }: { onItemClick: (title: string) => void }) {
  return (
    <section id="gallery-section" className="py-16 bg-muted border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Thoughtful, Planet-Prioritizing Ideas
            </span>
            <h2 className="text-2xl sm:text-3xl font-normal text-foreground mt-1">
              and Inspiration <span className="font-serif italic font-bold">✧ Gallery</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2.5 rounded-full border border-border text-muted-foreground hover:bg-background transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-2.5 rounded-full border border-border text-muted-foreground hover:bg-background transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {GALLERY_ITEMS.map((item) => (
            <div
              key={item.title}
              className="group relative h-64 sm:h-72 rounded-2xl overflow-hidden shadow-sm bg-background cursor-pointer"
              onClick={() => onItemClick(item.title)}
            >
              <Image
                src={item.img}
                alt={item.title}
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Photo scrim exception — see hero-section.tsx */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                <span className="text-[10px] uppercase font-semibold text-accent tracking-wider">
                  {item.tag}
                </span>
                <p className="text-xs sm:text-sm font-medium mt-0.5">{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
