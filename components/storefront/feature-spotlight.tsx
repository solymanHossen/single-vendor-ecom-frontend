import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FeatureSpotlight({
  eyebrow,
  heading,
  headingEmphasis,
  description,
  imageSrc,
  imageAlt,
  imageCaption,
  imageBadge,
  onShopClick,
  reverse,
}: {
  eyebrow: string;
  heading: string;
  headingEmphasis: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  imageCaption?: string;
  imageBadge?: string;
  onShopClick: () => void;
  reverse?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-muted rounded-3xl p-6 sm:p-12 border border-border">
      <div className={cn('lg:col-span-6 space-y-5', reverse && 'lg:order-2')}>
        <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
          {eyebrow}
        </div>
        <h3 className="text-3xl sm:text-5xl font-normal text-foreground leading-tight">
          {heading} <span className="font-serif italic font-bold">{headingEmphasis}</span>
        </h3>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-md">{description}</p>
        <div className="pt-2">
          <button
            onClick={onShopClick}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-full text-xs font-semibold tracking-wide transition-all shadow-md"
          >
            <span>Shop now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className={cn('lg:col-span-6 flex items-center justify-center', reverse && 'lg:order-1')}>
        <div className="relative w-full max-w-md h-72 sm:h-96 rounded-2xl overflow-hidden shadow-2xl">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover hover:scale-105 transition-transform duration-500"
          />
          {imageCaption && (
            <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-medium text-foreground shadow">
              {imageCaption}
            </div>
          )}
          {imageBadge && (
            <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3.5 py-1.5 rounded-full text-xs font-semibold">
              {imageBadge}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
