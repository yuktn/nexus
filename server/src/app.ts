import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import verifyBearerToken from './middleware/auth.js'

const app = express();
const port = process.env.PORT || 4000;

type Heartbeat = {
  deviceName: string;
  currentLoad?: number;
  timestamp?: string;
};

const heartbeats: Heartbeat[][] = [];

app.use(cors());
app.use(express.json());

app.get('/api/heartbeat', (req, res) => {
  res.status(200).json({
    message: 'GET request received',
    data: heartbeats
  });
});

app.post('/api/heartbeat', verifyBearerToken, (req, res) => {
  const body = req.body as Heartbeat;

  const heartbeat: Heartbeat = {
    ...body,
    timestamp: body.timestamp ?? new Date().toISOString(),
  };

  const deviceHistory = heartbeats.find(
    history => history[0]?.deviceName === heartbeat.deviceName
  );

  if (deviceHistory) {
    deviceHistory.push(heartbeat);
  } else {
    heartbeats.push([heartbeat]);
  }

  heartbeats.forEach(row => {
    row.forEach(element => {

      if (element.timestamp != undefined) {
        const now = Date.now();

        const targetTime = new Date(element.timestamp).getTime();

        if (isNaN(targetTime)) {
          throw new Error("Invalid timestamp format provided.");
        }

        if (Math.abs(now - targetTime) > 30000) {
          const index = heartbeats.indexOf([element]);

          if (index > -1) {
            heartbeats.splice(index, 1);
          }

          console.log('deleted'+element+'due to age')
        }
      }

    });
  });

  res.status(200).json({
    message: 'Heartbeat saved',
    data: heartbeat,
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
