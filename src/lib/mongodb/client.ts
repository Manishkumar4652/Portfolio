import { MongoClient, type Db } from "mongodb";
import dns from "dns";
import { isMongoConfigured } from "./config";

/**
 * Configure reliable DNS servers (Google 8.8.8.8 / Cloudflare 1.1.1.1).
 * Essential on Windows and local router setups where default DNS fails to resolve
 * MongoDB Atlas SRV records (_mongodb._tcp...) with querySrv ECONNREFUSED.
 */
export function ensureMongoDns(): void {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  } catch (err) {
    console.warn("[MongoDB] Notice: unable to set custom DNS servers:", err instanceof Error ? err.message : String(err));
  }
}

// Run DNS configuration immediately at module load
ensureMongoDns();

declare global {
  // Allow global caching across HMR in development to prevent connection exhaustion
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export interface MongoDiagnosticInfo {
  category: "DNS_ERROR" | "AUTH_ERROR" | "TIMEOUT_ERROR" | "CONFIG_ERROR" | "UNKNOWN_ERROR";
  message: string;
  code?: string;
  timestamp: string;
}

let lastDiagnostic: MongoDiagnosticInfo | null = null;

export function getLastMongoDiagnostic(): MongoDiagnosticInfo | null {
  return lastDiagnostic;
}

/**
 * Sanitizes and categorizes MongoDB errors without leaking passwords or private URIs
 */
function recordDiagnostic(err: unknown): MongoDiagnosticInfo {
  const errorObj = err as { code?: string; message?: string; name?: string; syscall?: string };
  const rawMsg = errorObj?.message || String(err);
  const code = errorObj?.code;

  let category: MongoDiagnosticInfo["category"] = "UNKNOWN_ERROR";
  let safeMessage = "An unexpected error occurred while connecting to MongoDB Atlas.";

  if (code === "ECONNREFUSED" || errorObj?.syscall === "querySrv" || rawMsg.includes("querySrv")) {
    category = "DNS_ERROR";
    safeMessage = "DNS SRV record resolution failed. Check network access or DNS settings for MongoDB Atlas cluster.";
  } else if (rawMsg.includes("Authentication failed") || rawMsg.includes("auth error") || code === "ETIMEDOUT") {
    category = "AUTH_ERROR";
    safeMessage = "MongoDB Atlas authentication failed. Verify database username and password in MONGODB_URI.";
  } else if (errorObj?.name === "MongoServerSelectionError" || rawMsg.includes("Server selection timed out")) {
    category = "TIMEOUT_ERROR";
    safeMessage = "MongoDB cluster selection timed out. Ensure MongoDB Atlas Network Access allowlist includes your IP (or 0.0.0.0/0).";
  }

  const diag: MongoDiagnosticInfo = {
    category,
    message: safeMessage,
    code,
    timestamp: new Date().toISOString(),
  };

  lastDiagnostic = diag;
  console.error(`[MongoDB Diagnostic] Category: ${diag.category} | Code: ${diag.code || "N/A"} | Detail: ${diag.message}`);
  return diag;
}

/**
 * Returns the cached MongoDB client promise, or creates a new connection lazily.
 * Automatically clears cached promise on failure so subsequent requests can retry.
 */
export async function getMongoClient(): Promise<MongoClient | null> {
  const uri = process.env.MONGODB_URI;

  if (!isMongoConfigured() || !uri) {
    lastDiagnostic = {
      category: "CONFIG_ERROR",
      message: "MONGODB_URI is missing or unconfigured.",
      timestamp: new Date().toISOString(),
    };
    return null;
  }

  // Ensure DNS resolvers are configured before each connection attempt
  ensureMongoDns();

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 6000,
        maxPoolSize: 10,
      });

      const connectPromise = client.connect();

      // IMPORTANT: If connection fails, clear the global promise cache
      // so subsequent requests can retry rather than staying permanently failed.
      global._mongoClientPromise = connectPromise.catch((err) => {
        global._mongoClientPromise = undefined;
        recordDiagnostic(err);
        throw err;
      });
    }

    try {
      return await global._mongoClientPromise;
    } catch {
      return null;
    }
  } else {
    // Production: standard connection with lazy caching
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 6000,
        maxPoolSize: 10,
      });
      global._mongoClientPromise = client.connect().catch((err) => {
        global._mongoClientPromise = undefined;
        recordDiagnostic(err);
        throw err;
      });
    }

    try {
      return await global._mongoClientPromise;
    } catch {
      return null;
    }
  }
}

/**
 * Retrieves the portfolio database instance.
 */
export async function getDb(): Promise<Db | null> {
  const dbName = process.env.MONGODB_DB || "portfolio";
  const connectedClient = await getMongoClient();
  if (!connectedClient) return null;
  return connectedClient.db(dbName);
}
