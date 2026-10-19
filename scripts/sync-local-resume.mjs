import fs from "fs";
import { MongoClient } from "mongodb";

const envContent = fs.readFileSync(".env.local", "utf8");
const match = envContent.match(/MONGODB_URI=(.+)/);
if (!match) {
  console.error("No MONGODB_URI found in .env.local");
  process.exit(1);
}
const uri = match[1].trim();

async function syncResume() {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 6000 });
  try {
    await client.connect();
    const db = client.db("portfolio");
    const collection = db.collection("resumes");

    const stats = fs.statSync("Resume.pdf");

    await collection.updateOne(
      { id: "active_resume" },
      {
        $set: {
          filename: "Manish_Kumar_Resume.pdf",
          cleanFilename: "Manish_Kumar_Resume.pdf",
          secureUrl: "/Resume.pdf",
          format: "pdf",
          bytes: stats.size,
          mimeType: "application/pdf",
          isActive: true,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    console.log("SUCCESS: MongoDB active_resume synchronized with local Resume.pdf (size:", stats.size, "bytes)");
    await client.close();
  } catch (err) {
    console.error("SYNC_ERROR:", err.message);
  }
}

syncResume();
