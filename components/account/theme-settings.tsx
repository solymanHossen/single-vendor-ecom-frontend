"use client"

import * as React from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Section } from "@/components/admin/products/form-primitives"
import { cn } from "@/lib/utils"

export function ThemeSettings() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Section title="Appearance" description="Customize how the dashboard looks.">
        <div className="max-w-xl grid grid-cols-3 gap-3">
          <div className="h-[88px] rounded-2xl border border-border/70 bg-muted/30"></div>
          <div className="h-[88px] rounded-2xl border border-border/70 bg-muted/30"></div>
          <div className="h-[88px] rounded-2xl border border-border/70 bg-muted/30"></div>
        </div>
      </Section>
    )
  }

  const options = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ]

  return (
    <Section title="Appearance" description="Customize how the dashboard looks.">
      <div role="radiogroup" aria-label="Theme" className="max-w-xl grid grid-cols-3 gap-3">
        {options.map((item) => {
          const active = theme === item.value
          return (
            <button
              key={item.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setTheme(item.value)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl border p-4 transition-[border-color,box-shadow]",
                active
                  ? "border-foreground ring-4 ring-foreground/8"
                  : "border-border/70 hover:border-foreground/40"
              )}
            >
              <item.icon
                className={cn(
                  "size-5",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
                aria-hidden="true"
              />
              <span
                className={cn(
                  "text-sm font-medium",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </Section>
  )
}
