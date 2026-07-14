'use client'
import Image from "next/image";
import { ChartLineLinear } from "@/components/ui/chartLineLinear";
import { useEffect, useState } from "react";

type Heartbeat = {
  deviceName: string;
  timestamp: string;
  currentLoad?: number;
}

export default function Home() {

  const [heartbeats, setHeartbeats] = useState<Heartbeat[][]>([])

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/backend/heartbeat')

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const result = await response.json()

        setHeartbeats(result.data)
      } catch (error) {
        console.error('Failed to fetch heartbeats:', error)
      }
    }

    fetchStatus()

    const interval = setInterval(fetchStatus, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="grid gap-4">
          {heartbeats.map((deviceHistory) => {
            const deviceName = deviceHistory[0]?.deviceName
            const currentLoad = deviceHistory[deviceHistory.length - 1]?.currentLoad

            const color =
              typeof currentLoad === 'number'
                ? currentLoad < 50
                  ? '#22c55e'
                  : currentLoad < 80
                    ? '#eab308'
                    : '#ef4444'
                : '#22c55e'

            if (!deviceName) return null

            return (
              <ChartLineLinear
                deviceHistory={deviceHistory}
                className="min-w-2xl max-w-2xl"
                key={deviceName}
                color={color}
              />
            )
          })}
        </div>
      </main>
    </div>
  );
}
