import { type Collection } from "mongodb";
import { getDb } from "./client";
import { isMongoConfigured } from "./config";
import type { ResumeDocument, ResumeDisplay } from "./types";

const COLLECTION_NAME = "resumes";
let indexesEnsured = false;

/**
 * Connect to MongoDB and return the 'resumes' collection
 */
async function getResumeCollection(): Promise<Collection<ResumeDocument> | null> {
  const db = await getDb();
  if (!db) return null;
  const collection = db.collection<ResumeDocument>(COLLECTION_NAME);

  if (!indexesEnsured) {
    try {
      await collection.createIndex({ id: 1 }, { unique: true });
      await collection.createIndex({ isActive: 1 });
      indexesEnsured = true;
    } catch (err) {
      console.warn("[MongoDB Resumes] Index creation notice:", err);
    }
  }

  return collection;
}

/**
 * Format bytes into human-readable string (KB/MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

/**
 * Maps a MongoDB ResumeDocument to ResumeDisplay
 */
export function mapResumeDocToDisplay(doc: ResumeDocument): ResumeDisplay {
  const uploadDate = doc.createdAt
    ? new Date(doc.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently uploaded";

  const updatedAt = doc.updatedAt
    ? new Date(doc.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : uploadDate;

  return {
    id: doc.id || "active_resume",
    filename: doc.filename || "Manish_Kumar_Resume.pdf",
    fileSizeFormatted: formatFileSize(doc.bytes || 0),
    bytes: doc.bytes || 0,
    uploadDate,
    updatedAt,
    downloadUrl: "/api/resume/download",
    previewUrl: "/api/resume/preview",
    isActive: doc.isActive !== false,
    secureUrl: doc.secureUrl,
  };
}

import fs from "fs";
import path from "path";

/**
 * Retrieves the currently active resume from MongoDB, falling back to local uploaded Resume.pdf
 */
export async function getActiveResume(): Promise<ResumeDisplay | null> {
  if (isMongoConfigured()) {
    try {
      const collection = await getResumeCollection();
      if (collection) {
        const doc = await collection.findOne({
          $or: [{ id: "active_resume" }, { isActive: true }],
        });

        if (doc) return mapResumeDocToDisplay(doc);
      }
    } catch (err) {
      console.error("[MongoDB Resumes] Failed to get active resume:", err);
    }
  }

  // Local static file fallback
  try {
    const publicPdfPath = path.join(process.cwd(), "public", "Resume.pdf");
    if (fs.existsSync(publicPdfPath)) {
      const stats = fs.statSync(publicPdfPath);
      return {
        id: "active_resume",
        filename: "Manish_Kumar_Resume.pdf",
        fileSizeFormatted: formatFileSize(stats.size),
        bytes: stats.size,
        uploadDate: "Oct 2026",
        updatedAt: "Oct 2026",
        downloadUrl: "/api/resume/download",
        previewUrl: "/api/resume/preview",
        isActive: true,
        secureUrl: "/Resume.pdf",
      };
    }
  } catch (fsErr) {
    console.warn("[Local Resume Fallback] Could not check public/Resume.pdf:", fsErr);
  }

  return null;
}

/**
 * Retrieves the raw ResumeDocument for server actions, falling back to local uploaded Resume.pdf
 */
export async function getActiveResumeDoc(): Promise<ResumeDocument | null> {
  if (isMongoConfigured()) {
    try {
      const collection = await getResumeCollection();
      if (collection) {
        const doc = await collection.findOne({
          $or: [{ id: "active_resume" }, { isActive: true }],
        });

        if (doc) return doc;
      }
    } catch (err) {
      console.error("[MongoDB Resumes] Failed to get active resume doc:", err);
    }
  }

  // Local static file fallback
  try {
    const publicPdfPath = path.join(process.cwd(), "public", "Resume.pdf");
    if (fs.existsSync(publicPdfPath)) {
      const stats = fs.statSync(publicPdfPath);
      return {
        id: "active_resume",
        isActive: true,
        filename: "Manish_Kumar_Resume.pdf",
        cleanFilename: "Manish_Kumar_Resume.pdf",
        cloudinaryPublicId: "local_resume",
        secureUrl: "/Resume.pdf",
        resourceType: "raw",
        format: "pdf",
        bytes: stats.size,
        mimeType: "application/pdf",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  } catch (fsErr) {
    console.warn("[Local Resume Fallback] Could not check public/Resume.pdf:", fsErr);
  }

  return null;
}

/**
 * Saves or replaces the active resume in MongoDB.
 * Enforces a single active resume guarantee.
 */
export async function saveActiveResumeInDb(data: {
  filename: string;
  cleanFilename: string;
  cloudinaryPublicId: string;
  secureUrl: string;
  resourceType: "raw" | "image" | "auto";
  format: string;
  bytes: number;
  mimeType: string;
}): Promise<ResumeDisplay> {
  const collection = await getResumeCollection();
  if (!collection) {
    throw new Error("MongoDB database is not available.");
  }

  const now = new Date();
  const doc: ResumeDocument = {
    id: "active_resume",
    isActive: true,
    filename: data.filename,
    cleanFilename: data.cleanFilename,
    cloudinaryPublicId: data.cloudinaryPublicId,
    secureUrl: data.secureUrl,
    resourceType: data.resourceType,
    format: data.format,
    bytes: data.bytes,
    mimeType: data.mimeType,
    createdAt: now,
    updatedAt: now,
  };

  // Upsert the singleton active_resume document
  await collection.updateOne(
    { id: "active_resume" },
    {
      $set: {
        isActive: true,
        filename: data.filename,
        cleanFilename: data.cleanFilename,
        cloudinaryPublicId: data.cloudinaryPublicId,
        secureUrl: data.secureUrl,
        resourceType: data.resourceType,
        format: data.format,
        bytes: data.bytes,
        mimeType: data.mimeType,
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    { upsert: true }
  );

  return mapResumeDocToDisplay(doc);
}

/**
 * Deletes the active resume record from MongoDB.
 * Returns the old Cloudinary public ID for asset cleanup.
 */
export async function deleteActiveResumeFromDb(): Promise<{
  success: boolean;
  oldPublicId?: string;
  error?: string;
}> {
  const collection = await getResumeCollection();
  if (!collection) {
    return { success: false, error: "Database not connected." };
  }

  try {
    const existing = await collection.findOne({
      $or: [{ id: "active_resume" }, { isActive: true }],
    });

    if (!existing) {
      return { success: true };
    }

    const oldPublicId = existing.cloudinaryPublicId;
    await collection.deleteOne({ _id: existing._id });

    return { success: true, oldPublicId };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[MongoDB Resumes] Failed to delete active resume:", errorMsg);
    return { success: false, error: errorMsg };
  }
}
