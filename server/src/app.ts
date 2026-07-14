import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

let heartbeats = new Array();

app.use(cors());
app.use(express.json());

app.get('/api/heartbeat', (req, res) => {
	res.status(200).json({
		message: 'GET request received',
		data: heartbeats
	});
});

app.post('/api/heartbeat', (req, res) => {
	const body = req.body
	const existingHeartbeat = heartbeats.find(item => item.deviceName === body.deviceName)
	if (existingHeartbeat) {
		Object.assign(existingHeartbeat, body)
	} else {
		heartbeats.push(body)
	}

	res.status(200).json({
		message: 'POST request received',
		data: req.body,
	});
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
