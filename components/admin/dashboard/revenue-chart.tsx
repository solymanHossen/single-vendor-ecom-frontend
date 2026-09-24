"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatPrice } from "@/lib/format"
import type { AnalyticsDashboard } from "@/lib/backend-analytics"
import { cn } from "@/lib/utils"
import { compactTaka, formatCount, shortDate } from "./format"

type MetricKey = "revenue" | "orders"
type View = "chart" | "table"

// One series at a time → categorical slot 1, no legend (the toggle names it).
const chartConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  orders: { label: "Orders", color: "var(--chart-1)" },
} satisfies ChartConfig

function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T
  options: Array<{ value: T; label: string }>
  onChange: (value: T) => void
  label: string
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex rounded-xl bg-muted p-1"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "h-8 rounded-lg px-3.5 text-sm font-medium transition-colors duration-150",
            value === option.value
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function RevenueChart({
  daily,
}: {
  daily: AnalyticsDashboard["daily"]
}) {
  const [metric, setMetric] = React.useState<MetricKey>("revenue")
  const [view, setView] = React.useState<View>("chart")

  const data = React.useMemo(
    () =>
      daily.map((day) => ({
        date: day.date,
        revenue: Number(day.revenue),
        orders: day.orders,
      })),
    [daily]
  )

  const total = data.reduce((sum, day) => sum + day[metric], 0)
  const best = data.reduce(
    (top, day) => (day[metric] > top[metric] ? day : top),
    data[0] ?? { date: "", revenue: 0, orders: 0 }
  )
  const format = (value: number) =>
    metric === "revenue" ? formatPrice(value) : formatCount(value)

  return (
    <div className="flex h-full flex-col gap-6 rounded-3xl border border-border/70 bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">
            {metric === "revenue" ? "Revenue" : "Orders"} over time
          </h2>
          <p className="text-[15px] text-muted-foreground">
            <span className="font-semibold text-foreground">
              {format(total)}
            </span>{" "}
            total
            {best && best[metric] > 0 && (
              <>
                {" "}
                · best day {shortDate(best.date)} ({format(best[metric])})
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            label="Metric"
            value={metric}
            onChange={setMetric}
            options={[
              { value: "revenue", label: "Revenue" },
              { value: "orders", label: "Orders" },
            ]}
          />
          <Segmented
            label="View"
            value={view}
            onChange={setView}
            options={[
              { value: "chart", label: "Chart" },
              { value: "table", label: "Table" },
            ]}
          />
        </div>
      </div>

      {view === "chart" ? (
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-72 w-full"
        >
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="var(--border)"
              strokeOpacity={0.7}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              minTickGap={32}
              tickFormatter={shortDate}
              className="text-xs"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={56}
              tickMargin={6}
              allowDecimals={false}
              tickFormatter={(value: number) =>
                metric === "revenue" ? compactTaka(value) : formatCount(value)
              }
              className="text-xs"
            />
            <ChartTooltip
              cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
              content={
                <ChartTooltipContent
                  indicator="line"
                  hideLabel
                  formatter={(value, _name, item) => (
                    <span className="flex w-full flex-col gap-1">
                      <span className="font-medium text-foreground">
                        {shortDate((item.payload as { date: string }).date)}
                      </span>
                      <span className="flex items-center justify-between gap-6">
                        <span className="text-muted-foreground">
                          {metric === "revenue" ? "Revenue" : "Orders"}
                        </span>
                        <span className="font-semibold text-foreground tabular-nums">
                          {format(Number(value))}
                        </span>
                      </span>
                    </span>
                  )}
                />
              }
            />
            <Area
              dataKey={metric}
              type="monotone"
              stroke={`var(--color-${metric})`}
              strokeWidth={2}
              fill={`var(--color-${metric})`}
              fillOpacity={0.1}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ChartContainer>
      ) : (
        <div className="max-h-72 overflow-y-auto rounded-2xl border border-border/70">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow>
                <TableHead>Day</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Orders</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...data].reverse().map((day) => (
                <TableRow key={day.date}>
                  <TableCell>{shortDate(day.date)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatPrice(day.revenue)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {day.orders}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
