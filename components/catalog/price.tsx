import { discountPercent, formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"

interface PriceProps {
  basePrice: string
  discountPrice: string | null
  size?: "sm" | "lg"
  className?: string
}

export function Price({
  basePrice,
  discountPrice,
  size = "sm",
  className,
}: PriceProps) {
  const percent = discountPercent(basePrice, discountPrice)
  const current = discountPrice ?? basePrice

  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-baseline gap-x-2 gap-y-0.5",
        className
      )}
    >
      <span
        className={cn(
          "font-bold text-foreground",
          size === "lg" ? "text-3xl tracking-tight" : "text-sm"
        )}
      >
        {formatPrice(current)}
      </span>
      {percent > 0 && (
        <>
          <span
            className={cn(
              "text-muted-foreground line-through",
              size === "lg" ? "text-base" : "text-xs"
            )}
          >
            <span className="sr-only">Regular price </span>
            {formatPrice(basePrice)}
          </span>
          {size === "lg" && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
              Save{" "}
              {formatPrice(
                Number.parseFloat(basePrice) - Number.parseFloat(current)
              )}{" "}
              ({percent}%)
            </span>
          )}
        </>
      )}
    </span>
  )
}
