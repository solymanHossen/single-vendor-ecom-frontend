import Image from 'next/image';
import { Check, Heart, Leaf, Plus, Share2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ColorSwatches, QuantityStepper, StarRating } from './shared';
import type { Color, Product } from './data';

export function ProductModal({
  product,
  activeColor,
  quantity,
  isWishlisted,
  onSelectColor,
  onQuantityChange,
  onToggleWishlist,
  onAddToCart,
  onShare,
  onClose,
}: {
  product: Product;
  activeColor: Color;
  quantity: number;
  isWishlisted: boolean;
  onSelectColor: (color: Color) => void;
  onQuantityChange: (quantity: number) => void;
  onToggleWishlist: () => void;
  onAddToCart: () => void;
  onShare: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto grid sm:grid-cols-2 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 hover:bg-background text-foreground shadow-sm transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative h-64 sm:h-full min-h-[280px] bg-muted p-6">
          <Image
            src={activeColor.img || product.mainImage}
            alt={product.name}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-contain mix-blend-multiply p-4"
          />
        </div>

        <div className="p-6 sm:p-8 flex flex-col gap-4">
          <div>
            <Badge variant="secondary" className="font-serif italic">
              {product.badge}
            </Badge>
          </div>

          <h2 className="text-2xl font-medium text-foreground">{product.name}</h2>

          <div className="flex items-center gap-2">
            <StarRating rating={product.rating} />
            <span className="text-xs text-muted-foreground">
              {product.rating.toFixed(1)} · {product.reviewsCount} reviews
            </span>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>

          <div className="flex items-start gap-2 bg-secondary/10 border border-secondary/20 rounded-xl p-3">
            <Leaf className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
            <p className="text-xs text-secondary">{product.ecoImpact}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-foreground mb-2">Materials</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              {product.materials.map((m) => (
                <li key={m} className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-secondary shrink-0" />
                  {m}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold text-foreground mb-2">Color — {activeColor.name}</p>
            <ColorSwatches colors={product.colors} activeColor={activeColor} onChange={onSelectColor} />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <QuantityStepper
              quantity={quantity}
              onDecrease={() => onQuantityChange(Math.max(1, quantity - 1))}
              onIncrease={() => onQuantityChange(quantity + 1)}
            />
            <button
              onClick={onAddToCart}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-3 rounded-full text-sm font-semibold tracking-wide transition-all active:scale-95 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add to Cart
            </button>
            <button
              onClick={onToggleWishlist}
              className="p-3 rounded-full border border-border hover:bg-muted text-foreground transition-colors"
              title="Save to wishlist"
            >
              <Heart className={cn('w-4 h-4', isWishlisted && 'text-destructive fill-destructive')} />
            </button>
            <button
              onClick={onShare}
              className="p-3 rounded-full border border-border hover:bg-muted text-foreground transition-colors"
              title="Copy link"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
