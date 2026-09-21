import type { Heartbeat, HeartbeatInput, HeartbeatResponse, HeartbeatsResponse } from "@nexus/shared/types/heartbeat";
import express from 'express';
import 'dotenv/config';
import { connectMongo } from "./db/mongo.js";
import verifyBearerToken from './middleware/auth.js'

const app = express();

const host = process.env.HOST ?? "127.0.0.1"
const port = Number(process.env.PORT ?? 4000)

const heartbeats: Heartbeat[][] = [];

app.use(express.json());

const db = await connectMongo();

app.get('/api/heartbeat', (req, res) => {
  res.status(200).json({
    message: 'GET request received',
    data: heartbeats
  } satisfies HeartbeatsResponse);
});

const HISTORY_WINDOW_MS = 30_000;

function pruneHeartbeats(now = Date.now()) {
  const cutoff = now - HISTORY_WINDOW_MS;

  heartbeats.forEach((history) => {
    const kept = history.filter((heartbeat) => {
      if (!heartbeat.timestamp) return false;

      const timestamp = Date.parse(heartbeat.timestamp);
      return Number.isFinite(timestamp) && timestamp >= cutoff;
    });

    history.splice(0, history.length, ...kept);
  });

  for (let i = heartbeats.length - 1; i >= 0; i--) {
    if (heartbeats[i].length === 0) {
      heartbeats.splice(i, 1);
    }
  }
}

app.post("/api/heartbeat", verifyBearerToken, (req, res) => {
  const body = req.body as HeartbeatInput;

  const heartbeat: Heartbeat = {
    ...body,

    timestamp: new Date().toISOString(),
  };

  let deviceHistory = heartbeats.find(
    (history) => history[0]?.deviceName === heartbeat.deviceName,
  );

  if (!deviceHistory) {
    deviceHistory = [];
    heartbeats.push(deviceHistory);
  }

  deviceHistory.push(heartbeat);

  pruneHeartbeats();

  res.status(201).json({
    message: "Heartbeat received",
    data: heartbeat,
  } satisfies HeartbeatResponse);
});
    

app.listen(port, host, () => {
  console.log(`Server running on port ${port}`);
});
