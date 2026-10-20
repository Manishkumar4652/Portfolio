import { personalData } from "@/data/personal";
import type { CertificateDisplay, CertificateCategory } from "./types";

/**
 * Resolves a web-browser friendly image URL for any certificate asset.
 * If the asset is hosted on Cloudinary and was uploaded as a PDF, AI, PSD, or EPS vector document,
 * Cloudinary dynamically delivers the first page as a sharp, high-res PNG image.
 */
export function getCertificateVisualUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (trimmed.includes("res.cloudinary.com")) {
    // If it ends with .pdf, .ai, .eps, .psd, .tif, .tiff, replace with .png
    if (/\.(pdf|ai|eps|psd|tiff?)$/i.test(trimmed)) {
      return trimmed.replace(/\.(pdf|ai|eps|psd|tiff?)$/i, ".png");
    }
    // If it has no file extension at all in the filename path
    const cleanUrl = trimmed.split("?")[0];
    const filename = cleanUrl.split("/").pop() || "";
    if (!filename.includes(".")) {
      return `${trimmed}.png`;
    }
    return trimmed;
  }

  // Local or external web images
  if (/\.(jpe?g|png|webp|svg|gif)$/i.test(trimmed)) {
    return trimmed;
  }

  // Fallback for non-Cloudinary PDFs
  if (/\.(pdf|ai|eps|psd|doc|docx)$/i.test(trimmed)) {
    return null;
  }

  return trimmed;
}

/**
 * Maps local verified certificate records from personalData to the display format.
 * Safe for both Client Components and Server Components (no Node native dependencies).
 */
export function mapLocalToDisplay(): CertificateDisplay[] {
  return personalData.certificates.map((cert, idx) => {
    const isPdf = Boolean(
      cert.filePath?.toLowerCase().endsWith(".pdf") || cert.filePath?.toLowerCase().endsWith(".ai")
    );
    const visualUrl = getCertificateVisualUrl(cert.filePath);

    return {
      id: cert.id,
      title: cert.title,
      issuer: cert.issuer,
      issueDate: cert.issueDate || null,
      category: cert.category as CertificateCategory,
      skills: cert.skills || [],
      description: null,
      filePath: cert.filePath || null,
      fileType: isPdf ? "pdf" : "image",
      fileUrl: visualUrl || cert.filePath || null,
      previewImageUrl: visualUrl,
      featured: cert.featured ?? false,
      sortOrder: idx + 1,
      displayOrder: idx + 1,
      verificationUrl: cert.verificationUrl || null,
      credentialId: cert.credentialId || null,
      publicId: null,
      secureUrl: cert.filePath || null,
      resourceType: isPdf ? "raw" : "image",
      source: "local",
    };
  });
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
