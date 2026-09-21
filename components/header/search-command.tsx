'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, Headphones, Watch, Shirt, Gamepad2, ArrowRight } from 'lucide-react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const TRENDING_SEARCHES = [
  { title: 'AuraSonic ANC Headphones Pro', category: 'Audio', href: '/shop?query=headphones', icon: Headphones },
  { title: 'ChronoSmart Ultra Watch', category: 'Electronics', href: '/shop?query=smartwatch', icon: Watch },
  { title: 'NeoTech Waterproof Modular Parka', category: 'Fashion', href: '/shop?query=parka', icon: Shirt },
  { title: 'CyberBlade RGB Mechanical Keyboard', category: 'Gaming', href: '/shop?query=keyboard', icon: Gamepad2 },
];

const POPULAR_CATEGORIES = [
  { name: 'Smartwatches', href: '/shop?category=electronics' },
  { name: 'Wireless Earbuds', href: '/shop?category=audio' },
  { name: 'Streetwear Hoodies', href: '/shop?category=fashion' },
  { name: 'Techwear Jackets', href: '/shop?category=fashion' },
  { name: 'Gaming Gear', href: '/shop?category=accessories' },
];

export interface SearchCommandProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function SearchCommand({ searchQuery, onSearchChange }: SearchCommandProps) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  // Listen for ⌘K or Ctrl+K keyboard shortcut
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      {/* Search Trigger Button */}
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="relative h-10 w-44 md:w-60 lg:w-72 justify-start rounded-full bg-muted/40 border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/70 px-3.5 text-xs font-normal shadow-xs transition-all"
      >
        <Search className="size-4 shrink-0 mr-2 text-muted-foreground" />
        <span className="truncate">{searchQuery || 'Search tech, earbuds, hoodies...'}</span>
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* Command Palette Modal */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Type to search smartwatches, ANC earbuds, streetwear jackets..."
          value={searchQuery}
          onValueChange={onSearchChange}
        />
        <CommandList className="max-h-[380px] p-2">
          <CommandEmpty className="py-8 text-center text-xs text-muted-foreground">
            No matching tech or apparel found.
          </CommandEmpty>

          {/* Quick Categories */}
          <CommandGroup heading="Popular Tech & Fashion Categories">
            <div className="flex flex-wrap gap-1.5 p-2">
              {POPULAR_CATEGORIES.map((cat) => (
                <Badge
                  key={cat.name}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-2.5 py-1 text-xs"
                  onClick={() => handleSelect(cat.href)}
                >
                  {cat.name}
                </Badge>
              ))}
            </div>
          </CommandGroup>

          <CommandSeparator />

          {/* Trending Items */}
          <CommandGroup heading="Trending Products">
            {TRENDING_SEARCHES.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.title}
                  value={item.title}
                  onSelect={() => handleSelect(item.href)}
                  className="flex items-center justify-between p-2.5 rounded-lg cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-muted text-foreground">
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">{item.title}</p>
                      <p className="text-[10px] text-muted-foreground">{item.category}</p>
                    </div>
                  </div>
                  <ArrowRight className="size-3.5 text-muted-foreground" />
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
