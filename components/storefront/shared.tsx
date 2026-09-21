'use client';

import Image from 'next/image';
import { Eye, Heart, Minus, Plus, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { Color, Product } from './data';

// Filled-star gold is a near-universal rating convention (Amazon, Google,
// app stores, ...) independent of brand color — kept literal on purpose,
// same category as the product swatch colors in data.ts.
export function StarRating({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn('flex items-center gap-0.5 text-amber-500', className)}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={cn('w-3.5 h-3.5', i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-muted')}
        />
      ))}
    </div>
  );
}

export function ColorSwatches({
  colors,
  activeColor,
  onChange,
}: {
  colors: Color[];
  activeColor: Color;
  onChange: (color: Color) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {colors.map((c) => (
        <button
          key={c.name}
          type="button"
          onClick={() => onChange(c)}
          className={cn(
            'w-4 h-4 rounded-full transition-transform',
            c.bgClass,
            activeColor.name === c.name
              ? 'ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110'
              : 'opacity-80 hover:opacity-100',
          )}
          title={c.name}
        />
      ))}
    </div>
  );
}

export function QuantityStepper({
  quantity,
  onDecrease,
  onIncrease,
}: {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <div className="inline-flex items-center gap-3 bg-background rounded-full border border-border px-1 py-1">
      <button
        type="button"
        onClick={onDecrease}
        className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-muted text-foreground transition-colors"
      >
        <Minus className="w-3 h-3" />
      </button>
      <span className="text-sm font-medium text-foreground w-4 text-center">{quantity}</span>
      <button
        type="button"
        onClick={onIncrease}
        className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-muted text-foreground transition-colors"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
}

export function ProductCard({
  product,
  activeColor,
  isWishlisted,
  compact,
  onSelectColor,
  onOpen,
  onToggleWishlist,
  onAddToCart,
}: {
  product: Product;
  activeColor: Color;
  isWishlisted: boolean;
  compact?: boolean;
  onSelectColor: (color: Color) => void;
  onOpen: () => void;
  onToggleWishlist: () => void;
  onAddToCart: () => void;
}) {
  return (
    <div
      className={cn(
        'group bg-muted rounded-3xl flex flex-col justify-between transition-all duration-300 hover:shadow-xl border border-border',
        compact ? 'p-5 hover:-translate-y-1' : 'p-6',
      )}
    >
      <div>
        <div className="flex items-center justify-between mb-3 z-10">
          <Badge variant="secondary" className="font-serif italic">
            {product.badge}
          </Badge>
          <button
            type="button"
            onClick={onToggleWishlist}
            className="p-1.5 rounded-full hover:bg-background/60 text-foreground transition-colors"
          >
            <Heart className={cn('w-4 h-4', isWishlisted && 'text-destructive fill-destructive')} />
          </button>
        </div>

        <div
          onClick={onOpen}
          className={cn(
            'relative w-full rounded-2xl overflow-hidden cursor-pointer flex items-center justify-center mb-4 bg-background/60',
            compact ? 'h-60 p-2' : 'h-64 p-3',
          )}
        >
          <Image
            src={activeColor.img || product.mainImage}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
          />
          {compact && (
            <div className="absolute inset-0 bg-foreground/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="bg-background/90 text-foreground px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-md flex items-center gap-1.5 backdrop-blur-sm">
                <Eye className="w-3.5 h-3.5" /> Quick View
              </span>
            </div>
          )}
        </div>

        <div className="mb-3">
          <ColorSwatches colors={product.colors} activeColor={activeColor} onChange={onSelectColor} />
        </div>

        {compact ? (
          <h3
            onClick={onOpen}
            className="font-medium text-sm text-foreground leading-snug hover:underline cursor-pointer line-clamp-2 mb-4"
          >
            {product.subtitle}
          </h3>
        ) : (
          <>
            <h3
              onClick={onOpen}
              className="text-base font-medium text-foreground hover:underline cursor-pointer"
            >
              {product.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
          </>
        )}
      </div>

      <div className="pt-4 mt-2 border-t border-border flex items-center justify-between">
        <div>
          <span className={cn('font-semibold text-foreground', compact ? 'text-lg' : 'text-lg font-bold')}>
            ${product.price.toFixed(2)}
          </span>
          {!compact && product.originalPrice && (
            <span className="ml-2 text-xs text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
          )}
        </div>
        <button
          type="button"
          onClick={onAddToCart}
          className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all transform active:scale-95 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Cart</span>
        </button>
      </div>
    </div>
  );
}
