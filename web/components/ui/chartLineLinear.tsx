"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
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
}

export function ChartLineLinear({
  deviceHistory,
  className,
  color = "var(--chart-1)",
}: ChartLineLinearProps) {
  const deviceName = deviceHistory[0]?.deviceName ?? "Unknown device"

  const chartConfig = {
    load: {
      label: "CPU Load",
      color,
    },
  } satisfies ChartConfig

  const WINDOW_MS = 30_000

  const allChartData = deviceHistory
    .filter((heartbeat) => heartbeat.timestamp)
    .map((heartbeat) => ({
      time: new Date(heartbeat.timestamp!).getTime(),
      load: heartbeat.currentLoad ?? null,
    }))
    .sort((a, b) => a.time - b.time)

  const windowEnd =
    allChartData.at(-1)?.time ?? Date.now()

  const windowStart = windowEnd - WINDOW_MS

  const chartData = allChartData.filter(
    (heartbeat) => heartbeat.time >= windowStart
  )

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>{deviceName}</CardTitle>
        <CardDescription>CPU load history</CardDescription>
      </CardHeader>

      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No heartbeat data found
          </p>
        ) : (
          <ChartContainer config={chartConfig}>
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />

              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />

              <YAxis
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
              />

              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value) => `${Number(value).toFixed(2)}%`}
                  />
                }
              />

              <Line
                dataKey="load"
                type="linear"
                stroke="var(--color-load)"
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}