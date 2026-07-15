"use client"

import { useEffect, useId, useState } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

type Heartbeat = {
  deviceName: string
  currentLoad?: number
  timestamp?: string
}

type ChartLineLinearProps = {
  deviceHistory: Heartbeat[]
  className?: string
  color?: string
  compact?: boolean
}

const WINDOW_MS = 30_000

function formatTime(timestamp: number, includeHour = false) {
  const date = new Date(timestamp)

  if (Number.isNaN(date.getTime())) {
    return "--"
  }

  return date.toLocaleTimeString([], {
    ...(includeHour ? { hour: "2-digit" as const } : {}),
    minute: "2-digit",
    second: "2-digit",
  })
}

export function ChartLineLinear({
  deviceHistory,
  className,
  color = "var(--chart-1)",
  compact = false,
}: ChartLineLinearProps) {
  const gradientId = useId().replaceAll(":", "")

  // Forces the card to update even when heartbeats stop arriving.
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    const updateNow = () => setNow(Date.now())

    updateNow()

    const interval = window.setInterval(updateNow, 1000)

    return () => window.clearInterval(interval)
  }, [])

  const deviceName =
    deviceHistory.at(-1)?.deviceName ??
    deviceHistory[0]?.deviceName ??
    "Unknown device"

  const chartConfig = {
    load: {
      label: "CPU Load",
      color,
    },
  } satisfies ChartConfig

  const allChartData = deviceHistory
    .filter(
      (
        heartbeat
      ): heartbeat is Heartbeat & {
        timestamp: string
      } => Boolean(heartbeat.timestamp)
    )
    .map((heartbeat) => ({
      time: new Date(heartbeat.timestamp).getTime(),
      load: heartbeat.currentLoad ?? null,
    }))
    .filter((heartbeat) => Number.isFinite(heartbeat.time))
    .sort((a, b) => a.time - b.time)

  const latestHeartbeat = allChartData.at(-1)
  const latestTimestamp = latestHeartbeat?.time

  const windowEnd = now ?? latestTimestamp ?? 0
  const windowStart = windowEnd - WINDOW_MS

  const isOnline =
    now !== null &&
    latestTimestamp !== undefined &&
    now - latestTimestamp <= WINDOW_MS

  const currentLoad =
    isOnline && typeof latestHeartbeat?.load === "number"
      ? latestHeartbeat.load
      : undefined

  const chartData = allChartData.filter(
    (heartbeat) =>
      heartbeat.time >= windowStart &&
      heartbeat.time <= windowEnd
  )

  return (
  <Card className={cn("overflow-hidden", className)}>
    {!compact && (
      <CardHeader className="space-y-5 border-b pb-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2">
            <span
              title={isOnline ? "Online" : "Offline"}
              aria-label={isOnline ? "Online" : "Offline"}
              className={cn(
                "size-2 shrink-0 rounded-full transition-opacity",
                isOnline ? "opacity-100" : "opacity-25"
              )}
              style={{ backgroundColor: color }}
            />

            <CardTitle className="truncate text-lg font-semibold tracking-tight">
              {deviceName}
            </CardTitle>
          </div>
        </div>

        <div className="flex items-end gap-1.5">
          <span
            className={cn(
              "text-5xl font-bold leading-none tracking-tighter tabular-nums sm:text-6xl",
              !isOnline && "text-muted-foreground"
            )}
          >
            {typeof currentLoad === "number"
              ? currentLoad.toFixed(1)
              : "--"}
          </span>

          <span className="pb-1 text-2xl font-medium leading-none text-muted-foreground">
            %
          </span>
        </div>
      </CardHeader>
    )}

    <CardContent className={cn(compact ? "p-0" : "pt-6")}>
              {chartData.length === 0 ? (
          <div className="flex h-[240px] items-center justify-center">
            <p className="text-sm text-muted-foreground">
              {latestTimestamp ? "Device offline" : "No heartbeat data"}
            </p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="h-[240px] w-full"
          >
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{
                top: 8,
                right: 12,
                bottom: 0,
                left: 0,
              }}
            >
              <defs>
                <linearGradient
                  id={gradientId}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--color-load)"
                    stopOpacity={0.4}
                  />

                  <stop
                    offset="95%"
                    stopColor="var(--color-load)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} />

              <XAxis
                dataKey="time"
                type="number"
                scale="time"
                domain={[windowStart, windowEnd]}
                allowDataOverflow
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
                tickFormatter={(value) =>
                  formatTime(Number(value))
                }
              />

              <YAxis
                width={42}
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
              />

              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) => {
                      const timestamp =
                        payload?.[0]?.payload?.time

                      return typeof timestamp === "number"
                        ? formatTime(timestamp, true)
                        : "--"
                    }}
                    formatter={(value) =>
                      `${Number(value).toFixed(2)}%`
                    }
                  />
                }
              />

              <Area
                dataKey="load"
                type="linear"
                stroke="var(--color-load)"
                fill={`url(#${gradientId})`}
                strokeWidth={2}
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
            </AreaChart>
          </ChartContainer>
        )}
    </CardContent>
  </Card>
)
}