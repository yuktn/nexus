"use client"

import { useEffect, useMemo, useState } from "react"
import { ChartLineLinear } from "@/components/ui/chartLineLinear"

type Heartbeat = {
  deviceName: string
  timestamp: string
  currentLoad?: number
}

type HealthState = "healthy" | "warning" | "critical" | "error"

const TEST_DEVICE = "Test Environment"
const MAX_HISTORY = 30

function getLoad(history: Heartbeat[]) {
  return history.at(-1)?.currentLoad
}

function getState(load?: number): HealthState {
  if (typeof load !== "number") return "error"
  if (load >= 80) return "critical"
  if (load >= 50) return "warning"
  return "healthy"
}

const healthStyles = {
  healthy: {
    color: "#16a36a",
    background: "bg-emerald-50",
    label: "HEALTHY",
    description: "All agents are operating normally.",
  },
  warning: {
    color: "#ca8a04",
    background: "bg-amber-50",
    label: "DEGRADED",
    description: "One or more agents require attention.",
  },
  critical: {
    color: "#dc2626",
    background: "bg-red-50",
    label: "CRITICAL",
    description: "Critical load detected.",
  },
  error: {
    color: "#dc2626",
    background: "bg-red-50",
    label: "CONNECTION ERROR",
    description: "Agent data is currently unavailable.",
  },
}

export default function Home() {
  const [heartbeats, setHeartbeats] = useState<Heartbeat[][]>([])
  const [testHistory, setTestHistory] = useState<Heartbeat[]>([])
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

        setHeartbeats(
          Array.isArray(result.data)
            ? result.data.filter(Array.isArray)
            : []
        )

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

  useEffect(() => {
    const addTestHeartbeat = () => {
      setTestHistory((history) =>
        [
          ...history,
          {
            deviceName: TEST_DEVICE,
            timestamp: new Date().toISOString(),
            currentLoad: Math.random() * 100,
          },
        ].slice(-MAX_HISTORY)
      )
    }

    addTestHeartbeat()

    const interval = window.setInterval(addTestHeartbeat, 3000)

    return () => window.clearInterval(interval)
  }, [])

  const devices = useMemo(
    () => [...heartbeats, testHistory].filter((history) => history.length > 0),
    [heartbeats, testHistory]
  )

  const overallState = useMemo<HealthState>(() => {
    if (fetchError) return "error"

    const states = devices.map((history) =>
      getState(getLoad(history))
    )

    if (states.includes("critical")) return "critical"
    if (states.includes("warning")) return "warning"
    if (states.includes("error")) return "error"

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
          <h1 className="text-5xl font-bold tracking-tight text-zinc-950 sm:text-7xl">
            {overallStyle.label}
          </h1>
        </header>

        <div className="grid gap-3">
          {devices.map((deviceHistory, index) => {
            const latest = deviceHistory.at(-1)

            const deviceName =
              latest?.deviceName ??
              deviceHistory[0]?.deviceName ??
              `Agent ${index + 1}`

            const currentLoad = latest?.currentLoad
            const state = getState(currentLoad)
            const color = healthStyles[state].color
            const isOpen = openCards.has(deviceName)

            return (
              <section
                key={deviceName}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => toggleCard(deviceName)}
                  className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left outline-none transition-colors hover:bg-zinc-50 focus-visible:bg-zinc-50"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: color }}
                    />

                    <h2 className="truncate text-sm font-semibold text-zinc-900">
                      {deviceName}
                    </h2>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="min-w-16 text-right text-2xl font-bold tabular-nums tracking-tight text-zinc-900">
                      {typeof currentLoad === "number"
                        ? Math.round(currentLoad)
                        : "—"}

                      <small className="ml-1 text-xs font-normal text-zinc-400">
                        %
                      </small>
                    </span>

                    <span
                      className={`text-xl text-zinc-400 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    >
                      ⌄
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
                    <div className="border-t border-zinc-100 p-4 sm:p-5">
                      <ChartLineLinear
                        deviceHistory={deviceHistory}
                        className="w-full border-0 shadow-none"
                        color={color}
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