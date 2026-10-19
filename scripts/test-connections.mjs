import { MongoClient } from "mongodb";
import { v2 as cloudinary } from "cloudinary";
import dns from "dns";
import fs from "fs";
import path from "path";

// Set reliable DNS servers (Google / Cloudflare) to ensure SRV records resolve on Windows
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  console.log("DNS setServers note:", e.message);
}

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

async function testConnections() {
  console.log("=== Testing MongoDB Atlas Connection ===");
  const uri = process.env.MONGODB_URI;
  console.log("URI present:", Boolean(uri));

  if (!uri) {
    console.error("MONGODB_URI is not set!");
  } else {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    try {
      await client.connect();
      console.log("✅ Successfully connected to MongoDB Atlas!");
      const db = client.db(process.env.MONGODB_DB || "portfolio");
      const collections = await db.listCollections().toArray();
      console.log("Database:", db.databaseName);
      console.log("Collections:", collections.map(c => c.name));
    } catch (err) {
      console.error("❌ MongoDB connection failed:", err);
    } finally {
      try {
        await client.close();
      } catch {}
    }
  }

  console.log("\n=== Testing Cloudinary Connection ===");
  console.log("Cloud name:", process.env.CLOUDINARY_CLOUD_NAME);
  console.log("API Key present:", Boolean(process.env.CLOUDINARY_API_KEY));
  console.log("API Secret present:", Boolean(process.env.CLOUDINARY_API_SECRET));

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  try {
    const pingResult = await cloudinary.api.ping();
    console.log("✅ Cloudinary ping successful:", pingResult);
  } catch (err) {
    console.error("❌ Cloudinary ping failed:", err);
  }
}

testConnections();
