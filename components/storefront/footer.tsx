'use client';

import * as React from 'react';
import { ArrowRight, ArrowUpRight, HelpCircle } from 'lucide-react';
import { CATEGORIES, TRUST_BADGES } from './data';

export function Footer({ onSubscribed }: { onSubscribed: () => void }) {
  const [email, setEmail] = React.useState('');

  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmail('');
    onSubscribed();
  };

  return (
    <footer className="bg-primary text-primary-foreground/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-b border-primary-foreground/10">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {TRUST_BADGES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5 text-xs text-primary-foreground/80">
              <Icon className="w-4 h-4 text-accent shrink-0" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div className="space-y-3 lg:col-span-1">
          <p className="font-serif text-3xl italic font-bold text-primary-foreground">Homedine</p>
          <p className="text-xs text-primary-foreground/70 leading-relaxed max-w-xs">
            Non-toxic, plastic-free kitchenware crafted from reclaimed and biodegradable materials.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground mb-4">Shop</p>
          <ul className="space-y-2.5 text-xs">
            {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
              <li key={c.id}>
                <a href="#" className="hover:text-primary-foreground transition-colors">
                  {c.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground mb-4">Support</p>
          <ul className="space-y-2.5 text-xs">
            <li>
              <a href="mailto:hello@homedine.example" className="inline-flex items-center gap-1 hover:text-primary-foreground transition-colors">
                <HelpCircle className="w-3.5 h-3.5" /> Contact us
              </a>
            </li>
            <li>
              <a href="#" className="inline-flex items-center gap-1 hover:text-primary-foreground transition-colors">
                <ArrowUpRight className="w-3.5 h-3.5" /> Track your order
              </a>
            </li>
            <li>
              <a href="#" className="inline-flex items-center gap-1 hover:text-primary-foreground transition-colors">
                <ArrowUpRight className="w-3.5 h-3.5" /> Sustainability report
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground mb-4">Stay in the loop</p>
          <p className="text-xs text-primary-foreground/70 mb-3">Seasonal drops, eco tips, and members-only offers.</p>
          <form onSubmit={handleSubscribe} className="flex items-center gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 min-w-0 bg-primary-foreground/10 text-primary-foreground placeholder-primary-foreground/50 text-xs px-3.5 py-2.5 rounded-full border border-primary-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary-foreground/40"
            />
            <button
              type="submit"
              className="p-2.5 rounded-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-colors shrink-0"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-primary-foreground/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-primary-foreground/60">
        <p>© {new Date().getFullYear()} Homedine. All rights reserved.</p>
        <p>Designed for a greener kitchen, everywhere.</p>
      </div>
    </footer>
  );
}
