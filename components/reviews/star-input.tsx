"use client"

import * as React from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

export const RATING_WORDS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"] as const

/** Big, tappable 1–5 stars with a word for the hovered/chosen value. Arrow keys work too. */
export function StarInput({
  value,
  onChange,
  invalid,
  id,
}: {
  value: number
  onChange: (value: number) => void
  invalid?: boolean
  id?: string
}) {
  const [hover, setHover] = React.useState(0)
  const shown = hover || value

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div
        id={id}
        role="radiogroup"
        aria-label="Your rating"
        aria-invalid={invalid || undefined}
        className="flex items-center gap-1 rounded-xl outline-none"
        onMouseLeave={() => setHover(0)}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowUp") {
            event.preventDefault()
            onChange(Math.min(5, (value || 0) + 1))
          }
          if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
            event.preventDefault()
            onChange(Math.max(1, (value || 2) - 1))
          }
        }}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} ${star === 1 ? "star" : "stars"} — ${RATING_WORDS[star]}`}
            tabIndex={value === star || (value === 0 && star === 1) ? 0 : -1}
            onMouseEnter={() => setHover(star)}
            onFocus={() => setHover(0)}
            onClick={() => onChange(star)}
            className="rounded-lg p-0.5 transition-transform outline-none hover:scale-110 focus-visible:ring-4 focus-visible:ring-ring/20 active:scale-95"
          >
            <Star
              className={cn(
                "size-9 transition-colors",
                star <= shown ? "fill-amber-400 text-amber-400" : "text-muted-foreground/35"
              )}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
      <span className={cn("text-base font-medium", shown ? "text-foreground" : "text-muted-foreground")} aria-live="polite">
        {shown ? RATING_WORDS[shown] : "Tap a star to rate"}
      </span>
    </div>
  )
}
