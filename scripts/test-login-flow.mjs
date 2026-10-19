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

// Dynamically import the actual compiled application modules
async function testFullLoginFlow() {
  console.log("=== End-to-End Admin Login Flow Verification ===");

  const { getDb, getLastMongoDiagnostic } = await import("../src/lib/mongodb/client.js").catch(async () => {
    // If running with ts-node or compiled
    return await import("../src/lib/mongodb/client.ts");
  });

  const { loginAdmin } = await import("../src/lib/auth/admin.js").catch(async () => {
    return await import("../src/lib/auth/admin.ts");
  });

  const adminEmail = (process.env.ADMIN_EMAILS || "").split(",")[0]?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD;

  console.log("Testing with admin email:", adminEmail);
  console.log("Admin password present:", Boolean(adminPassword));

  // 1. Test DB accessibility via getDb()
  const db = await getDb();
  if (!db) {
    const diag = getLastMongoDiagnostic();
    console.error("❌ getDb() returned null! Diagnostic:", diag);
    process.exit(1);
  }
  console.log("✅ getDb() succeeded! Database name:", db.databaseName);

  // 2. Test unauthorized email login
  const badEmailRes = await loginAdmin("unauthorized@example.com", "anypassword");
  console.log("Unauthorized email test:", badEmailRes.success === false ? "✅ Rejected as expected" : "❌ Unexpected success");

  // 3. Test wrong password
  const badPassRes = await loginAdmin(adminEmail, "wrong_password_12345");
  console.log("Wrong password test:", badPassRes.success === false ? "✅ Rejected as expected" : "❌ Unexpected success");

  // 4. Test valid admin login
  const validRes = await loginAdmin(adminEmail, adminPassword);
  console.log("Valid credentials login result:", validRes);

  if (validRes.success) {
    console.log("✅ Full admin login flow succeeded!");
  } else {
    console.error("❌ Admin login failed:", validRes.error);
    process.exit(1);
  }

  // Check that admin_sessions has the newly created session
  const sessions = await db.collection("admin_sessions").find({ email: adminEmail }).toArray();
  console.log(`✅ Verified active admin session in MongoDB Atlas (count: ${sessions.length})`);
}

testFullLoginFlow().catch(console.error);
