"use client"

import { Cell, Label, Pie, PieChart } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatPrice } from "@/lib/format"
import type {
  AnalyticsDashboard,
  PaymentProvider,
} from "@/lib/backend-analytics"
import { formatCount } from "./format"

/**
 * Colour follows the provider, never its rank, and segments are drawn in
 * this fixed slot order — the adjacency the palette was validated for.
 */
const PROVIDERS: ReadonlyArray<{
  key: PaymentProvider
  label: string
  slot: string
}> = [
  { key: "COD", label: "Cash on delivery", slot: "var(--chart-1)" },
  { key: "BKASH", label: "bKash", slot: "var(--chart-2)" },
  { key: "SSLCOMMERZ", label: "SSLCommerz", slot: "var(--chart-3)" },
  { key: "STRIPE", label: "Card (Stripe)", slot: "var(--chart-4)" },
]

const chartConfig = Object.fromEntries(
  PROVIDERS.map((provider) => [
    provider.key,
    { label: provider.label, color: provider.slot },
  ])
) satisfies ChartConfig

export function PaymentMixChart({
  mix,
}: {
  mix: AnalyticsDashboard["paymentMix"]
}) {
  const byProvider = new Map(mix.map((row) => [row.provider, row]))
  const data = PROVIDERS.map((provider) => ({
    ...provider,
    count: byProvider.get(provider.key)?.count ?? 0,
    amount: Number(byProvider.get(provider.key)?.amount ?? 0),
  }))
  const totalOrders = data.reduce((sum, row) => sum + row.count, 0)

  return (
    <div className="flex h-full flex-col gap-5 rounded-3xl border border-border/70 bg-card p-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">
          Payment methods
        </h2>
        <p className="text-[15px] text-muted-foreground">
          Share of paid orders
        </p>
      </div>

      {totalOrders === 0 ? (
        <p className="flex flex-1 items-center justify-center text-[15px] text-muted-foreground">
          No paid orders in this period.
        </p>
      ) : (
        <>
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square h-52"
          >
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    hideLabel
                    nameKey="key"
                    formatter={(value, _name, item) => (
                      <span className="flex w-full items-center justify-between gap-6">
                        <span className="text-muted-foreground">
                          {(item.payload as { label: string }).label}
                        </span>
                        <span className="font-semibold text-foreground tabular-nums">
                          {formatCount(Number(value))} orders
                        </span>
                      </span>
                    )}
                  />
                }
              />
              <Pie
                data={data.filter((row) => row.count > 0)}
                dataKey="count"
                nameKey="key"
                innerRadius="62%"
                outerRadius="100%"
                stroke="var(--card)"
                strokeWidth={2}
                isAnimationActive={false}
              >
                {data
                  .filter((row) => row.count > 0)
                  .map((row) => (
                    <Cell key={row.key} fill={row.slot} />
                  ))}
                <Label
                  content={({ viewBox }) => {
                    if (!viewBox || !("cx" in viewBox)) return null
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) - 6}
                          className="fill-foreground text-3xl font-semibold"
                        >
                          {formatCount(totalOrders)}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) + 18}
                          className="fill-muted-foreground text-sm"
                        >
                          paid orders
                        </tspan>
                      </text>
                    )
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>

          {/* Legend doubles as the table view: every value is visible as text. */}
          <ul className="space-y-2.5">
            {data.map((row) => {
              const share =
                totalOrders === 0
                  ? 0
                  : Math.round((row.count / totalOrders) * 100)
              return (
                <li
                  key={row.key}
                  className="flex items-center gap-3 text-[15px]"
                >
                  <span
                    className="size-3 shrink-0 rounded-[3px]"
                    style={{ backgroundColor: row.slot }}
                    aria-hidden="true"
                  />
                  <span className="flex-1 text-foreground">{row.label}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {row.count} · {share}%
                  </span>
                  <span className="w-24 text-right font-medium text-foreground tabular-nums">
                    {formatPrice(row.amount)}
                  </span>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}
