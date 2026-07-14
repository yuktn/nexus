'use client'
import Image from "next/image";
import { useEffect } from "react";

export default function Home() {

  let heartbeats = new Array();

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/backend/heartbeat')

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const result = await response.json()
        console.log(result.data)
      } catch (error) {
        console.error('Failed to fetch heartbeats:', error)
      }
    }

    fetchStatus()

    const interval = setInterval(fetchStatus, 3000)

    return () => clearInterval(interval)
  }, [])

  let load = 30;

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="text-3xl">
          Current Load = {heartbeats}
        </div>
      </main>
    </div>
  );
}
