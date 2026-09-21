import type * as React from "react"
import type * as RechartsPrimitive from "recharts"
import type { TooltipValueType } from "recharts"
import type { Button as ButtonPrimitive } from "@base-ui/react/button"
import type { VariantProps } from "class-variance-authority"
import type { Heartbeat } from "@nexus/shared/types/heartbeat"

export type ChartTheme = "light" | "dark"
export type TooltipNameType = number | string

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<ChartTheme, string> }
  )
>

export type ChartContextProps = {
  config: ChartConfig
}

export type ChartContainerProps = React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"]
  initialDimension?: {
    width: number
    height: number
  }
}

export type ChartStyleProps = { id: string; config: ChartConfig }

export type ChartTooltipContentProps = React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
  React.ComponentProps<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    nameKey?: string
    labelKey?: string
  } & Omit<
    RechartsPrimitive.DefaultTooltipContentProps<
      TooltipValueType,
      TooltipNameType
    >,
    "accessibilityLayer"
  >

export type ChartLegendContentProps = React.ComponentProps<"div"> & {
  hideIcon?: boolean
  nameKey?: string
} & RechartsPrimitive.DefaultLegendContentProps

export interface ChartLineLinearProps {
  deviceHistory: Heartbeat[]
  className?: string
  color?: string
  compact?: boolean
}

export type CardProps = React.ComponentProps<"div"> & {
  size?: "default" | "sm"
}

// Preserve inference from the component's actual CVA variants.
export type ButtonProps<TVariants extends (...args: never[]) => unknown> =
  ButtonPrimitive.Props & VariantProps<TVariants>

export interface RootLayoutProps {
  params: Promise<Record<string, string | string[] | undefined>>
  children: React.ReactNode
}
