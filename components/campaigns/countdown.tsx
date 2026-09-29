"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

function parts(target: number, now: number) {
  const ms = Math.max(0, target - now)
  return {
    done: ms === 0,
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor((ms / 3_600_000) % 24),
    minutes: Math.floor((ms / 60_000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
  }
}

const pad = (value: number) => String(value).padStart(2, "0")

/**
 * Live days/hours/minutes/seconds to `target`. Starts from the server's
 * clock (`serverNow`) so the first render matches, then ticks every second;
 * at zero it refreshes the page so the sale's new state (live/ended) shows.
 */
export function Countdown({
  target,
  serverNow,
  size = "md",
  className,
}: {
  target: string
  serverNow: number
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  const router = useRouter()
  const end = new Date(target).getTime()
  const [now, setNow] = React.useState(serverNow)
  const { done, days, hours, minutes, seconds } = parts(end, now)

  React.useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const refreshed = React.useRef(false)
  React.useEffect(() => {
    if (done && !refreshed.current && Date.now() >= end) {
      refreshed.current = true
      router.refresh()
    }
  }, [done, end, router])

  const units = [
    ...(days > 0 ? [{ value: String(days), label: days === 1 ? "day" : "days" }] : []),
    { value: pad(hours), label: "hrs" },
    { value: pad(minutes), label: "min" },
    { value: pad(seconds), label: "sec" },
  ]

  return (
    <div
      className={cn("flex items-center gap-1.5", className)}
      role="timer"
      aria-label={`${days} days ${hours} hours ${minutes} minutes left`}
    >
      {units.map((unit, index) => (
        <React.Fragment key={unit.label}>
          {index > 0 && size !== "sm" && (
            <span className="text-lg font-semibold opacity-50" aria-hidden="true">
              :
            </span>
          )}
          <span
            className={cn(
              "flex flex-col items-center rounded-xl bg-black/25 tabular-nums backdrop-blur-sm",
              size === "lg" && "min-w-16 px-3 py-2",
              size === "md" && "min-w-12 px-2 py-1.5",
              size === "sm" && "min-w-9 rounded-lg px-1.5 py-1"
            )}
            aria-hidden="true"
          >
            <span
              className={cn(
                "leading-none font-semibold",
                size === "lg" && "text-3xl",
                size === "md" && "text-xl",
                size === "sm" && "text-sm"
              )}
            >
              {unit.value}
            </span>
            <span className={cn("mt-1 uppercase opacity-75", size === "sm" ? "text-[9px]" : "text-[10px] tracking-wider")}>
              {unit.label}
            </span>
          </span>
        </React.Fragment>
      ))}
    </div>
  )
}
