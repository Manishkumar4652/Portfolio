import { cookies } from "next/headers";
import { connection } from "next/server";
import { unstable_rethrow } from "next/navigation";
import crypto from "crypto";
import { getDb, getLastMongoDiagnostic } from "@/lib/mongodb/client";
import { isAdminConfigured, isMongoConfigured } from "@/lib/mongodb/config";
import type { AdminUserDocument, AdminSessionDocument } from "@/lib/mongodb/types";

const SESSION_COOKIE_NAME = "portfolio_admin_session";
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

export interface AdminVerificationResult {
  isAdmin: boolean;
  user: { email: string } | null;
  error?: string;
}

/**
 * Server-Side Administrator Verification Guard
 * STRICTLY SERVER-SIDE ONLY.
 * 
 * Enforces multi-layer server authorization:
 * 1. Checks that MongoDB and ADMIN_EMAILS are configured.
 * 2. Reads the secure HTTP-only session cookie.
 * 3. Validates session token against active session documents in MongoDB Atlas.
 * 4. Verifies the authenticated session email against the current ADMIN_EMAILS allowlist.
 */
export async function verifyAdminSession(): Promise<AdminVerificationResult> {
  await connection();

  if (!isAdminConfigured()) {
    return {
      isAdmin: false,
      user: null,
      error: "ADMIN_EMAILS allowlist is not configured on the server.",
    };
  }

  if (!isMongoConfigured()) {
    return {
      isAdmin: false,
      user: null,
      error: "MongoDB Atlas is not configured for session verification.",
    };
  }

  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return {
        isAdmin: false,
        user: null,
        error: "No active session cookie found.",
      };
    }

    const db = await getDb();
    if (!db) {
      const diag = getLastMongoDiagnostic();
      return {
        isAdmin: false,
        user: null,
        error: diag?.message
          ? `Database unavailable (${diag.message})`
          : "Database unavailable for session verification.",
      };
    }

    // Lookup session in MongoDB
    const now = new Date();
    const session = await db
      .collection<AdminSessionDocument>("admin_sessions")
      .findOne({
        sessionId: sessionToken,
        expiresAt: { $gt: now },
      });

    if (!session) {
      return {
        isAdmin: false,
        user: null,
        error: "Session has expired or is invalid.",
      };
    }

    // Verify user is in current server allowlist
    const allowedEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 0);

    const sessionEmail = session.email.toLowerCase();
    if (!allowedEmails.includes(sessionEmail)) {
      return {
        isAdmin: false,
        user: null,
        error: `Access Denied: Account '${session.email}' is no longer in the administrator allowlist.`,
      };
    }

    return {
      isAdmin: true,
      user: { email: session.email },
    };
  } catch (error: unknown) {
    unstable_rethrow(error);
    console.error("verifyAdminSession error:", error);
    return {
      isAdmin: false,
      user: null,
      error: "Internal error during session verification.",
    };
  }
}

/**
 * Hash a password using standard Node.js PBKDF2 with a salt
 */
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
}

/**
 * Compare passwords using constant-time buffer equality to protect against timing attacks
 */
function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  const hash = hashPassword(password, salt);
  const hashBuf = Buffer.from(hash, "hex");
  const storedBuf = Buffer.from(storedHash, "hex");
  if (hashBuf.length !== storedBuf.length) return false;
  return crypto.timingSafeEqual(hashBuf, storedBuf);
}

/**
 * Authenticates an administrator with email & password.
 * Establishes a secure HTTP-only session cookie upon success.
 */
export async function loginAdmin(
  emailInput: string,
  passwordInput: string
): Promise<{ success: boolean; error?: string }> {
  const email = emailInput.trim().toLowerCase();
  const password = passwordInput;

  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }

  // 1. Verify against server-side allowlist first
  const allowedEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0);

  if (!allowedEmails.includes(email)) {
    return {
      success: false,
      error: "Access Denied: Email address is not on the administrator allowlist.",
    };
  }

  const db = await getDb();
  if (!db) {
    const diag = getLastMongoDiagnostic();
    const detail = diag?.message ? ` (${diag.message})` : "";
    return {
      success: false,
      error: `Database connection failed${detail}. Please ensure MongoDB Atlas is accessible.`,
    };
  }

  const usersCollection = db.collection<AdminUserDocument>("admin_users");
  const sessionsCollection = db.collection<AdminSessionDocument>("admin_sessions");

  let adminUser = await usersCollection.findOne({ email });

  // If user does not exist in DB yet, check for bootstrap password from ADMIN_PASSWORD env
  if (!adminUser) {
    const envAdminPassword = process.env.ADMIN_PASSWORD;
    if (envAdminPassword && password === envAdminPassword) {
      // Auto-provision initial administrator in DB
      const salt = crypto.randomBytes(16).toString("hex");
      const passwordHash = hashPassword(password, salt);
      const now = new Date();

      const newAdmin: AdminUserDocument = {
        email,
        passwordHash,
        salt,
        role: "admin",
        createdAt: now,
        updatedAt: now,
      };

      const insertResult = await usersCollection.insertOne(newAdmin);
      adminUser = { ...newAdmin, _id: insertResult.insertedId };
    } else {
      return {
        success: false,
        error:
          "Invalid credentials. If this is your first time logging in, configure ADMIN_PASSWORD in .env.local to initialize your account.",
      };
    }
  } else {
    // Verify stored password hash
    const isValid = verifyPassword(password, adminUser.salt, adminUser.passwordHash);
    if (!isValid) {
      // Also allow updating password if ADMIN_PASSWORD in env matches the input
      const envAdminPassword = process.env.ADMIN_PASSWORD;
      if (envAdminPassword && password === envAdminPassword) {
        const newSalt = crypto.randomBytes(16).toString("hex");
        const newHash = hashPassword(password, newSalt);
        await usersCollection.updateOne(
          { email },
          { $set: { passwordHash: newHash, salt: newSalt, updatedAt: new Date() } }
        );
      } else {
        return { success: false, error: "Invalid email or password." };
      }
    }
  }

  // Generate cryptographically secure session identifier
  const sessionId = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

  await sessionsCollection.insertOne({
    sessionId,
    email,
    createdAt: new Date(),
    expiresAt,
  });

  // Set HTTP-only, secure cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });

  return { success: true };
}

/**
 * Logs out the administrator by revoking the session in MongoDB and deleting the cookie.
 */
export async function logoutAdmin(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (sessionToken) {
      const db = await getDb();
      if (db) {
        await db.collection("admin_sessions").deleteOne({ sessionId: sessionToken });
      }
      cookieStore.delete(SESSION_COOKIE_NAME);
    }
  } catch (error) {
    console.error("logoutAdmin error:", error);
  }
}
