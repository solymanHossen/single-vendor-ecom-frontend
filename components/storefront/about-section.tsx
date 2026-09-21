import { HelpCircle } from 'lucide-react';
import { TRUST_BADGES } from './data';

export function AboutSection() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-16">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">Our Story</span>
        <h1 className="text-4xl sm:text-5xl font-light text-foreground mt-2">
          Kitchenware made <span className="font-serif italic font-bold">with the planet in mind</span>
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base mt-4 leading-relaxed">
          Homedine started with a simple frustration: most &quot;eco&quot; kitchenware still leaned on plastics and
          synthetic coatings. So we set out to build a collection sourced entirely from reclaimed metals, natural
          ceramics, and sustainably harvested wood — built to last generations, not landfill cycles.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6">
        {TRUST_BADGES.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-2 text-center bg-muted rounded-2xl p-6 border border-border"
          >
            <Icon className="w-6 h-6 text-foreground" />
            <span className="text-xs font-medium text-foreground">{label}</span>
          </div>
        ))}
      </div>

      <div className="text-center">
        <a
          href="mailto:hello@homedine.example"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-primary transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          Questions? Reach our team
        </a>
      </div>
    </div>
  );
}
