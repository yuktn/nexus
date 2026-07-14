import 'dotenv/config';
import si, { currentLoad } from 'systeminformation';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const interval = process.env.HEARTBEAT_MS ? parseInt(process.env.HEARTBEAT_MS) : 2000;

async function getSystemLoad() {
    const load = await si.currentLoad();

    return load.currentLoad;
}

async function mainLoop() {
    while (true) {
        try {
            await sendHeartbeatLoop();
        } catch (e) {
            console.log(e);
        }
        await sleep(interval);
    }
}


async function sendHeartbeatLoop() {

    const currentLoad = await getSystemLoad();

    const payload = {
        deviceName: process.env?.AGENT_NAME ?? 'Unknown Device',
        timestamp: new Date().toISOString(),
        currentLoad: currentLoad,
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