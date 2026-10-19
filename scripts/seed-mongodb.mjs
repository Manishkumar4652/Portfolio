import { MongoClient } from "mongodb";
import dns from "dns";
import fs from "fs";
import path from "path";
import crypto from "crypto";

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {}

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

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not found!");
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "portfolio");

  console.log("Connected to MongoDB:", db.databaseName);

  // 1. Seed Certificates if empty
  const certCollection = db.collection("certificates");
  const count = await certCollection.countDocuments();
  console.log("Current certificates count in DB:", count);

  if (count === 0) {
    const initialCertificates = [
      {
        id: "cert-nptel-python",
        title: "The Joy of Computing using Python",
        issuer: "NPTEL / SWAYAM",
        description: "Verified course completion and algorithmic problem solving using Python.",
        category: "Programming & Computer Science",
        issueDate: "Verified Course Completion",
        publicId: null,
        secureUrl: null,
        resourceType: null,
        featured: true,
        displayOrder: 1,
        skills: ["Python", "Algorithms", "Problem Solving", "Data Processing"],
        verificationUrl: null,
        credentialId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "cert-excelr-dsa",
        title: "DSA for Product-Based Companies",
        issuer: "ExcelR",
        description: "Comprehensive data structures, algorithmic design patterns, and system optimization.",
        category: "Data Structures & Algorithms",
        issueDate: "Verified Course Completion",
        publicId: null,
        secureUrl: null,
        resourceType: null,
        featured: true,
        displayOrder: 2,
        skills: ["Data Structures", "Algorithms", "System Optimization", "Problem Solving"],
        verificationUrl: null,
        credentialId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "cert-google-prompting",
        title: "Google Prompting Essentials",
        issuer: "Google",
        description: "Prompt engineering techniques, multimodal prompting, and generative AI workflow integration.",
        category: "Artificial Intelligence & Tools",
        issueDate: "Verified Course Completion",
        publicId: null,
        secureUrl: null,
        resourceType: null,
        featured: true,
        displayOrder: 3,
        skills: ["Prompt Engineering", "Large Language Models", "AI Workflow Integration"],
        verificationUrl: null,
        credentialId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await certCollection.insertMany(initialCertificates);
    console.log(`✅ Successfully seeded ${initialCertificates.length} certificates.`);
  }

  // 2. Setup Admin User if ADMIN_PASSWORD is set
  const adminEmail = (process.env.ADMIN_EMAILS || "").split(",")[0]?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    const usersCollection = db.collection("admin_users");
    const existingAdmin = await usersCollection.findOne({ email: adminEmail });

    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = crypto.pbkdf2Sync(adminPassword, salt, 100000, 64, "sha512").toString("hex");

    if (!existingAdmin) {
      await usersCollection.insertOne({
        email: adminEmail,
        passwordHash,
        salt,
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`✅ Provisioned initial admin user: ${adminEmail}`);
    } else {
      await usersCollection.updateOne(
        { email: adminEmail },
        { $set: { passwordHash, salt, updatedAt: new Date() } }
      );
      console.log(`✅ Updated password hash for admin user: ${adminEmail}`);
    }
  }

  // Create useful indexes
  await certCollection.createIndex({ displayOrder: 1 });
  await certCollection.createIndex({ featured: 1 });
  await certCollection.createIndex({ category: 1 });
  await db.collection("admin_users").createIndex({ email: 1 }, { unique: true });
  await db.collection("admin_sessions").createIndex({ sessionId: 1 });
  await db.collection("admin_sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

  console.log("✅ Indexes created.");
  await client.close();
}

seed().catch(console.error);
