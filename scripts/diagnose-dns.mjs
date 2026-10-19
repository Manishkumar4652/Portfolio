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

console.log("Default DNS servers:", dns.getServers());

// Test 1: Resolve SRV with default servers
console.log("\n--- Test 1: SRV resolution with default DNS ---");
dns.resolveSrv("_mongodb._tcp.cluster0.vhex2jc.mongodb.net", (err, addresses) => {
  if (err) {
    console.error("Default DNS SRV resolution failed:", err.code, err.message);
  } else {
    console.log("Default DNS SRV resolution succeeded:", addresses);
  }

  // Test 2: Resolve SRV with Google/Cloudflare DNS
  console.log("\n--- Test 2: SRV resolution with 8.8.8.8, 1.1.1.1 ---");
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
    console.log("Updated DNS servers:", dns.getServers());
    dns.resolveSrv("_mongodb._tcp.cluster0.vhex2jc.mongodb.net", (err2, addresses2) => {
      if (err2) {
        console.error("Custom DNS SRV resolution failed:", err2.code, err2.message);
      } else {
        console.log("Custom DNS SRV resolution succeeded:", addresses2);
      }

      // Test 3: Connect to MongoDB with custom DNS
      const client = new MongoClient(process.env.MONGODB_URI);
      client.connect()
        .then(() => {
          console.log("\n--- Test 3: MongoClient connect with custom DNS succeeded! ---");
          return client.close();
        })
        .catch(cErr => {
          console.error("\n--- Test 3: MongoClient connect failed:", cErr.message);
        });
    });
  } catch (setErr) {
    console.error("Failed to set DNS servers:", setErr.message);
  }
});
