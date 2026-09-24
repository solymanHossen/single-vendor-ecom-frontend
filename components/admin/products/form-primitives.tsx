import * as React from "react"
import { CircleAlert } from "lucide-react"
import { cn } from "@/lib/utils"

export const INPUT_CLASS =
  "h-11 w-full rounded-xl border border-input bg-background px-3.5 text-[15px] shadow-xs transition-[border-color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15 disabled:cursor-not-allowed disabled:bg-muted/60 disabled:text-muted-foreground aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/10"

export function Section({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={cn("rounded-3xl border border-border/70 bg-card p-6 sm:p-7", className)}
    >
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {description && (
            <p className="text-[15px] text-muted-foreground">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export function Field({
  id,
  label,
  hint,
  error,
  counter,
  optional = false,
  children,
}: {
  id: string
  label: string
  hint?: React.ReactNode
  error?: string
  counter?: { value: number; max: number }
  optional?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
          {optional && (
            <span className="ml-1.5 font-normal text-muted-foreground">Optional</span>
          )}
        </label>
        {counter && (
          <span
            className={cn(
              "text-[13px] tabular-nums",
              counter.value > counter.max ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {counter.value}/{counter.max}
          </span>
        )}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className="flex items-center gap-1.5 text-sm text-destructive">
          <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : (
        hint && <p className="text-sm text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}

/** Input with a fixed leading adornment (currency, URL prefix…). */
export function AffixInput({
  prefix,
  className,
  ...props
}: React.ComponentProps<"input"> & { prefix: string }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[15px] text-muted-foreground">
        {prefix}
      </span>
      <input
        {...props}
        className={cn(INPUT_CLASS, className)}
        style={{ paddingLeft: `calc(0.875rem + ${prefix.length}ch + 0.5rem)` }}
      />
    </div>
  )
}
