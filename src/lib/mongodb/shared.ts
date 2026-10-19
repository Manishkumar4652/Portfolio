import { personalData } from "@/data/personal";
import type { CertificateDisplay, CertificateCategory } from "./types";

/**
 * Maps local verified certificate records from personalData to the display format.
 * Safe for both Client Components and Server Components (no Node native dependencies).
 */
export function mapLocalToDisplay(): CertificateDisplay[] {
  return personalData.certificates.map((cert, idx) => ({
    id: cert.id,
    title: cert.title,
    issuer: cert.issuer,
    issueDate: cert.issueDate || null,
    category: cert.category as CertificateCategory,
    skills: cert.skills || [],
    description: null,
    filePath: cert.filePath || null,
    fileType: cert.filePath?.toLowerCase().endsWith(".pdf") ? "pdf" : "image",
    fileUrl: cert.filePath || null,
    previewImageUrl: cert.filePath?.toLowerCase().endsWith(".pdf") ? null : cert.filePath || null,
    featured: cert.featured ?? false,
    sortOrder: idx + 1,
    displayOrder: idx + 1,
    verificationUrl: cert.verificationUrl || null,
    credentialId: cert.credentialId || null,
    publicId: null,
    secureUrl: cert.filePath || null,
    resourceType: cert.filePath?.toLowerCase().endsWith(".pdf") ? "raw" : "image",
    source: "local",
  }));
}

/**
 * Normalizes status strings between legacy uppercase display and standard lowercase schema
 */
export function normalizeProjectStatus(status?: string): "completed" | "in-development" | "planned" {
  const s = (status || "").toLowerCase().trim();
  if (s.includes("dev")) return "in-development";
  if (s.includes("plan")) return "planned";
  return "completed";
}

/**
 * Maps local verified project records from personalData to the ProjectDisplay format.
 * Safe for both Client and Server Components without native dependencies.
 */
export function mapLocalProjectsToDisplay(): import("./types").ProjectDisplay[] {
  return personalData.projects.map((proj, idx) => ({
    id: proj.id,
    title: proj.title,
    slug: proj.id,
    shortDescription: proj.tagline,
    fullDescription: proj.tagline,
    technologies: proj.techStack || [],
    category: proj.category,
    thumbnailUrl: null,
    cloudinaryPublicId: null,
    cloudinaryResourceType: null,
    githubUrl: proj.githubUrl || null,
    liveDemoUrl: proj.liveUrl || null,
    status: normalizeProjectStatus(proj.status),
    featured: Boolean(proj.featured),
    displayOrder: idx + 1,
    source: "local",
  }));
}
