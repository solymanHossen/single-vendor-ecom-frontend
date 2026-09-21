import { Leaf, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductCard } from './shared';
import { CATEGORIES } from './data';
import type { Color, Product } from './data';

export function ShopSection({
  filteredProducts,
  selectedCategory,
  onSelectCategory,
  wishlist,
  getActiveColor,
  onSelectColor,
  onOpenProduct,
  onToggleWishlist,
  onAddToCart,
  onResetFilters,
}: {
  filteredProducts: Product[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  wishlist: string[];
  getActiveColor: (product: Product) => Color;
  onSelectColor: (productId: string, color: Color) => void;
  onOpenProduct: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, color: Color) => void;
  onResetFilters: () => void;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">
          The Full Pantry &amp; Kitchenware
        </span>
        <h1 className="text-4xl sm:text-5xl font-light text-foreground mt-2">
          Sustainable Living <span className="font-serif italic font-bold">Catalog</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-3">
          Explore clean-burning, non-toxic cookware, insulated drinkware, and sustainably harvested bamboo
          kitchen tools designed for longevity.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-border mb-8">
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={cn(
                'px-4 py-2 rounded-full text-xs font-medium transition-all',
                selectedCategory === cat.id
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70',
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-muted-foreground">
          Showing <span className="font-bold text-foreground">{filteredProducts.length}</span> curated items
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-muted rounded-3xl p-8">
          <Leaf className="w-12 h-12 mx-auto text-primary mb-3 opacity-40" />
          <p className="text-lg font-medium text-foreground">No products matched your search.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Try searching for &quot;kettle&quot;, &quot;pot&quot;, &quot;bottle&quot;, or &quot;bamboo&quot;.
          </p>
          <button
            onClick={onResetFilters}
            className="mt-4 inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              activeColor={getActiveColor(product)}
              isWishlisted={wishlist.includes(product.id)}
              onSelectColor={(color) => onSelectColor(product.id, color)}
              onOpen={() => onOpenProduct(product)}
              onToggleWishlist={() => onToggleWishlist(product.id)}
              onAddToCart={() => onAddToCart(product, getActiveColor(product))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
