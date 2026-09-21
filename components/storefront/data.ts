// Product color swatches (hex/bgClass below) are catalog data — the actual
// physical color a customer is choosing — not UI chrome, so unlike the rest
// of the storefront they intentionally stay literal instead of theme tokens.

import { Package, RefreshCw, ShieldCheck, Leaf, type LucideIcon } from 'lucide-react';

export interface Color {
  name: string;
  hex: string;
  bgClass: string;
  img: string;
}

export interface Product {
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

export interface CartItem extends Product {
  quantity: number;
  selectedColor: Color;
}

export interface Category {
  id: string;
  label: string;
}

export interface GalleryItem {
  title: string;
  tag: string;
  img: string;
}

export interface Testimonial {
  author: string;
  role: string;
  rating: number;
  text: string;
}

export interface ShippingDetails {
  fullName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export type CheckoutStep = 'shipping' | 'success' | null;

export const PRODUCTS: Product[] = [
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

export const CATEGORIES: Category[] = [
  { id: 'all', label: 'All Collection' },
  { id: 'drinkware', label: 'Eco Drinkware' },
  { id: 'cookware', label: 'Non-Toxic Cookware' },
  { id: 'appliances', label: 'Green Appliances' },
  { id: 'utensils', label: 'Wood & Bamboo' },
];

export const EXPLORE_BUBBLES: GalleryItem[] = [
  { title: 'Explore CupEco', img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80', tag: 'Shop →' },
  { title: 'Explore EcoSpoonery', img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80', tag: 'Shop →' },
  { title: 'Explore NatureSip', img: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=400&q=80', tag: 'Shop →' },
  { title: 'Explore FreshPitcher', img: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=400&q=80', tag: 'Shop →' },
];

export const GALLERY_ITEMS: GalleryItem[] = [
  { title: 'SkilletPro Non-Stick Pan', tag: 'Cast Cookware', img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80' },
  { title: 'Grain Slice Board Duo', tag: 'Acacia Wood', img: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=600&q=80' },
  { title: 'Bamboo Utensil Set', tag: 'Zero Plastic', img: 'https://images.unsplash.com/photo-1556911073-38141963c9e0?auto=format&fit=crop&w=600&q=80' },
  { title: 'StoneTip Ceramic Cup', tag: 'Handmade Glaze', img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80' },
];

export const TESTIMONIALS: Testimonial[] = [
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

export const FREE_SHIPPING_THRESHOLD = 100;

export const EMPTY_SHIPPING: ShippingDetails = {
  fullName: '',
  email: '',
  address: '',
  city: '',
  postalCode: '',
  country: '',
};

export const TRUST_BADGES: { icon: LucideIcon; label: string }[] = [
  { icon: Package, label: 'Free shipping over $100' },
  { icon: RefreshCw, label: 'Easy 30-day returns' },
  { icon: ShieldCheck, label: 'Secure checkout' },
  { icon: Leaf, label: 'Carbon-neutral delivery' },
];
