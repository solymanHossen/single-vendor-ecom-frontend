import { Award, ShieldCheck } from 'lucide-react';
import { StarRating } from './shared';
import { TESTIMONIALS } from './data';

export function TestimonialsSection() {
  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-muted rounded-3xl p-8 sm:p-12 border border-border">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-border">
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-5xl sm:text-6xl font-bold italic text-foreground">4.9</span>
            <span className="text-xl text-muted-foreground font-serif">/ 5</span>
          </div>
          <div className="max-w-md">
            <StarRating rating={5} className="mb-1" />
            <p className="text-sm font-semibold text-foreground">
              More than 25,000 5-Star Reviews for Our Award-Winning Eco Products
            </p>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-foreground" />
              <span>Verified Carbon Neutral</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-foreground" />
              <span>B-Corp Certified</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.author}
              className="bg-card/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between border border-border"
            >
              <div>
                <span className="font-serif text-4xl text-foreground/30 leading-none">&ldquo;</span>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed italic mt-2">{t.text}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-xs font-bold text-foreground">{t.author}</p>
                <p className="text-[11px] text-muted-foreground">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
