import 'dotenv/config';
import si, { currentLoad } from 'systeminformation';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const interval = process.env.HEARTBEAT_MS ? parseInt(process.env.HEARTBEAT_MS) : 2000;

async function getSystemLoad() {
    const load = await si.currentLoad();

    return {
        currentLoad: load.currentLoad,
    };
}

async function mainLoop() {
  while (true) {
    try {
      await sendHeartbeatLoop(); 
      
      console.log("Task complete");
    } catch (e) {
      console.log(e);
    }
    await sleep(interval); 
  }
}


async function sendHeartbeatLoop() {

    const currentLoad = await getSystemLoad();
    let status: string;

    if (currentLoad.currentLoad < 50) {
        status = 'HEALTHY';
    } else if (currentLoad.currentLoad < 101) {
        status = 'HIGH_LOAD';
    } else {
        status = 'UNKNOWN';
    }

    const payload = {
        deviceName: process.env?.AGENT_NAME ?? 'Unknown Device',
        timestamp: new Date().toISOString(),
        status, //HEALTHY, HIGH_LOAD, DOWN, UNKNOWN
    };

    const url = `${process.env.HOST_URL}:${process.env.PORT}/api/heartbeat`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            console.log(`${response.status} ${response.statusText}`);
        }

    } catch (e) {
        console.log(e);
    }
}



mainLoop();