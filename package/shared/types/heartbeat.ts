/** Heartbeat accepted from a device before the server stamps its receipt time. */
export interface HeartbeatInput {
  deviceName: string
  currentLoad?: number
  timestamp?: string
}

/** Stored and returned heartbeats always have a server-generated timestamp. */
export interface Heartbeat extends HeartbeatInput {
  timestamp: string
}

export interface HeartbeatsResponse {
  message: string
  data: Heartbeat[][]
}

export interface HeartbeatResponse {
  message: string
  data: Heartbeat
}

export type HealthState =
  | "healthy"
  | "warning"
  | "critical"
  | "offline"
  | "error"
  | "noDevices"
