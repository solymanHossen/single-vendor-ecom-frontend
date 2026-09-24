import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  value: number
  size?: "sm" | "md"
  className?: string
}

/** Five stars with fractional fill (e.g. 4.3 → four full stars and a third). */
export function StarRating({ value, size = "sm", className }: StarRatingProps) {
  const clamped = Math.max(0, Math.min(5, value))
  const iconSize = size === "sm" ? "size-3.5" : "size-5"

  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={`Rated ${clamped.toFixed(1)} out of 5`}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const fill = Math.max(0, Math.min(1, clamped - index))
        return (
          <span
            key={index}
            className={cn("relative inline-block", iconSize)}
            aria-hidden="true"
          >
            <Star
              className={cn(
                "absolute inset-0 text-muted-foreground/30",
                iconSize
              )}
            />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star className={cn("fill-amber-400 text-amber-400", iconSize)} />
            </span>
          </span>
        )
      })}
    </span>
  )
}
