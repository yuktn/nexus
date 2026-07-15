"use client"

import { useEffect, useMemo, useState } from "react"
import { ChartLineLinear } from "@/components/ui/chartLineLinear"
import { ChevronDown } from "lucide-react"

type Heartbeat = {
  deviceName: string
  timestamp: string
  currentLoad?: number
}

type HealthState =
  | "healthy"
  | "warning"
  | "critical"
  | "offline"
  | "error"
  | "noDevices"

const OFFLINE_AFTER_MS = 10_000

function getLatest(history: Heartbeat[]) {
  return history.at(-1)
}

function getLoad(history: Heartbeat[]) {
  return getLatest(history)?.currentLoad
}

function isOffline(history: Heartbeat[]) {
  const timestamp = getLatest(history)?.timestamp

  if (!timestamp) return true

  const lastHeartbeat = new Date(timestamp).getTime()

  if (Number.isNaN(lastHeartbeat)) return true

  return Date.now() - lastHeartbeat > OFFLINE_AFTER_MS
}

function getState(history: Heartbeat[]): HealthState {
  if (isOffline(history)) return "offline"

  const load = getLoad(history)

  if (typeof load !== "number") return "error"
  if (load >= 80) return "critical"
  if (load >= 50) return "warning"

  return "healthy"
}

function getDeviceName(history: Heartbeat[]) {
  return history.at(-1)?.deviceName ?? history[0]?.deviceName
}

const healthStyles = {
  healthy: {
    color: "#16a36a",
    background: "bg-gradient-to-b from-emerald-100 to-emerald-50",
    cardBackground: "bg-white",
    label: "healthy",
  },
  warning: {
    color: "#ca8a04",
    background: "bg-gradient-to-b from-amber-100 to-amber-50",
    cardBackground: "bg-white",
    label: "degraded",
  },
  critical: {
    color: "#dc2626",
    background: "bg-gradient-to-b from-red-100 to-red-50",
    cardBackground: "bg-white",
    label: "critical",
  },
  offline: {
    color: "#a9a1aa",
    background: "bg-gradient-to-b from-zinc-200 to-zinc-100",
    cardBackground: "bg-zinc-50",
    label: "offline",
  },
  error: {
    color: "#dc2626",
    background: "bg-gradient-to-b from-red-100 to-red-50",
    cardBackground: "bg-white",
    label: "error",
  },
  noDevices: {
    color: "#b7b7b7",
    background: "bg-gradient-to-b from-gray-100 to-gray-50",
    cardBackground: "bg-white",
    label: "no devices",
  },
}

export default function Home() {
  const [heartbeats, setHeartbeats] = useState<Heartbeat[][]>([])
  const [openCards, setOpenCards] = useState<Set<string>>(new Set())
  const [fetchError, setFetchError] = useState(false)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/backend/heartbeat", {
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const result = await response.json()

        const nextHeartbeats: Heartbeat[][] = Array.isArray(result.data)
          ? result.data.filter(
              (history: unknown): history is Heartbeat[] =>
                Array.isArray(history) && history.length > 0
            )
          : []

        const activeDeviceNames = new Set(
          nextHeartbeats
            .map(getDeviceName)
            .filter((deviceName): deviceName is string => Boolean(deviceName))
        )

        setHeartbeats(nextHeartbeats)

        setOpenCards((current) => {
          const next = new Set<string>()

          current.forEach((deviceName) => {
            if (activeDeviceNames.has(deviceName)) {
              next.add(deviceName)
            }
          })

          return next
        })

        setFetchError(false)
      } catch (error) {
        console.error("Failed to fetch heartbeats:", error)
        setFetchError(true)
      }
    }

    fetchStatus()

    const interval = window.setInterval(fetchStatus, 3000)

    return () => window.clearInterval(interval)
  }, [])

  const devices = useMemo(() => heartbeats, [heartbeats])

  const overallState = useMemo<HealthState>(() => {
    if (fetchError) return "error"

    if (devices.length === 0) return "noDevices"

    const states = devices.map(getState)

    if (states.includes("critical")) return "critical"
    if (states.includes("error")) return "error"
    if (states.includes("warning")) return "warning"

    const offlineDevices = states.filter(
      (state) => state === "offline"
    ).length

    if (offlineDevices === devices.length) return "offline"
    if (offlineDevices > 0) return "warning"

    return "healthy"
  }, [devices, fetchError])

  const overallStyle = healthStyles[overallState]

  const toggleCard = (deviceName: string) => {
    setOpenCards((current) => {
      const next = new Set(current)

      if (next.has(deviceName)) {
        next.delete(deviceName)
      } else {
        next.add(deviceName)
      }

      return next
    })
  }

  return (
    <div
      className={`min-h-screen px-4 py-16 font-sans transition-colors duration-500 ${overallStyle.background}`}
    >
      <main className="mx-auto w-full max-w-3xl overflow-auto scrollbar-none">
        <header className="mb-12">
          <h1 className="text-5xl font-bold tracking-tight text-gray-800 sm:text-7xl">
            {overallStyle.label}
          </h1>
        </header>

        <div className="grid gap-3">
          {devices.map((deviceHistory, index) => {
            const latest = getLatest(deviceHistory)

            const deviceName =
              latest?.deviceName ??
              deviceHistory[0]?.deviceName ??
              `Agent ${index + 1}`

            const currentLoad = latest?.currentLoad
            const state = getState(deviceHistory)
            const style = healthStyles[state]
            const isOpen = openCards.has(deviceName)
            const offline = state === "offline"

            return (
              <section
                key={deviceName}
                className={`overflow-hidden rounded-2xl border border-zinc-200 shadow-sm transition-colors duration-300 ${style.cardBackground}`}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => toggleCard(deviceName)}
                  className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left outline-none transition-colors hover:bg-zinc-100/60 focus-visible:bg-zinc-100/60"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: style.color }}
                    />

                    <div className="flex min-w-0 items-center gap-3">
                      <h2
                        className={`truncate text-sm font-semibold ${
                          offline ? "text-zinc-500" : "text-zinc-900"
                        }`}
                      >
                        {deviceName}
                      </h2>

                      {offline && (
                        <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-500">
                          offline
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {offline ? (
                      <span className="min-w-16 text-right text-sm font-semibold text-zinc-400">
                        --%
                      </span>
                    ) : (
                      <span className="min-w-16 text-right text-2xl font-bold tabular-nums tracking-tight text-zinc-900">
                        {typeof currentLoad === "number"
                          ? Math.round(currentLoad)
                          : "—"}

                        <small className="ml-1 text-xs font-normal text-zinc-400">
                          %
                        </small>
                      </span>
                    )}

                    <span
                      className={`text-xl text-zinc-400 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    >
                      <ChevronDown />
                    </span>
                  </div>
                </button>

                <div
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="border-t border-zinc-100 px-4 py-5 sm:px-5">
                      <ChartLineLinear
                        deviceHistory={deviceHistory}
                        className="w-full border-0 shadow-none"
                        color={style.color}
                        compact
                      />
                    </div>
                  </div>
                </div>
              </section>
            )
          })}
        </div>
      </main>
    </div>
  )
}