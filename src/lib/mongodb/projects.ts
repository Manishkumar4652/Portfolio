import { ObjectId, type Collection, type Filter } from "mongodb";
import { getDb } from "./client";
import { isMongoConfigured } from "./config";
import { personalData } from "@/data/personal";
import type {
  ProjectDocument,
  ProjectDisplay,
  ProjectStatus,
} from "./types";
import { mapLocalProjectsToDisplay, normalizeProjectStatus } from "./shared";
import crypto from "crypto";

const COLLECTION_NAME = "projects";

let indexesEnsured = false;

async function getProjectsCollection(): Promise<Collection<ProjectDocument> | null> {
  const db = await getDb();
  if (!db) return null;
  const collection = db.collection<ProjectDocument>(COLLECTION_NAME);

  if (!indexesEnsured) {
    try {
      await collection.createIndex({ slug: 1 }, { unique: true });
      await collection.createIndex({ featured: 1, displayOrder: 1 });
      indexesEnsured = true;
    } catch (indexErr) {
      console.warn("[MongoDB Projects] Index creation notice:", indexErr);
    }
  }

  return collection;
}

/**
 * Maps a MongoDB ProjectDocument to ProjectDisplay
 */
export function mapProjectDocumentToDisplay(doc: ProjectDocument): ProjectDisplay {
  const id = doc.id || doc._id?.toString() || "";
  return {
    id,
    title: doc.title,
    slug: doc.slug,
    shortDescription: doc.shortDescription,
    fullDescription: doc.fullDescription || doc.shortDescription,
    technologies: Array.isArray(doc.technologies) ? doc.technologies : [],
    category: doc.category || "Web Application",
    thumbnailUrl: doc.thumbnailUrl || null,
    cloudinaryPublicId: doc.cloudinaryPublicId || null,
    cloudinaryResourceType: doc.cloudinaryResourceType || (doc.thumbnailUrl ? "image" : null),
    githubUrl: doc.githubUrl || null,
    liveDemoUrl: doc.liveDemoUrl || null,
    status: normalizeProjectStatus(doc.status),
    featured: Boolean(doc.featured),
    displayOrder: typeof doc.displayOrder === "number" ? doc.displayOrder : 0,
    source: "mongodb",
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : undefined,
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : undefined,
  };
}

/**
 * Safely seeds verified initial projects from personalData if the MongoDB collection is empty.
 * Preserves the 5 verified project codebases without fabricating data.
 */
async function autoSeedProjectsIfEmpty(collection: Collection<ProjectDocument>): Promise<void> {
  try {
    const count = await collection.countDocuments();
    if (count === 0) {
      const now = new Date();
      const initialDocs: ProjectDocument[] = personalData.projects.map((proj, idx) => ({
        id: proj.id,
        title: proj.title,
        slug: proj.id,
        shortDescription: proj.tagline,
        fullDescription: proj.tagline,
        technologies: proj.techStack || [],
        category: proj.category || "Web Application",
        thumbnailUrl: null,
        cloudinaryPublicId: null,
        cloudinaryResourceType: null,
        githubUrl: proj.githubUrl || null,
        liveDemoUrl: proj.liveUrl || null,
        status: normalizeProjectStatus(proj.status),
        featured: Boolean(proj.featured),
        displayOrder: idx + 1,
        createdAt: now,
        updatedAt: now,
      }));

      await collection.insertMany(initialDocs);
      console.log(`[MongoDB Projects] Auto-seeded ${initialDocs.length} initial verified projects.`);
    }
  } catch (err) {
    console.error("[MongoDB Projects] Failed to auto-seed initial projects:", err);
  }
}

/**
 * Helper to build an ID query that works with either string id, slug, or ObjectId
 */
function buildProjectIdFilter(idOrSlug: string): Filter<ProjectDocument> {
  if (ObjectId.isValid(idOrSlug)) {
    return {
      $or: [{ _id: new ObjectId(idOrSlug) }, { id: idOrSlug }, { slug: idOrSlug }],
    } as Filter<ProjectDocument>;
  }
  return {
    $or: [{ id: idOrSlug }, { slug: idOrSlug }],
  } as Filter<ProjectDocument>;
}

/**
 * Retrieves all project records from MongoDB Atlas with automatic fallback to personalData
 */
export async function getProjects(options?: {
  featuredOnly?: boolean;
  category?: string;
}): Promise<ProjectDisplay[]> {
  if (!isMongoConfigured()) {
    const local = mapLocalProjectsToDisplay();
    if (options?.featuredOnly) {
      return local.filter((p) => p.featured).sort((a, b) => a.displayOrder - b.displayOrder);
    }
    if (options?.category && options.category !== "All") {
      return local.filter((p) => p.category === options.category);
    }
    return local;
  }

  try {
    const collection = await getProjectsCollection();
    if (!collection) {
      return mapLocalProjectsToDisplay();
    }

    await autoSeedProjectsIfEmpty(collection);

    const query: Filter<ProjectDocument> = {};
    if (options?.featuredOnly) {
      query.featured = true;
    }
    if (options?.category && options.category !== "All") {
      query.category = options.category;
    }

    const docs = await collection
      .find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .toArray();

    if (docs.length === 0 && !options?.category && !options?.featuredOnly) {
      return mapLocalProjectsToDisplay();
    }

    return docs.map(mapProjectDocumentToDisplay);
  } catch (error) {
    console.error("[MongoDB Projects] Error retrieving projects:", error);
    return mapLocalProjectsToDisplay();
  }
}

