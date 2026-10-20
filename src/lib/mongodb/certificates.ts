import { ObjectId, type Collection, type Filter } from "mongodb";
import { getDb } from "./client";
import { isMongoConfigured } from "./config";
import { personalData } from "@/data/personal";
import type {
  CertificateDocument,
  CertificateDisplay,
  CertificateCategory,
} from "./types";

const COLLECTION_NAME = "certificates";

export const ALLOWED_CATEGORIES: CertificateCategory[] = [
  "Programming & Computer Science",
  "Data Structures & Algorithms",
  "Artificial Intelligence & Tools",
  "Systems & Tools",
  "Cloud & DevOps",
];

async function getCollection(): Promise<Collection<CertificateDocument> | null> {
  const db = await getDb();
  if (!db) return null;
  return db.collection<CertificateDocument>(COLLECTION_NAME);
}

import { mapLocalToDisplay, getCertificateVisualUrl } from "./shared";
export { mapLocalToDisplay, getCertificateVisualUrl };

/**
 * Maps a MongoDB CertificateDocument to the clean unified display format.
 */
export function mapDocumentToDisplay(doc: CertificateDocument): CertificateDisplay {
  const id = doc.id || doc._id?.toString() || "";
  const isPdf =
    doc.resourceType === "raw" ||
    Boolean(doc.secureUrl?.toLowerCase().includes(".pdf")) ||
    Boolean(doc.secureUrl?.toLowerCase().includes(".ai"));
  const fileType = isPdf ? "pdf" : doc.secureUrl ? "image" : null;

  // Resolve visual preview URL (transforms Cloudinary PDFs, AI, PSD vector documents into crisp PNG images)
  const visualUrl = getCertificateVisualUrl(doc.secureUrl);

  return {
    id,
    title: doc.title,
    issuer: doc.issuer,
    issueDate: doc.issueDate || null,
    category: doc.category,
    skills: doc.skills || [],
    description: doc.description || null,
    filePath: doc.secureUrl || null,
    fileType,
    fileUrl: visualUrl || doc.secureUrl || null,
    previewImageUrl: visualUrl,
    featured: Boolean(doc.featured),
    sortOrder: doc.displayOrder || 0,
    displayOrder: doc.displayOrder || 0,
    verificationUrl: doc.verificationUrl || null,
    credentialId: doc.credentialId || null,
    publicId: doc.publicId || null,
    secureUrl: doc.secureUrl || null,
    resourceType: doc.resourceType || (isPdf ? "raw" : doc.secureUrl ? "image" : null),
    source: "mongodb",
  };
}

/**
 * Automatically seeds initial verified certificates if MongoDB collection is empty.
 * Preserves the 3 verified certificate metadata records without claiming fake images.
 */
async function autoSeedIfEmpty(collection: Collection<CertificateDocument>): Promise<void> {
  try {
    const count = await collection.countDocuments();
    if (count === 0) {
      const now = new Date();
      const initialDocs: CertificateDocument[] = personalData.certificates.map(
        (cert, idx) => ({
          id: cert.id,
          title: cert.title,
          issuer: cert.issuer,
          description: `Coursework accreditation for ${cert.title} issued by ${cert.issuer}.`,
          category: cert.category as CertificateCategory,
          issueDate: cert.issueDate || "Verified Course Completion",
          publicId: null,
          secureUrl: null,
          resourceType: null,
          featured: cert.featured ?? true,
          displayOrder: idx + 1,
          skills: cert.skills || [],
          verificationUrl: cert.verificationUrl || null,
          credentialId: cert.credentialId || null,
          createdAt: now,
          updatedAt: now,
        })
      );
      await collection.insertMany(initialDocs);
      console.log(`[MongoDB] Auto-seeded ${initialDocs.length} verified certificate records.`);
    }
  } catch (err) {
    console.error("[MongoDB] Failed to auto-seed initial certificates:", err);
  }
}

/**
 * Retrieves all certificate records.
 * Queries MongoDB Atlas when configured, falling back to local records on error.
 */
