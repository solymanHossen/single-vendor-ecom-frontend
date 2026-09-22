'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Logo({
  size = 'sm',
  className,
}: LogoProps) {
  // Dimension mapping for clean logo emblem display
  const dimensions = {
    sm: { width: 36, height: 36 },
    md: { width: 44, height: 44 },
    lg: { width: 56, height: 56 },
  }[size];

  return (
    <div className={cn('inline-flex items-center justify-center select-none group', className)}>
      <div className="relative flex items-center justify-center shrink-0 rounded-xl overflow-hidden shadow-sm transition-transform duration-200 group-hover:scale-105 border border-border/40 bg-background/60 backdrop-blur-sm p-1">
        <Image
          src="/aura-logo.png"
          alt="AURA Brand Logo"
          width={dimensions.width}
          height={dimensions.height}
          className="object-contain rounded-lg"
          priority
        />
      </div>
    </div>
  );
}
