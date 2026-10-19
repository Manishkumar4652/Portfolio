import dns from "dns";
import { MongoClient } from "mongodb";
import fs from "fs";
import path from "path";

// Read .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        process.env[key] = val;
      }
    }
  }
}

// Simulated client manager with auto-retry on rejection
let cachedPromise = undefined;

function ensureDns() {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  } catch (e) {
    console.error("DNS set error:", e);
  }
}

async function getClient() {
  ensureDns();
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("No MONGODB_URI");

  if (!cachedPromise) {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    const p = client.connect();
    cachedPromise = p.catch((err) => {
      // Clear cache on rejection!
      cachedPromise = undefined;
      throw err;
    });
  }

  return cachedPromise;
}

async function run() {
  console.log("Attempt 1: Normal connection with ensureDns...");
  const c1 = await getClient();
  const ping1 = await c1.db("portfolio").command({ ping: 1 });
  console.log("Ping 1 succeeded:", ping1);

  console.log("\nAttempt 2: Reusing cached client...");
  const c2 = await getClient();
  console.log("c1 === c2:", c1 === c2);
  const ping2 = await c2.db("portfolio").command({ ping: 1 });
  console.log("Ping 2 succeeded:", ping2);

  await c1.close();
  cachedPromise = undefined;
  console.log("\nAttempt 3: Reconnecting after close...");
  const c3 = await getClient();
  const ping3 = await c3.db("portfolio").command({ ping: 1 });
  console.log("Ping 3 succeeded:", ping3);
  await c3.close();
  console.log("\nAll reconnect tests passed!");
}

run().catch(console.error);
