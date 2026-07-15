
# nexus

nexus is a project that lets devices send 'heartbeats' (requests comprised of the name, load, and timestamp) to the main server,  
which are then requested by the web server to be visualized.


## API Reference

#### Upload heartbeat

```http
  POST /api/heartbeat
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `deviceName` | `string` | **Required**. The name of the heartbeat's sender device. |
| `currentLoad` | `number` | Current load of the device (collected by `systeminformation`) |
| `timestamp` | `string` | Time when the heartbeat was sent |

The POST endpoint is guarded by a middleware, that expects a token for authorization.   
Check `server/example.env` and `agent/example.env`. The contents should match in order for the requests to be authorized. 


#### Get the list of heartbeats

```http
  GET /api/heartbeat
```

| Response | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `heartbeats` | `Heartbeat[][]` | **Required**. The name of the heartbeat's sender device. |



**! Heartbeats older than 30 seconds are automatically deleted by the server !**


## Run Locally

Clone the project

```bash
  git clone https://github.com/yuktn/nexus
```

Go to the project directory

```bash
  cd nexus
```

Install dependencies for each machine

```bash
  npm install
```

Fill .env

and finally,

Start the server

```bash
  npm run start
```