export async function getCertificates(): Promise<CertificateDisplay[]> {
  if (!isMongoConfigured()) {
    return mapLocalToDisplay();
  }

  try {
    const collection = await getCollection();
    if (!collection) {
      return mapLocalToDisplay();
    }

    await autoSeedIfEmpty(collection);

    const docs = await collection
      .find({})
      .sort({ displayOrder: 1, createdAt: -1 })
      .toArray();

    if (!docs || docs.length === 0) {
      return mapLocalToDisplay();
    }

    return docs.map(mapDocumentToDisplay);
  } catch (error) {
    console.error("[MongoDB] Error fetching certificates, falling back to local data:", error);
    return mapLocalToDisplay();
  }
}

/**
 * Helper to build an ID query that works with either string id or ObjectId
 */
function buildIdFilter(id: string): Filter<CertificateDocument> {
  if (ObjectId.isValid(id)) {
    return {
      $or: [{ _id: new ObjectId(id) }, { id: id }],
    } as Filter<CertificateDocument>;
  }
  return { id: id };
}

/**
 * Retrieves a single certificate by id or _id
 */
export async function getCertificateById(id: string): Promise<CertificateDisplay | null> {
  const collection = await getCollection();
  if (!collection) return null;

  const doc = await collection.findOne(buildIdFilter(id));
  return doc ? mapDocumentToDisplay(doc) : null;
}

/**
 * Input validation for certificate creation and updates
 */
export function validateCertificateInput(data: {
  title?: string;
  issuer?: string;
  category?: string;
  displayOrder?: number;
  description?: string | null;
}): { valid: boolean; error?: string } {
  if (!data.title || data.title.trim().length === 0) {
    return { valid: false, error: "Title is required." };
  }
  if (data.title.length > 200) {
    return { valid: false, error: "Title must be under 200 characters." };
  }
  if (!data.issuer || data.issuer.trim().length === 0) {
    return { valid: false, error: "Issuer is required." };
  }
  if (data.issuer.length > 150) {
    return { valid: false, error: "Issuer must be under 150 characters." };
  }
  if (!data.category || !ALLOWED_CATEGORIES.includes(data.category as CertificateCategory)) {
    return {
      valid: false,
      error: `Invalid category. Must be one of: ${ALLOWED_CATEGORIES.join(", ")}`,
    };
  }
  if (data.description && data.description.length > 2000) {
    return { valid: false, error: "Description must be under 2000 characters." };
  }

  return { valid: true };
}

/**
 * Inserts a new certificate into MongoDB Atlas
 */
export async function createCertificateInDb(
  data: Omit<CertificateDocument, "_id" | "createdAt" | "updatedAt">
): Promise<CertificateDisplay> {
  const collection = await getCollection();
  if (!collection) {
    throw new Error("MongoDB database is not available.");
  }

  const now = new Date();
  const docToInsert: CertificateDocument = {
    ...data,
    id: data.id || `cert_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(docToInsert);
  docToInsert._id = result.insertedId;

  return mapDocumentToDisplay(docToInsert);
}

/**
 * Updates an existing certificate in MongoDB Atlas
 */
export async function updateCertificateInDb(
  id: string,
  updates: Partial<Omit<CertificateDocument, "_id" | "id" | "createdAt">>
): Promise<CertificateDisplay | null> {
  const collection = await getCollection();
  if (!collection) {
    throw new Error("MongoDB database is not available.");
  }

  const updateFields = {
    ...updates,
    updatedAt: new Date(),
  };

  const filter = buildIdFilter(id);
  const result = await collection.findOneAndUpdate(
    filter,
    { $set: updateFields },
    { returnDocument: "after" }
  );

  return result ? mapDocumentToDisplay(result) : null;
}

/**
 * Deletes a certificate from MongoDB Atlas
 */
export async function deleteCertificateFromDb(id: string): Promise<boolean> {
  const collection = await getCollection();
  if (!collection) {
    throw new Error("MongoDB database is not available.");
  }

  const filter = buildIdFilter(id);
  const result = await collection.deleteOne(filter);
  return result.deletedCount > 0;
}
