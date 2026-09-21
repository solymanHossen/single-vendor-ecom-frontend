'use client';

import * as React from 'react';
import { Header, type HeaderTab } from '@/components/header';
import { Toast } from '@/components/storefront/toast';
import { HeroSection } from '@/components/storefront/hero-section';
import { BestsellersSection } from '@/components/storefront/bestsellers-section';
import { CategoriesSection } from '@/components/storefront/categories-section';
import { FeatureSpotlight } from '@/components/storefront/feature-spotlight';
import { GallerySection } from '@/components/storefront/gallery-section';
import { TestimonialsSection } from '@/components/storefront/testimonials-section';
import { ShopSection } from '@/components/storefront/shop-section';
import { AboutSection } from '@/components/storefront/about-section';
import { ProductModal } from '@/components/storefront/product-modal';
import { CartDrawer } from '@/components/storefront/cart-drawer';
import { Footer } from '@/components/storefront/footer';
import {
  PRODUCTS, FREE_SHIPPING_THRESHOLD, EMPTY_SHIPPING,
  type Color, type Product, type CartItem, type CheckoutStep, type ShippingDetails,
} from '@/components/storefront/data';

type Tab = HeaderTab;

export default function Page() {
  const [activeTab, setActiveTab] = React.useState<Tab>('home');
  const [cart, setCart] = React.useState<CartItem[]>([
    { ...PRODUCTS[0], quantity: 1, selectedColor: PRODUCTS[0].colors[0] },
  ]);
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = React.useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [wishlist, setWishlist] = React.useState<string[]>(['prod-1']);
  const [checkoutStep, setCheckoutStep] = React.useState<CheckoutStep>(null);
  const [shippingDetails, setShippingDetails] = React.useState<ShippingDetails>(EMPTY_SHIPPING);
  const [activeColorChoices, setActiveColorChoices] = React.useState<Record<string, Color>>({});
  const [modalQuantity, setModalQuantity] = React.useState(1);
  const [orderReference, setOrderReference] = React.useState('');

  const triggerToast = React.useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  }, []);

  // Close the cart drawer / product modal on Escape.
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      setSelectedProductForModal(null);
      setIsCartOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const openProductModal = React.useCallback((product: Product) => {
    setSelectedProductForModal(product);
    setModalQuantity(1);
  }, []);

  const cartSubtotal = React.useMemo(
    () => cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cart],
  );
  const shippingProgress = Math.min(100, (cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartSubtotal);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const getActiveColor = (product: Product) => activeColorChoices[product.id] || product.colors[0];

  const addToCart = (product: Product, colorChoice: Color, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.id === product.id && item.selectedColor.name === colorChoice.name,
      );
      if (existing) {
        return prev.map((item) =>
          item.id === product.id && item.selectedColor.name === colorChoice.name
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [...prev, { ...product, quantity, selectedColor: colorChoice }];
    });
    triggerToast(`Added ${product.name} (${colorChoice.name}) to cart!`);
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, colorName: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id && item.selectedColor.name === colorName) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null),
    );
  };

  const removeFromCart = (id: string, colorName: string) => {
    setCart((prev) => prev.filter((item) => !(item.id === id && item.selectedColor.name === colorName)));
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const isFavorited = prev.includes(productId);
      const updated = isFavorited ? prev.filter((id) => id !== productId) : [...prev, productId];
      triggerToast(isFavorited ? 'Removed from your eco wishlist' : 'Saved to your wishlist! 🌿');
      return updated;
    });
  };

  const handleColorChange = (productId: string, color: Color) => {
    setActiveColorChoices((prev) => ({ ...prev, [productId]: color }));
  };

  const openCheckout = () => setCheckoutStep('shipping');

  const handleShippingSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setOrderReference(`HD-${Date.now().toString().slice(-8)}`);
    setCheckoutStep('success');
  };

  const finishCheckout = () => {
    setCart([]);
    setCheckoutStep(null);
    setShippingDetails(EMPTY_SHIPPING);
    setIsCartOpen(false);
  };

  const closeCartDrawer = () => {
    setIsCartOpen(false);
    if (checkoutStep !== 'success') setCheckoutStep(null);
  };

  const filteredProducts = React.useMemo(() => {
    return PRODUCTS.filter((p) => {
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const scrollToSection = (id: string) => {
    setActiveTab('home');
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary selection:text-primary-foreground">
      {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}

      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onScrollToSection={scrollToSection}
        searchQuery={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value);
          if (activeTab !== 'shop') setActiveTab('shop');
        }}
        wishlistCount={wishlist.length}
        onWishlistClick={() => triggerToast(`You have ${wishlist.length} saved sustainable favorites.`)}
        cartCount={cartCount}
        onCartClick={() => setIsCartOpen(true)}
      />

      {activeTab === 'home' && (
        <>
          <HeroSection
            onShopClick={() => setActiveTab('shop')}
            onExploreClick={() => scrollToSection('bestsellers-section')}
          />

          <BestsellersSection
            wishlist={wishlist}
            getActiveColor={getActiveColor}
            onShopClick={() => setActiveTab('shop')}
            onSelectColor={handleColorChange}
            onOpenProduct={openProductModal}
            onToggleWishlist={toggleWishlist}
            onAddToCart={addToCart}
          />

          <CategoriesSection onSelect={() => setActiveTab('shop')} />

          <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            <FeatureSpotlight
              eyebrow="Featured Innovation"
              heading="Best"
              headingEmphasis="sellers"
              description="A polished cooking rice pot rests on a rustic wooden surface, encircled by fresh herbs — a perfect blend of durability and nature for mindful cooking."
              imageSrc="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80"
              imageAlt="AromaSmart Cooker"
              imageCaption="🌱 Recycled Aluminium & Mineral Non-Stick"
              onShopClick={() => openProductModal(PRODUCTS[4])}
            />

            <FeatureSpotlight
              reverse
              eyebrow="Zero Waste Cooking"
              heading="New"
              headingEmphasis="Arrival"
              description="A DuoSteam showcases a colorful array of fresh, seasonal vegetables — a vibrant celebration of zero-waste, planet-friendly kitchen practices."
              imageSrc="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=80"
              imageAlt="DuoSteam Skillet"
              imageBadge="New Era Steaming"
              onShopClick={() => openProductModal(PRODUCTS[5])}
            />
          </section>

          <GallerySection onItemClick={(title) => triggerToast(`Browsing inspiration: ${title}`)} />

          <TestimonialsSection />
        </>
      )}

      {activeTab === 'shop' && (
        <ShopSection
          filteredProducts={filteredProducts}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          wishlist={wishlist}
          getActiveColor={getActiveColor}
          onSelectColor={handleColorChange}
          onOpenProduct={openProductModal}
          onToggleWishlist={toggleWishlist}
          onAddToCart={addToCart}
          onResetFilters={() => {
            setSearchQuery('');
            setSelectedCategory('all');
          }}
        />
      )}

      {activeTab === 'about' && <AboutSection />}

      <Footer onSubscribed={() => triggerToast('Subscribed! Welcome to the eco community. 🌿')} />

      {selectedProductForModal && (
        <ProductModal
          product={selectedProductForModal}
          activeColor={getActiveColor(selectedProductForModal)}
          quantity={modalQuantity}
          isWishlisted={wishlist.includes(selectedProductForModal.id)}
          onSelectColor={(color) => handleColorChange(selectedProductForModal.id, color)}
          onQuantityChange={setModalQuantity}
          onToggleWishlist={() => toggleWishlist(selectedProductForModal.id)}
          onAddToCart={() => {
            addToCart(selectedProductForModal, getActiveColor(selectedProductForModal), modalQuantity);
            setSelectedProductForModal(null);
          }}
          onShare={() => {
            if (typeof navigator !== 'undefined' && navigator.clipboard) {
              navigator.clipboard.writeText(window.location.href).catch(() => {});
            }
            triggerToast('Link copied to clipboard!');
          }}
          onClose={() => setSelectedProductForModal(null)}
        />
      )}

      {isCartOpen && (
        <CartDrawer
          cart={cart}
          checkoutStep={checkoutStep}
          shippingDetails={shippingDetails}
          orderReference={orderReference}
          subtotal={cartSubtotal}
          shippingProgress={shippingProgress}
          remainingForFreeShipping={remainingForFreeShipping}
          onClose={closeCartDrawer}
          onUpdateQuantity={updateQuantity}
          onRemove={removeFromCart}
          onStartCheckout={openCheckout}
          onBackToCart={() => setCheckoutStep(null)}
          onShippingDetailsChange={setShippingDetails}
          onShippingSubmit={handleShippingSubmit}
          onFinishCheckout={finishCheckout}
        />
      )}
    </div>
  );
}