/**
 * Retrieves a single project by id or slug
 */
export async function getProjectById(idOrSlug: string): Promise<ProjectDisplay | null> {
  const collection = await getProjectsCollection();
  if (!collection) {
    const local = mapLocalProjectsToDisplay();
    return local.find((p) => p.id === idOrSlug || p.slug === idOrSlug) || null;
  }

  const doc = await collection.findOne(buildProjectIdFilter(idOrSlug));
  return doc ? mapProjectDocumentToDisplay(doc) : null;
}

/**
 * Input validation for project creation and updates
 */
export function validateProjectInput(data: {
  title?: string;
  slug?: string;
  shortDescription?: string;
  fullDescription?: string;
  technologies?: string[];
  category?: string;
  status?: string;
  githubUrl?: string | null;
  liveDemoUrl?: string | null;
  displayOrder?: number;
}): { valid: boolean; error?: string } {
  if (!data.title || data.title.trim().length === 0) {
    return { valid: false, error: "Project title is required." };
  }
  if (data.title.trim().length > 150) {
    return { valid: false, error: "Title must be under 150 characters." };
  }

  if (!data.slug || data.slug.trim().length === 0) {
    return { valid: false, error: "Slug is required." };
  }
  const cleanSlug = data.slug.trim().toLowerCase();
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugRegex.test(cleanSlug)) {
    return {
      valid: false,
      error: "Slug must be lowercase alphanumeric and may use hyphens (e.g. 'gpahub-calc').",
    };
  }
  if (cleanSlug.length > 80) {
    return { valid: false, error: "Slug must be under 80 characters." };
  }

  if (!data.shortDescription || data.shortDescription.trim().length === 0) {
    return { valid: false, error: "Short description / tagline is required." };
  }
  if (data.shortDescription.trim().length > 500) {
    return { valid: false, error: "Short description must be under 500 characters." };
  }

  if (data.fullDescription && data.fullDescription.trim().length > 5000) {
    return { valid: false, error: "Full description must be under 5000 characters." };
  }

  if (!data.technologies || data.technologies.length === 0) {
    return { valid: false, error: "At least one technology is required." };
  }

  const validStatuses: ProjectStatus[] = ["completed", "in-development", "planned"];
  if (data.status && !validStatuses.includes(normalizeProjectStatus(data.status))) {
    return { valid: false, error: "Status must be 'completed', 'in-development', or 'planned'." };
  }

  const urlRegex = /^https?:\/\/.+/i;
  if (data.githubUrl && data.githubUrl.trim().length > 0) {
    if (!urlRegex.test(data.githubUrl.trim())) {
      return { valid: false, error: "GitHub URL must start with http:// or https://" };
    }
  }

  if (data.liveDemoUrl && data.liveDemoUrl.trim().length > 0) {
    if (!urlRegex.test(data.liveDemoUrl.trim())) {
      return { valid: false, error: "Live Demo URL must start with http:// or https://" };
    }
  }

  return { valid: true };
}

/**
 * Inserts a new project into MongoDB Atlas
 */
export async function createProjectInDb(
  data: Omit<ProjectDocument, "_id" | "createdAt" | "updatedAt">
): Promise<ProjectDisplay> {
  const collection = await getProjectsCollection();
  if (!collection) {
    throw new Error("MongoDB database is not available.");
  }

  const slug = data.slug.trim().toLowerCase();
  const existingWithSlug = await collection.findOne({ slug });
  if (existingWithSlug) {
    throw new Error(`A project with slug '${slug}' already exists. Please choose a unique slug.`);
  }

  const now = new Date();
  const docToInsert: ProjectDocument = {
    ...data,
    slug,
    id: data.id || `proj_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
    status: normalizeProjectStatus(data.status),
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(docToInsert);
  docToInsert._id = result.insertedId;

  return mapProjectDocumentToDisplay(docToInsert);
}

/**
 * Updates an existing project in MongoDB Atlas
 */
export async function updateProjectInDb(
  id: string,
  updates: Partial<Omit<ProjectDocument, "_id" | "id" | "createdAt">>
): Promise<ProjectDisplay | null> {
  const collection = await getProjectsCollection();
  if (!collection) {
    throw new Error("MongoDB database is not available.");
  }

  if (updates.slug) {
    const cleanSlug = updates.slug.trim().toLowerCase();
    const objectIdFilter = ObjectId.isValid(id) ? new ObjectId(id) : null;
    const existingWithSlug = await collection.findOne({
      slug: cleanSlug,
      ...(objectIdFilter ? { _id: { $ne: objectIdFilter } } : {}),
    });
    if (existingWithSlug) {
      throw new Error(`A project with slug '${cleanSlug}' already exists. Slugs must be unique.`);
    }
    updates.slug = cleanSlug;
  }

  if (updates.status) {
    updates.status = normalizeProjectStatus(updates.status);
  }

  const updateFields = {
    ...updates,
    updatedAt: new Date(),
  };

  const filter = buildProjectIdFilter(id);
  const result = await collection.findOneAndUpdate(
    filter,
    { $set: updateFields },
    { returnDocument: "after" }
  );

  return result ? mapProjectDocumentToDisplay(result) : null;
}

/**
 * Deletes a project from MongoDB Atlas
 */
export async function deleteProjectFromDb(id: string): Promise<boolean> {
  const collection = await getProjectsCollection();
  if (!collection) {
    throw new Error("MongoDB database is not available.");
  }

  const filter = buildProjectIdFilter(id);
  const result = await collection.deleteOne(filter);
  return result.deletedCount > 0;
}
