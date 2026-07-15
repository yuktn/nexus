import express from 'express';
import cors from 'cors';

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

app.post('/api/heartbeat', (req, res) => {
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

  res.status(200).json({
    message: 'Heartbeat saved',
    data: heartbeat,
  });
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
