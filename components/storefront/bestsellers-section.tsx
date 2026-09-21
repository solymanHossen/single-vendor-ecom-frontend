import { ArrowRight } from 'lucide-react';
import { ProductCard } from './shared';
import type { Color, Product } from './data';
import { PRODUCTS } from './data';

export function BestsellersSection({
  wishlist,
  getActiveColor,
  onShopClick,
  onSelectColor,
  onOpenProduct,
  onToggleWishlist,
  onAddToCart,
}: {
  wishlist: string[];
  getActiveColor: (product: Product) => Color;
  onShopClick: () => void;
  onSelectColor: (productId: string, color: Color) => void;
  onOpenProduct: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, color: Color) => void;
}) {
  return (
    <section id="bestsellers-section" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Eco Essentials Planet-Friendly
          </span>
          <h2 className="text-3xl sm:text-4xl font-normal text-foreground mt-1">
            Bestselling <span className="font-serif italic font-bold">✧ Products</span>
          </h2>
        </div>

        <button
          onClick={onShopClick}
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-primary transition-colors"
        >
          <span>More products</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {PRODUCTS.slice(0, 4).map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            activeColor={getActiveColor(product)}
            isWishlisted={wishlist.includes(product.id)}
            compact
            onSelectColor={(color) => onSelectColor(product.id, color)}
            onOpen={() => onOpenProduct(product)}
            onToggleWishlist={() => onToggleWishlist(product.id)}
            onAddToCart={() => onAddToCart(product, getActiveColor(product))}
          />
        ))}
      </div>
    </section>
  );
}
