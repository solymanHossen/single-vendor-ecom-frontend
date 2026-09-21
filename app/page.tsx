'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  ShoppingBag, ArrowRight, ChevronLeft, ChevronRight,
  Star, Heart, ShieldCheck, Leaf, Sparkles, X, Plus, Minus,
  Check, Eye, RefreshCw, Award, Package, ArrowUpRight, Share2, HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Header, type HeaderTab } from '@/components/header';

// ─── Types ──────────────────────────────────────────────────────────────

interface Color {
  name: string;
  hex: string;
  bgClass: string;
  img: string;
}

interface Product {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  badge: string;
  category: string;
  description: string;
  materials: string[];
  ecoImpact: string;
  colors: Color[];
  mainImage: string;
}

interface CartItem extends Product {
  quantity: number;
  selectedColor: Color;
}

interface Category {
  id: string;
  label: string;
}

interface GalleryItem {
  title: string;
  tag: string;
  img: string;
}

interface Testimonial {
  author: string;
  role: string;
  rating: number;
  text: string;
}

interface ShippingDetails {
  fullName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

type Tab = HeaderTab;
type CheckoutStep = 'shipping' | 'success' | null;

// ─── Data ───────────────────────────────────────────────────────────────

const PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Eco-Loop Thermal Flask',
    subtitle: 'Reusable drinkware for a greener lifestyle.',
    price: 43.85,
    originalPrice: 58.0,
    rating: 4.9,
    reviewsCount: 342,
    badge: 'Promotion',
    category: 'drinkware',
    description:
      'Triple-insulated culinary-grade recycled steel flask with organic matte silicone finish and leak-proof ergonomic carry handle. Keeps cold for 24h, hot for 12h.',
    materials: ['Recycled 18/8 Stainless Steel', 'Bio-based Silicone Ring', 'BPA-Free Bamboo Cap'],
    ecoImpact: 'Saves ~160 single-use plastic bottles annually.',
    colors: [
      { name: 'Forest Moss', hex: '#264b3c', bgClass: 'bg-[#264b3c]', img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80' },
      { name: 'Sky Slate', hex: '#637f8f', bgClass: 'bg-[#637f8f]', img: 'https://images.unsplash.com/photo-1570831739425-89634f07dd00?auto=format&fit=crop&w=800&q=80' },
      { name: 'Earthy Clay', hex: '#b36b4e', bgClass: 'bg-[#b36b4e]', img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80' },
    ],
    mainImage: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'prod-2',
    name: 'PureCeramic Dutch & Stock Duo',
    subtitle: 'Non-toxic cookware for sustainable cooking.',
    price: 78.35,
    originalPrice: 99.0,
    rating: 4.8,
    reviewsCount: 189,
    badge: 'New',
    category: 'cookware',
    description:
      'Mineral-infused ceramic non-stick cooking pots completely free of PTFE, PFOA, lead, and cadmium. Oven safe up to 500°F with tempered glass steam-release lids.',
    materials: ['Natural Sand Ceramic Sol-Gel', '100% Recycled Cast Aluminum Core', 'Stainless Steel Handles'],
    ecoImpact: 'Emits 60% less CO2 during kiln manufacturing than standard Teflon.',
    colors: [
      { name: 'Lime Citrus', hex: '#a6bf3b', bgClass: 'bg-[#a6bf3b]', img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80' },
      { name: 'Tuscan Sunset', hex: '#d96c34', bgClass: 'bg-[#d96c34]', img: 'https://images.unsplash.com/photo-1584990347449-399066699130?auto=format&fit=crop&w=800&q=80' },
      { name: 'Deep Sage', hex: '#3d5c52', bgClass: 'bg-[#3d5c52]', img: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=800&q=80' },
    ],
    mainImage: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'prod-3',
    name: 'Nordic Ribbed Rapid Kettle',
    subtitle: 'Kettle & Toaster eco-friendly meals.',
    price: 143.65,
    originalPrice: 165.0,
    rating: 5.0,
    reviewsCount: 420,
    badge: 'Customer favorite',
    category: 'appliances',
    description:
      'Ultra-low energy rapid boil electric kettle featuring tactile fluted outer insulation, natural FSC-certified oiled beechwood handle and precision pour spout.',
    materials: ['High Borosilicate Interior', 'Matte Bio-Polymer Exterior', 'Natural Beech Wood'],
    ecoImpact: 'Consumes 35% less electricity with single-cup rapid boil technology.',
    colors: [
      { name: 'Sage Celadon', hex: '#6e8f7a', bgClass: 'bg-[#6e8f7a]', img: 'https://images.unsplash.com/photo-1594213114663-ddfeefe51792?auto=format&fit=crop&w=800&q=80' },
      { name: 'Nordic Chalk', hex: '#e3dfd7', bgClass: 'bg-[#e3dfd7]', img: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=800&q=80' },
      { name: 'Slate Teal', hex: '#365352', bgClass: 'bg-[#365352]', img: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80' },
    ],
    mainImage: 'https://images.unsplash.com/photo-1594213114663-ddfeefe51792?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'prod-4',
    name: 'Wild Honey Bamboo Utensil Set',
    subtitle: 'Bamboo made utensil holder with 5 spoons.',
    price: 26.27,
    originalPrice: 35.0,
    rating: 4.7,
    reviewsCount: 112,
    badge: 'New',
    category: 'utensils',
    description:
      'Hand-carved organic moso bamboo culinary utensils nestled in a sunny mustard glazed stoneware crock. Naturally antibacterial and heat resistant.',
    materials: ['Organic Moso Bamboo', 'Food-Safe Organic Walnut Oil', 'Glazed Terracotta Pot'],
    ecoImpact: 'Zero synthetic plastics; 100% biodegradable bamboo harvested sustainably.',
    colors: [
      { name: 'Mustard Sun', hex: '#cb9b28', bgClass: 'bg-[#cb9b28]', img: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=800&q=80' },
      { name: 'Natural Clay', hex: '#cfc4b0', bgClass: 'bg-[#cfc4b0]', img: 'https://images.unsplash.com/photo-1556911073-38141963c9e0?auto=format&fit=crop&w=800&q=80' },
      { name: 'Olive Green', hex: '#5f6946', bgClass: 'bg-[#5f6946]', img: 'https://images.unsplash.com/photo-1584990347449-399066699130?auto=format&fit=crop&w=800&q=80' },
    ],
    mainImage: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'prod-5',
    name: 'AromaSmart Low-Energy Rice Master',
    subtitle: 'Polished ceramic pot for mindful cooking.',
    price: 189.0,
    originalPrice: 220.0,
    rating: 4.9,
    reviewsCount: 512,
    badge: 'Eco Award',
    category: 'appliances',
    description:
      'Induction multi-cooker with heavy non-toxic stoneware inner pot. Cooks fluffy heirloom grains, soups, and slow-braises with micro-steaming technology.',
    materials: ['Non-stick Stoneware', 'Recycled Polycarbonate Shell'],
    ecoImpact: 'A+++ energy efficiency rating with thermal lock retention.',
    colors: [
      { name: 'Sage Mint', hex: '#638475', bgClass: 'bg-[#638475]', img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80' },
      { name: 'Alabaster', hex: '#f0ede6', bgClass: 'bg-[#f0ede6]', img: 'https://images.unsplash.com/photo-1584990347449-399066699130?auto=format&fit=crop&w=800&q=80' },
    ],
    mainImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'prod-6',
    name: 'DuoSteam Harvest Cooker',
    subtitle: 'Vibrant zero-waste culinary preparation.',
    price: 119.5,
    originalPrice: 145.0,
    rating: 4.9,
    reviewsCount: 230,
    badge: 'New Arrival',
    category: 'appliances',
    description:
      'Multifunctional electric skillet and two-tier steamer for effortless farm-fresh family meals with gentle heat distribution.',
    materials: ['Anodized Cast Aluminum', 'Tempered Glass', 'Natural Brass Dial'],
    ecoImpact: 'Steam technology preserves 45% more nutrients with zero oil needed.',
    colors: [
      { name: 'Deep Spruce', hex: '#214941', bgClass: 'bg-[#214941]', img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80' },
      { name: 'Terracotta', hex: '#b35d3d', bgClass: 'bg-[#b35d3d]', img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80' },
    ],
    mainImage: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
  },
];

const CATEGORIES: Category[] = [
  { id: 'all', label: 'All Collection' },
  { id: 'drinkware', label: 'Eco Drinkware' },
  { id: 'cookware', label: 'Non-Toxic Cookware' },
  { id: 'appliances', label: 'Green Appliances' },
  { id: 'utensils', label: 'Wood & Bamboo' },
];

const EXPLORE_BUBBLES: GalleryItem[] = [
  { title: 'Explore CupEco', img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80', tag: 'Shop →' },
  { title: 'Explore EcoSpoonery', img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80', tag: 'Shop →' },
  { title: 'Explore NatureSip', img: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=400&q=80', tag: 'Shop →' },
  { title: 'Explore FreshPitcher', img: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=400&q=80', tag: 'Shop →' },
];

const GALLERY_ITEMS: GalleryItem[] = [
  { title: 'SkilletPro Non-Stick Pan', tag: 'Cast Cookware', img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80' },
  { title: 'Grain Slice Board Duo', tag: 'Acacia Wood', img: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=600&q=80' },
  { title: 'Bamboo Utensil Set', tag: 'Zero Plastic', img: 'https://images.unsplash.com/photo-1556911073-38141963c9e0?auto=format&fit=crop&w=600&q=80' },
  { title: 'StoneTip Ceramic Cup', tag: 'Handmade Glaze', img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80' },
];

const TESTIMONIALS: Testimonial[] = [
  {
    author: 'Jane Cooper',
    role: 'Nutritionist & Food Stylist',
    rating: 5,
    text: "Homedine's glass jars and ceramic non-toxic pans have completely transformed my kitchen setup. Mindful eating feels effortless.",
  },
  {
    author: 'Darlene Robertson',
    role: 'Culinary Instructor',
    rating: 5,
    text: 'Fantastic build quality and fast carbon-neutral delivery. My kitchen space feels so much calmer, cleaner, and grounded.',
  },
  {
    author: 'Jacob Jones',
    role: 'Food Blogger & Author',
    rating: 5,
    text: "I love Homedine's eco-conscious ethos. The tea kettle boils fast and looks like a timeless sculptural centerpiece on our counter.",
  },
  {
    author: 'Esther Howard',
    role: 'Sous Chef',
    rating: 5,
    text: 'The bamboo utensil holder set has zero rough edges and holds up to daily high heat. True heirloom craftsmanship.',
  },
];

const FREE_SHIPPING_THRESHOLD = 100;
const EMPTY_SHIPPING: ShippingDetails = {
  fullName: '',
  email: '',
  address: '',
  city: '',
  postalCode: '',
  country: '',
};

// ─── Small shared pieces ────────────────────────────────────────────────

function StarRating({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn('flex items-center gap-0.5 text-amber-500', className)}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={cn('w-3.5 h-3.5', i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300')}
        />
      ))}
    </div>
  );
}

function ColorSwatches({
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
              ? 'ring-2 ring-offset-2 ring-[#16362c] scale-110'
              : 'opacity-80 hover:opacity-100',
          )}
          title={c.name}
        />
      ))}
    </div>
  );
}

function QuantityStepper({
  quantity,
  onDecrease,
  onIncrease,
}: {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <div className="inline-flex items-center gap-3 bg-white rounded-full border border-[#ded8cb] px-1 py-1">
      <button
        type="button"
        onClick={onDecrease}
        className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#ece7dd] text-[#16362c] transition-colors"
      >
        <Minus className="w-3 h-3" />
      </button>
      <span className="text-sm font-medium text-[#16362c] w-4 text-center">{quantity}</span>
      <button
        type="button"
        onClick={onIncrease}
        className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#ece7dd] text-[#16362c] transition-colors"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
}

function ProductCard({
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
        'group bg-[#ece7dd] rounded-3xl flex flex-col justify-between transition-all duration-300 hover:shadow-xl border border-[#dfd8cc]',
        compact ? 'p-5 hover:-translate-y-1' : 'p-6',
      )}
    >
      <div>
        <div className="flex items-center justify-between mb-3 z-10">
          <span className="text-[11px] font-medium tracking-wide px-3 py-1 rounded-full border border-[#16362c]/30 text-[#16362c] italic font-serif bg-white/40 backdrop-blur-sm">
            {product.badge}
          </span>
          <button
            type="button"
            onClick={onToggleWishlist}
            className="p-1.5 rounded-full hover:bg-white/60 text-[#16362c] transition-colors"
          >
            <Heart className={cn('w-4 h-4', isWishlisted && 'text-red-600 fill-red-600')} />
          </button>
        </div>

        <div
          onClick={onOpen}
          className={cn(
            'relative w-full rounded-2xl overflow-hidden cursor-pointer flex items-center justify-center mb-4 bg-gradient-to-b from-[#f2ede4] to-[#e4ded3]',
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
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="bg-white/90 text-[#16362c] px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-md flex items-center gap-1.5 backdrop-blur-sm">
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
            className="font-medium text-sm text-[#16362c] leading-snug hover:underline cursor-pointer line-clamp-2 mb-4"
          >
            {product.subtitle}
          </h3>
        ) : (
          <>
            <h3
              onClick={onOpen}
              className="text-base font-medium text-[#16362c] hover:underline cursor-pointer"
            >
              {product.name}
            </h3>
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{product.description}</p>
          </>
        )}
      </div>

      <div className="pt-4 mt-2 border-t border-[#dfd8cc] flex items-center justify-between">
        <div>
          <span className={cn('font-semibold text-[#16362c]', compact ? 'text-lg' : 'text-lg font-bold')}>
            ${product.price.toFixed(2)}
          </span>
          {!compact && product.originalPrice && (
            <span className="ml-2 text-xs text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
          )}
        </div>
        <button
          type="button"
          onClick={onAddToCart}
          className="inline-flex items-center gap-1.5 bg-[#113f36] hover:bg-[#185348] text-[#fbf0c9] px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all transform active:scale-95 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Cart</span>
        </button>
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────

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
    <div className="min-h-screen bg-[#f7f5f0] text-[#1c2c26] font-sans antialiased selection:bg-[#113f36] selection:text-[#fbf0c9]">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 bg-[#113f36] text-[#fbf0c9] px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-800 transition-all">
          <Leaf className="w-5 h-5 text-emerald-300" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
          {/* Hero */}
          <section className="relative text-white overflow-hidden min-h-[580px] lg:min-h-[660px] flex items-center">
            <Image
              src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=2000&q=85"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover -z-10"
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0e2b25]/85 via-[#0e2b25]/50 to-[#0e2b25]/70" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-6 pt-6 sm:pt-0">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs uppercase tracking-widest text-[#faf3de]">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Conscious Living · 2026 Collection</span>
                  </div>

                  <h1 className="text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight text-white leading-[1.1]">
                    Eco-Friendly <br />
                    <span className="font-serif italic font-semibold text-[#faf3de]">Kitchenware</span> for <br />
                    a greener home
                  </h1>

                  <p className="text-gray-200 text-sm sm:text-base max-w-lg font-normal leading-relaxed opacity-90">
                    The eco-friendly kitchenware niche with a sense of urgency, crafted with non-toxic botanical
                    minerals and reclaimed raw earth materials for everyday joy.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-4">
                    <button
                      onClick={() => setActiveTab('shop')}
                      className="inline-flex items-center gap-3 bg-[#faf0ca] hover:bg-[#f6e6ab] text-[#113f36] px-7 py-3 rounded-full font-medium text-sm sm:text-base transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                    >
                      <span>Shop now</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => scrollToSection('bestsellers-section')}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-black/20 hover:bg-black/30 border border-white/30 text-white text-sm backdrop-blur-sm transition-all"
                    >
                      <span>Explore Bestsellers</span>
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 flex justify-end">
                  <div className="bg-[#244b41]/65 backdrop-blur-md border border-white/20 rounded-3xl p-7 text-white shadow-2xl max-w-xs w-full">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-wider font-semibold text-emerald-200">Natural.</p>
                        <p className="text-xs uppercase tracking-wider font-semibold text-emerald-200">Sustainable.</p>
                        <p className="text-xs uppercase tracking-wider font-semibold text-emerald-200">Eco-conscious.</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <Leaf className="w-4 h-4 text-emerald-300" />
                      </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-white/15">
                      <div className="font-serif text-6xl sm:text-7xl font-semibold italic text-[#faf3de] tracking-tight">
                        96%
                      </div>
                      <p className="text-xs text-gray-200 mt-1">
                        Biodegradable or endlessly recyclable materials used across all products.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Bestsellers */}
          <section id="bestsellers-section" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-[#416859]">
                  Eco Essentials Planet-Friendly
                </span>
                <h2 className="text-3xl sm:text-4xl font-normal text-[#16362c] mt-1">
                  Bestselling <span className="font-serif italic font-bold">✧ Products</span>
                </h2>
              </div>

              <button
                onClick={() => setActiveTab('shop')}
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#16362c] hover:text-[#25634d] transition-colors"
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
                  onSelectColor={(color) => handleColorChange(product.id, color)}
                  onOpen={() => openProductModal(product)}
                  onToggleWishlist={() => toggleWishlist(product.id)}
                  onAddToCart={() => addToCart(product, getActiveColor(product))}
                />
              ))}
            </div>
          </section>

          {/* Explore categories */}
          <section className="py-10 bg-[#eae4d7] border-y border-[#dfd8cb]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-normal text-[#16362c]">
                  Curated Categories <span className="font-serif italic">by Sustainable Craft</span>
                </h3>
                <span className="text-xs text-gray-500 hidden sm:inline">Handcrafted & plastic-free</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                {EXPLORE_BUBBLES.map((bubble) => (
                  <div
                    key={bubble.title}
                    onClick={() => setActiveTab('shop')}
                    className="group relative h-48 sm:h-60 rounded-3xl overflow-hidden shadow-sm cursor-pointer"
                  >
                    <Image
                      src={bubble.img}
                      alt={bubble.title}
                      fill
                      sizes="(min-width: 640px) 25vw, 50vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex flex-col justify-end p-4 text-white">
                      <p className="text-sm font-semibold tracking-wide">{bubble.title}</p>
                      <div className="mt-2 inline-flex items-center gap-1 text-[11px] bg-[#fbf0c9] text-[#113f36] px-3 py-1 rounded-full font-medium w-fit">
                        {bubble.tag}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Feature spotlights */}
          <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#e4ded3] rounded-3xl p-6 sm:p-12 border border-[#d6cfc2]">
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-block px-3 py-1 rounded-full bg-[#16362c]/10 text-[#16362c] text-xs font-semibold uppercase tracking-wider">
                  Featured Innovation
                </div>
                <h3 className="text-3xl sm:text-5xl font-normal text-[#16362c] leading-tight">
                  Best <span className="font-serif italic font-bold">sellers</span>
                </h3>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed max-w-md">
                  A polished cooking rice pot rests on a rustic wooden surface, encircled by fresh herbs — a perfect
                  blend of durability and nature for mindful cooking.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => openProductModal(PRODUCTS[4])}
                    className="inline-flex items-center gap-2 bg-[#113f36] text-[#fbf0c9] hover:bg-[#195549] px-6 py-3 rounded-full text-xs font-semibold tracking-wide transition-all shadow-md"
                  >
                    <span>Shop now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-6 flex items-center justify-center">
                <div className="relative w-full max-w-md h-72 sm:h-96 rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80"
                    alt="AromaSmart Cooker"
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-medium text-gray-900 shadow">
                    🌱 Recycled Aluminium &amp; Mineral Non-Stick
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#ded8cc] rounded-3xl p-6 sm:p-12 border border-[#d2cbbe]">
              <div className="lg:col-span-6 order-2 lg:order-1 flex items-center justify-center">
                <div className="relative w-full max-w-md h-72 sm:h-96 rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=80"
                    alt="DuoSteam Skillet"
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-[#113f36] text-[#fbf0c9] px-3.5 py-1.5 rounded-full text-xs font-semibold">
                    New Era Steaming
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 order-1 lg:order-2 space-y-5">
                <div className="inline-block px-3 py-1 rounded-full bg-[#16362c]/10 text-[#16362c] text-xs font-semibold uppercase tracking-wider">
                  Zero Waste Cooking
                </div>
                <h3 className="text-3xl sm:text-5xl font-normal text-[#16362c] leading-tight">
                  New <span className="font-serif italic font-bold">Arrival</span>
                </h3>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed max-w-md">
                  A DuoSteam showcases a colorful array of fresh, seasonal vegetables — a vibrant celebration of
                  zero-waste, planet-friendly kitchen practices.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => openProductModal(PRODUCTS[5])}
                    className="inline-flex items-center gap-2 bg-[#113f36] text-[#fbf0c9] hover:bg-[#195549] px-6 py-3 rounded-full text-xs font-semibold tracking-wide transition-all shadow-md"
                  >
                    <span>Shop now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section id="gallery-section" className="py-16 bg-[#eae4d7] border-t border-[#dfd8cb]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#416859]">
                    Thoughtful, Planet-Prioritizing Ideas
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-normal text-[#16362c] mt-1">
                    and Inspiration <span className="font-serif italic font-bold">✧ Gallery</span>
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2.5 rounded-full border border-gray-400 text-gray-700 hover:bg-gray-200 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="p-2.5 rounded-full border border-gray-400 text-gray-700 hover:bg-gray-200 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {GALLERY_ITEMS.map((item) => (
                  <div
                    key={item.title}
                    className="group relative h-64 sm:h-72 rounded-2xl overflow-hidden shadow-sm bg-white cursor-pointer"
                    onClick={() => triggerToast(`Browsing inspiration: ${item.title}`)}
                  >
                    <Image
                      src={item.img}
                      alt={item.title}
                      fill
                      sizes="(min-width: 768px) 25vw, 50vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                      <span className="text-[10px] uppercase font-semibold text-emerald-300 tracking-wider">
                        {item.tag}
                      </span>
                      <p className="text-xs sm:text-sm font-medium mt-0.5">{item.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#e4ded2] rounded-3xl p-8 sm:p-12 border border-[#d6cfc1]">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-[#cfc7b8]">
                <div className="flex items-baseline gap-3">
                  <span className="font-serif text-5xl sm:text-6xl font-bold italic text-[#16362c]">4.9</span>
                  <span className="text-xl text-gray-600 font-serif">/ 5</span>
                </div>
                <div className="max-w-md">
                  <StarRating rating={5} className="mb-1" />
                  <p className="text-sm font-semibold text-[#16362c]">
                    More than 25,000 5-Star Reviews for Our Award-Winning Eco Products
                  </p>
                </div>
                <div className="flex items-center gap-6 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#16362c]" />
                    <span>Verified Carbon Neutral</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#16362c]" />
                    <span>B-Corp Certified</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
                {TESTIMONIALS.map((t) => (
                  <div
                    key={t.author}
                    className="bg-white/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between border border-white/60"
                  >
                    <div>
                      <span className="font-serif text-4xl text-[#16362c] opacity-40 leading-none">&ldquo;</span>
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic mt-2">{t.text}</p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <p className="text-xs font-bold text-[#16362c]">{t.author}</p>
                      <p className="text-[11px] text-gray-500">{t.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {activeTab === 'shop' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#416859]">
              The Full Pantry &amp; Kitchenware
            </span>
            <h1 className="text-4xl sm:text-5xl font-light text-[#16362c] mt-2">
              Sustainable Living <span className="font-serif italic font-bold">Catalog</span>
            </h1>
            <p className="text-gray-600 text-sm mt-3">
              Explore clean-burning, non-toxic cookware, insulated drinkware, and sustainably harvested bamboo
              kitchen tools designed for longevity.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#dfd8cc] mb-8">
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    'px-4 py-2 rounded-full text-xs font-medium transition-all',
                    selectedCategory === cat.id
                      ? 'bg-[#113f36] text-[#fbf0c9] shadow'
                      : 'bg-[#ece7dd] text-[#16362c] hover:bg-[#ded8cc]',
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="text-xs text-gray-500">
              Showing <span className="font-bold text-[#16362c]">{filteredProducts.length}</span> curated items
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-[#ece7dd] rounded-3xl p-8">
              <Leaf className="w-12 h-12 mx-auto text-emerald-800 mb-3 opacity-40" />
              <p className="text-lg font-medium text-gray-800">No products matched your search.</p>
              <p className="text-xs text-gray-500 mt-1">
                Try searching for &quot;kettle&quot;, &quot;pot&quot;, &quot;bottle&quot;, or &quot;bamboo&quot;.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-4 inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#113f36] text-[#fbf0c9] text-xs font-semibold"
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
                  onSelectColor={(color) => handleColorChange(product.id, color)}
                  onOpen={() => openProductModal(product)}
                  onToggleWishlist={() => toggleWishlist(product.id)}
                  onAddToCart={() => addToCart(product, getActiveColor(product))}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'about' && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-16">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#416859]">Our Story</span>
            <h1 className="text-4xl sm:text-5xl font-light text-[#16362c] mt-2">
              Kitchenware made <span className="font-serif italic font-bold">with the planet in mind</span>
            </h1>
            <p className="text-gray-600 text-sm sm:text-base mt-4 leading-relaxed">
              Homedine started with a simple frustration: most &quot;eco&quot; kitchenware still leaned on plastics and
              synthetic coatings. So we set out to build a collection sourced entirely from reclaimed metals, natural
              ceramics, and sustainably harvested wood — built to last generations, not landfill cycles.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: Package, label: 'Free shipping over $100' },
              { icon: RefreshCw, label: 'Easy 30-day returns' },
              { icon: ShieldCheck, label: 'Secure checkout' },
              { icon: Leaf, label: 'Carbon-neutral delivery' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 text-center bg-[#ece7dd] rounded-2xl p-6 border border-[#dfd8cc]"
              >
                <Icon className="w-6 h-6 text-[#16362c]" />
                <span className="text-xs font-medium text-[#16362c]">{label}</span>
              </div>
            ))}
          </div>

          <div className="text-center">
            <a
              href="mailto:hello@homedine.example"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#16362c] hover:text-[#25634d] transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              Questions? Reach our team
            </a>
          </div>
        </div>
      )}

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

// ─── Product quick-view modal ───────────────────────────────────────────

function ProductModal({
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
        className="bg-[#f7f5f0] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto grid sm:grid-cols-2 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-[#16362c] shadow-sm transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative h-64 sm:h-full min-h-[280px] bg-gradient-to-b from-[#f2ede4] to-[#e4ded3] p-6">
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
            <span className="text-[11px] font-medium tracking-wide px-3 py-1 rounded-full border border-[#16362c]/30 text-[#16362c] italic font-serif bg-white/60">
              {product.badge}
            </span>
          </div>

          <h2 className="text-2xl font-medium text-[#16362c]">{product.name}</h2>

          <div className="flex items-center gap-2">
            <StarRating rating={product.rating} />
            <span className="text-xs text-gray-500">
              {product.rating.toFixed(1)} · {product.reviewsCount} reviews
            </span>
          </div>

          <p className="text-sm text-gray-700 leading-relaxed">{product.description}</p>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#16362c]">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>

          <div className="flex items-start gap-2 bg-emerald-900/5 border border-emerald-900/10 rounded-xl p-3">
            <Leaf className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
            <p className="text-xs text-emerald-900">{product.ecoImpact}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-[#16362c] mb-2">Materials</p>
            <ul className="text-xs text-gray-600 space-y-1">
              {product.materials.map((m) => (
                <li key={m} className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-emerald-700 shrink-0" />
                  {m}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold text-[#16362c] mb-2">Color — {activeColor.name}</p>
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
              className="flex-1 inline-flex items-center justify-center gap-2 bg-[#113f36] hover:bg-[#185348] text-[#fbf0c9] px-5 py-3 rounded-full text-sm font-semibold tracking-wide transition-all active:scale-95 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add to Cart
            </button>
            <button
              onClick={onToggleWishlist}
              className="p-3 rounded-full border border-[#ded8cb] hover:bg-white text-[#16362c] transition-colors"
              title="Save to wishlist"
            >
              <Heart className={cn('w-4 h-4', isWishlisted && 'text-red-600 fill-red-600')} />
            </button>
            <button
              onClick={onShare}
              className="p-3 rounded-full border border-[#ded8cb] hover:bg-white text-[#16362c] transition-colors"
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

// ─── Cart drawer (cart → shipping → success) ────────────────────────────

function CartDrawer({
  cart,
  checkoutStep,
  shippingDetails,
  orderReference,
  subtotal,
  shippingProgress,
  remainingForFreeShipping,
  onClose,
  onUpdateQuantity,
  onRemove,
  onStartCheckout,
  onBackToCart,
  onShippingDetailsChange,
  onShippingSubmit,
  onFinishCheckout,
}: {
  cart: CartItem[];
  checkoutStep: CheckoutStep;
  shippingDetails: ShippingDetails;
  orderReference: string;
  subtotal: number;
  shippingProgress: number;
  remainingForFreeShipping: number;
  onClose: () => void;
  onUpdateQuantity: (id: string, colorName: string, delta: number) => void;
  onRemove: (id: string, colorName: string) => void;
  onStartCheckout: () => void;
  onBackToCart: () => void;
  onShippingDetailsChange: (details: ShippingDetails) => void;
  onShippingSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onFinishCheckout: () => void;
}) {
  const field = (key: keyof ShippingDetails, label: string, type = 'text') => (
    <div className="space-y-1">
      <label className="text-xs font-medium text-[#16362c]">{label}</label>
      <input
        required
        type={type}
        value={shippingDetails[key]}
        onChange={(e) => onShippingDetailsChange({ ...shippingDetails, [key]: e.target.value })}
        className="w-full bg-white text-sm text-gray-900 px-3.5 py-2.5 rounded-xl border border-[#ded8cb] focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div
        className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-[#f7f5f0] shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-[#ded8cb]">
          <h2 className="text-lg font-medium text-[#16362c]">
            {checkoutStep === 'shipping' && 'Shipping details'}
            {checkoutStep === 'success' && 'Order confirmed'}
            {checkoutStep === null && `Your Cart (${cart.reduce((n, i) => n + i.quantity, 0)})`}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#ece7dd] text-[#16362c]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {checkoutStep === null && (
          <>
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
                <ShoppingBag className="w-10 h-10 text-[#16362c]/30" />
                <p className="text-sm text-gray-600">Your cart is empty.</p>
                <button
                  onClick={onClose}
                  className="mt-2 inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#113f36] text-[#fbf0c9] text-xs font-semibold"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="p-5 border-b border-[#ded8cb]">
                  {remainingForFreeShipping > 0 ? (
                    <p className="text-xs text-gray-600 mb-2">
                      Add <span className="font-semibold text-[#16362c]">${remainingForFreeShipping.toFixed(2)}</span>{' '}
                      more for free shipping
                    </p>
                  ) : (
                    <p className="text-xs font-medium text-emerald-700 mb-2">
                      🎉 You&apos;ve unlocked free shipping!
                    </p>
                  )}
                  <div className="h-1.5 w-full bg-[#ece7dd] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#113f36] rounded-full transition-all"
                      style={{ width: `${shippingProgress}%` }}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {cart.map((item) => (
                    <div key={`${item.id}-${item.selectedColor.name}`} className="flex gap-3">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-b from-[#f2ede4] to-[#e4ded3] shrink-0">
                        <Image
                          src={item.selectedColor.img || item.mainImage}
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-contain mix-blend-multiply p-1"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-[#16362c] line-clamp-1">{item.name}</p>
                          <button
                            onClick={() => onRemove(item.id, item.selectedColor.name)}
                            className="text-gray-400 hover:text-red-600 shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500">{item.selectedColor.name}</p>
                        <div className="flex items-center justify-between mt-2">
                          <QuantityStepper
                            quantity={item.quantity}
                            onDecrease={() => onUpdateQuantity(item.id, item.selectedColor.name, -1)}
                            onIncrease={() => onUpdateQuantity(item.id, item.selectedColor.name, 1)}
                          />
                          <span className="text-sm font-semibold text-[#16362c]">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-5 border-t border-[#ded8cb] space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-[#16362c]">${subtotal.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={onStartCheckout}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#113f36] hover:bg-[#185348] text-[#fbf0c9] px-5 py-3 rounded-full text-sm font-semibold tracking-wide transition-all active:scale-95 shadow-sm"
                  >
                    Checkout
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {checkoutStep === 'shipping' && (
          <form onSubmit={onShippingSubmit} className="flex-1 flex flex-col overflow-y-auto">
            <div className="flex-1 p-5 space-y-4">
              <button
                type="button"
                onClick={onBackToCart}
                className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#16362c] mb-2"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Back to cart
              </button>

              {field('fullName', 'Full name')}
              {field('email', 'Email', 'email')}
              {field('address', 'Address')}
              <div className="grid grid-cols-2 gap-3">
                {field('city', 'City')}
                {field('postalCode', 'Postal code')}
              </div>
              {field('country', 'Country')}
            </div>

            <div className="p-5 border-t border-[#ded8cb] space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total</span>
                <span className="font-semibold text-[#16362c]">${subtotal.toFixed(2)}</span>
              </div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#113f36] hover:bg-[#185348] text-[#fbf0c9] px-5 py-3 rounded-full text-sm font-semibold tracking-wide transition-all active:scale-95 shadow-sm"
              >
                Place Order
              </button>
            </div>
          </form>
        )}

        {checkoutStep === 'success' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <Check className="w-8 h-8 text-emerald-700" />
            </div>
            <h3 className="text-xl font-medium text-[#16362c]">Thank you!</h3>
            <p className="text-sm text-gray-600 max-w-xs">
              Your order <span className="font-semibold text-[#16362c]">#{orderReference}</span> has been placed for{' '}
              <span className="font-semibold text-[#16362c]">${subtotal.toFixed(2)}</span>. A confirmation email is on
              its way.
            </p>
            <button
              onClick={onFinishCheckout}
              className="mt-2 inline-flex items-center gap-1.5 px-6 py-3 rounded-full bg-[#113f36] text-[#fbf0c9] text-sm font-semibold"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Footer ─────────────────────────────────────────────────────────────

function Footer({ onSubscribed }: { onSubscribed: () => void }) {
  const [email, setEmail] = React.useState('');

  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmail('');
    onSubscribed();
  };

  return (
    <footer className="bg-[#0e2c26] text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-b border-white/10">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { icon: Package, label: 'Free shipping over $100' },
            { icon: RefreshCw, label: 'Easy 30-day returns' },
            { icon: ShieldCheck, label: 'Secure checkout' },
            { icon: Leaf, label: 'Carbon-neutral delivery' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5 text-xs text-gray-300">
              <Icon className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div className="space-y-3 lg:col-span-1">
          <p className="font-serif text-3xl italic font-bold text-[#faf3de]">Homedine</p>
          <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
            Non-toxic, plastic-free kitchenware crafted from reclaimed and biodegradable materials.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white mb-4">Shop</p>
          <ul className="space-y-2.5 text-xs">
            {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
              <li key={c.id}>
                <a href="#" className="hover:text-white transition-colors">
                  {c.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white mb-4">Support</p>
          <ul className="space-y-2.5 text-xs">
            <li>
              <a href="mailto:hello@homedine.example" className="inline-flex items-center gap-1 hover:text-white transition-colors">
                <HelpCircle className="w-3.5 h-3.5" /> Contact us
              </a>
            </li>
            <li>
              <a href="#" className="inline-flex items-center gap-1 hover:text-white transition-colors">
                <ArrowUpRight className="w-3.5 h-3.5" /> Track your order
              </a>
            </li>
            <li>
              <a href="#" className="inline-flex items-center gap-1 hover:text-white transition-colors">
                <ArrowUpRight className="w-3.5 h-3.5" /> Sustainability report
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white mb-4">Stay in the loop</p>
          <p className="text-xs text-gray-400 mb-3">Seasonal drops, eco tips, and members-only offers.</p>
          <form onSubmit={handleSubscribe} className="flex items-center gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 min-w-0 bg-white/10 text-white placeholder-gray-500 text-xs px-3.5 py-2.5 rounded-full border border-white/15 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="p-2.5 rounded-full bg-[#faf0ca] text-[#113f36] hover:bg-[#f6e6ab] transition-colors shrink-0"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-gray-500">
        <p>© {new Date().getFullYear()} Homedine. All rights reserved.</p>
        <p>Designed for a greener kitchen, everywhere.</p>
      </div>
    </footer>
  );
}
