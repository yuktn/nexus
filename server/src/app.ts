import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/heartbeat', (req, res) => {
	res.status(200).json({ message: 'GET request received' });
});

app.post('/api/heartbeat', (req, res) => {
	res.status(200).json({
		message: 'POST request received',
		data: req.body,
	});

	console.log(req.body);
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
