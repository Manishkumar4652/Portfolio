"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifyAdminSession, loginAdmin, logoutAdmin } from "@/lib/auth/admin";
import { isCloudinaryConfigured } from "@/lib/mongodb/config";
import {
  createCertificateInDb,
  updateCertificateInDb,
  deleteCertificateFromDb,
  getCertificateById,
  validateCertificateInput,
} from "@/lib/mongodb/certificates";
import {
  uploadCertificateAsset,
  uploadProjectThumbnail,
  uploadResumeAsset,
  deleteCloudinaryAsset,
  validateCertificateFile,
  validateResumeFile,
} from "@/lib/cloudinary/client";
import {
  createProjectInDb,
  updateProjectInDb,
  deleteProjectFromDb,
  getProjectById,
  validateProjectInput,
} from "@/lib/mongodb/projects";
import {
  updateHeroContentInDb,
  updateAboutContentInDb,
  addSkillToDb,
  updateSkillInDb,
  deleteSkillFromDb,
  addExperienceToDb,
  updateExperienceInDb,
  deleteExperienceFromDb,
  isValidContentUrl,
} from "@/lib/mongodb/content";
import {
  getActiveResumeDoc,
  saveActiveResumeInDb,
  deleteActiveResumeFromDb,
} from "@/lib/mongodb/resume";
import type {
  CertificateCategory,
  CertificateResourceType,
  ProjectStatus,
  HeroContent,
  AboutContent,
  EmploymentType,
  ResumeDisplay,
} from "@/lib/mongodb/types";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Admin Login Action
 * Validates credentials against MongoDB Atlas & server ADMIN_EMAILS allowlist
 */
export async function loginAdminAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return {
      success: false,
      error: "Both administrator email and password are required.",
    };
  }

  const result = await loginAdmin(email, password);
  if (!result.success) {
    return {
      success: false,
      error: result.error || "Authentication failed.",
    };
  }

  redirect("/admin");
}

/**
 * Admin Logout Action
 * Revokes the server-side session and clears the cookie
 */
export async function logoutAdminAction(): Promise<void> {
  await logoutAdmin();
  redirect("/admin/login");
}

/**
 * Create Certificate Action
 * Uploads file to Cloudinary if provided, and stores structured metadata in MongoDB Atlas
 */
export async function createCertificateAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const auth = await verifyAdminSession();
  if (!auth.isAdmin) {
    return { success: false, error: auth.error || "Unauthorized: Administrator access required." };
  }

  const title = (formData.get("title") as string)?.trim();
  const issuer = (formData.get("issuer") as string)?.trim();
  const category = formData.get("category") as CertificateCategory;
  const issueDate = (formData.get("issueDate") as string)?.trim() || null;
  const description = (formData.get("description") as string)?.trim() || null;
  const verificationUrl = (formData.get("verificationUrl") as string)?.trim() || null;
  const credentialId = (formData.get("credentialId") as string)?.trim() || null;
  const featured = formData.get("featured") === "true" || formData.get("featured") === "on";
  const displayOrder = parseInt(formData.get("sortOrder") as string || formData.get("displayOrder") as string, 10) || 0;

  const rawSkills = (formData.get("skills") as string) || "";
  const skills = rawSkills
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // Validate text inputs
  const validation = validateCertificateInput({
    title,
    issuer,
    category,
    description,
    displayOrder,
  });
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  let publicId: string | null = null;
  let secureUrl: string | null = null;
  let resourceType: CertificateResourceType | null = null;

  const file = formData.get("file") as File | null;
  if (file && file.size > 0 && file.name !== "undefined") {
    if (!isCloudinaryConfigured()) {
      return {
        success: false,
        error:
          "Cloudinary credentials are not configured in .env.local. File upload cannot proceed until Cloudinary keys are set.",
      };
    }

    const fileCheck = validateCertificateFile(file);
    if (!fileCheck.valid) {
      return { success: false, error: fileCheck.error };
    }

    try {
      const uploadResult = await uploadCertificateAsset(file);
      publicId = uploadResult.publicId;
      secureUrl = uploadResult.secureUrl;
      resourceType = uploadResult.resourceType;
    } catch (uploadErr) {
      const msg = uploadErr instanceof Error ? uploadErr.message : "Cloudinary upload failed";
      return { success: false, error: msg };
    }
  }

  try {
    await createCertificateInDb({
      title,
      issuer,
      category,
      issueDate,
      description,
      skills,
      publicId,
      secureUrl,
      resourceType,
      featured,
      displayOrder,
      verificationUrl,
      credentialId,
    });
  } catch (dbErr) {
    // If DB insertion fails, clean up the newly uploaded asset to avoid orphaned files
    if (publicId) {
      await deleteCloudinaryAsset(publicId, resourceType);
    }
    const msg = dbErr instanceof Error ? dbErr.message : "Database error inserting certificate.";
    return { success: false, error: msg };
  }

  revalidatePath("/certificates");
  revalidatePath("/admin");
  revalidatePath("/");

  return { success: true };
}

/**
 * Update Certificate Action
 * Safely updates certificate metadata in MongoDB Atlas and handles file replacement
 */
export async function updateCertificateAction(
  id: string,
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const auth = await verifyAdminSession();
  if (!auth.isAdmin) {
    return { success: false, error: auth.error || "Unauthorized: Administrator access required." };
  }

  const existingCert = await getCertificateById(id);
  if (!existingCert) {
    return { success: false, error: "Certificate record not found." };
  }

  const title = (formData.get("title") as string)?.trim();
  const issuer = (formData.get("issuer") as string)?.trim();
  const category = formData.get("category") as CertificateCategory;
  const issueDate = (formData.get("issueDate") as string)?.trim() || null;
  const description = (formData.get("description") as string)?.trim() || null;
  const verificationUrl = (formData.get("verificationUrl") as string)?.trim() || null;
  const credentialId = (formData.get("credentialId") as string)?.trim() || null;
  const featured = formData.get("featured") === "true" || formData.get("featured") === "on";
  const displayOrder = parseInt(formData.get("sortOrder") as string || formData.get("displayOrder") as string, 10) || 0;

  const rawSkills = (formData.get("skills") as string) || "";
  const skills = rawSkills
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const validation = validateCertificateInput({
    title,
    issuer,
    category,
    description,
    displayOrder,
  });
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  let newPublicId = existingCert.publicId;
  let newSecureUrl = existingCert.secureUrl;
  let newResourceType = existingCert.resourceType;
  let hasReplacedFile = false;

  const file = formData.get("file") as File | null;
  if (file && file.size > 0 && file.name !== "undefined") {
    if (!isCloudinaryConfigured()) {
      return {
        success: false,
        error:
          "Cloudinary credentials are not configured in .env.local. File replacement cannot proceed.",
      };
    }

    const fileCheck = validateCertificateFile(file);
    if (!fileCheck.valid) {
      return { success: false, error: fileCheck.error };
    }

    try {
      const uploadResult = await uploadCertificateAsset(file);
      newPublicId = uploadResult.publicId;
      newSecureUrl = uploadResult.secureUrl;
      newResourceType = uploadResult.resourceType;
      hasReplacedFile = true;
    } catch (uploadErr) {
      const msg = uploadErr instanceof Error ? uploadErr.message : "Cloudinary upload failed";
      return { success: false, error: msg };
    }
  }

  try {
    await updateCertificateInDb(id, {
      title,
      issuer,
      category,
      issueDate,
      description,
      skills,
      publicId: newPublicId,
      secureUrl: newSecureUrl,
      resourceType: newResourceType,
      featured,
      displayOrder,
      verificationUrl,
      credentialId,
    });

    // Clean up previous Cloudinary asset only AFTER DB update succeeds
    if (hasReplacedFile && existingCert.publicId) {
      await deleteCloudinaryAsset(existingCert.publicId, existingCert.resourceType);
    }
  } catch (dbErr) {
    // If DB update fails, clean up the newly uploaded asset
    if (hasReplacedFile && newPublicId) {
      await deleteCloudinaryAsset(newPublicId, newResourceType);
    }
    const msg = dbErr instanceof Error ? dbErr.message : "Database error updating certificate.";
    return { success: false, error: msg };
  }

  revalidatePath("/certificates");
  revalidatePath("/admin");
  revalidatePath("/");

  return { success: true };
}

/**
 * Delete Certificate Action
 * Safely removes the database record and associated Cloudinary asset
 */
export async function deleteCertificateAction(id: string): Promise<ActionResult> {
  const auth = await verifyAdminSession();
  if (!auth.isAdmin) {
    return { success: false, error: auth.error || "Unauthorized: Administrator access required." };
  }

  const existingCert = await getCertificateById(id);
  if (!existingCert) {
    return { success: false, error: "Certificate record not found." };
  }

  try {
    await deleteCertificateFromDb(id);
  } catch (dbErr) {
    const msg = dbErr instanceof Error ? dbErr.message : "Database error deleting certificate.";
    return { success: false, error: msg };
  }

  // Clean up Cloudinary asset safely
  if (existingCert.publicId) {
    await deleteCloudinaryAsset(existingCert.publicId, existingCert.resourceType);
  }

  revalidatePath("/certificates");
  revalidatePath("/admin");
  revalidatePath("/");

  return { success: true };
}

/**
 * Create Project Action
 * Uploads project thumbnail to Cloudinary if provided, and stores structured metadata in MongoDB Atlas
 */
export async function createProjectAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const auth = await verifyAdminSession();
  if (!auth.isAdmin) {
    return { success: false, error: auth.error || "Unauthorized: Administrator access required." };
  }

  const title = (formData.get("title") as string)?.trim();
  let slug = (formData.get("slug") as string)?.trim().toLowerCase();
  if (!slug && title) {
    slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  const shortDescription = (formData.get("shortDescription") as string)?.trim();
  const fullDescription = ((formData.get("fullDescription") as string)?.trim()) || shortDescription;
  const category = (formData.get("category") as string)?.trim() || "Web Application";
  const status = (formData.get("status") as string)?.trim().toLowerCase() as ProjectStatus;
  const githubUrl = (formData.get("githubUrl") as string)?.trim() || null;
  const liveDemoUrl = (formData.get("liveDemoUrl") as string)?.trim() || null;
  const featured = formData.get("featured") === "true" || formData.get("featured") === "on";
  const displayOrder = parseInt(formData.get("sortOrder") as string || formData.get("displayOrder") as string, 10) || 0;

  const rawTech = (formData.get("technologies") as string) || (formData.get("techStack") as string) || "";
  const technologies = rawTech
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const validation = validateProjectInput({
    title,
    slug,
    shortDescription,
    fullDescription,
    technologies,
    category,
    status,
    githubUrl,
    liveDemoUrl,
    displayOrder,
  });
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  let cloudinaryPublicId: string | null = null;
  let thumbnailUrl: string | null = null;
  let cloudinaryResourceType: CertificateResourceType | null = null;

  const file = formData.get("file") as File | null;
  if (file && file.size > 0 && file.name !== "undefined") {
    if (!isCloudinaryConfigured()) {
      return {
        success: false,
        error: "Cloudinary credentials are not configured in .env.local. File upload cannot proceed.",
      };
    }

    const fileCheck = validateCertificateFile(file);
    if (!fileCheck.valid) {
      return { success: false, error: fileCheck.error };
    }

    try {
      const uploadResult = await uploadProjectThumbnail(file);
      cloudinaryPublicId = uploadResult.publicId;
      thumbnailUrl = uploadResult.secureUrl;
      cloudinaryResourceType = uploadResult.resourceType;
    } catch (uploadErr) {
      const msg = uploadErr instanceof Error ? uploadErr.message : "Cloudinary upload failed";
      return { success: false, error: msg };
    }
  }

  try {
    await createProjectInDb({
      title,
      slug,
      shortDescription,
      fullDescription,
      technologies,
      category,
      thumbnailUrl,
      cloudinaryPublicId,
      cloudinaryResourceType,
      githubUrl,
      liveDemoUrl,
      status,
      featured,
      displayOrder,
    });
  } catch (dbErr) {
    if (cloudinaryPublicId) {
      await deleteCloudinaryAsset(cloudinaryPublicId, cloudinaryResourceType);
    }
    const msg = dbErr instanceof Error ? dbErr.message : "Database error inserting project.";
    return { success: false, error: msg };
  }

  revalidatePath("/projects");
  revalidatePath("/admin");
  revalidatePath("/");

  return { success: true };
}

/**
 * Update Project Action
 * Safely updates project metadata in MongoDB Atlas and handles thumbnail image replacement
 */
export async function updateProjectAction(
  id: string,
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const auth = await verifyAdminSession();
  if (!auth.isAdmin) {
    return { success: false, error: auth.error || "Unauthorized: Administrator access required." };
  }

  const existingProj = await getProjectById(id);
  if (!existingProj) {
    return { success: false, error: "Project record not found." };
  }

  const title = (formData.get("title") as string)?.trim();
  let slug = (formData.get("slug") as string)?.trim().toLowerCase();
  if (!slug && title) {
    slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  const shortDescription = (formData.get("shortDescription") as string)?.trim();
  const fullDescription = ((formData.get("fullDescription") as string)?.trim()) || shortDescription;
  const category = (formData.get("category") as string)?.trim() || "Web Application";
  const status = (formData.get("status") as string)?.trim().toLowerCase() as ProjectStatus;
  const githubUrl = (formData.get("githubUrl") as string)?.trim() || null;
  const liveDemoUrl = (formData.get("liveDemoUrl") as string)?.trim() || null;
  const featured = formData.get("featured") === "true" || formData.get("featured") === "on";
  const displayOrder = parseInt(formData.get("sortOrder") as string || formData.get("displayOrder") as string, 10) || 0;

  const rawTech = (formData.get("technologies") as string) || (formData.get("techStack") as string) || "";
  const technologies = rawTech
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const validation = validateProjectInput({
    title,
    slug,
    shortDescription,
    fullDescription,
    technologies,
    category,
    status,
    githubUrl,
    liveDemoUrl,
    displayOrder,
  });
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  let newPublicId = existingProj.cloudinaryPublicId;
  let newThumbnailUrl = existingProj.thumbnailUrl;
  let newResourceType = existingProj.cloudinaryResourceType;
  let hasReplacedFile = false;

  const file = formData.get("file") as File | null;
  if (file && file.size > 0 && file.name !== "undefined") {
    if (!isCloudinaryConfigured()) {
      return {
        success: false,
        error: "Cloudinary credentials are not configured in .env.local. File replacement cannot proceed.",
      };
    }

    const fileCheck = validateCertificateFile(file);
    if (!fileCheck.valid) {
      return { success: false, error: fileCheck.error };
    }

    try {
      const uploadResult = await uploadProjectThumbnail(file);
      newPublicId = uploadResult.publicId;
      newThumbnailUrl = uploadResult.secureUrl;
      newResourceType = uploadResult.resourceType;
      hasReplacedFile = true;
    } catch (uploadErr) {
      const msg = uploadErr instanceof Error ? uploadErr.message : "Cloudinary upload failed";
      return { success: false, error: msg };
    }
  }

  try {
    await updateProjectInDb(id, {
      title,
      slug,
      shortDescription,
      fullDescription,
      technologies,
      category,
      thumbnailUrl: newThumbnailUrl,
      cloudinaryPublicId: newPublicId,
      cloudinaryResourceType: newResourceType,
      githubUrl,
      liveDemoUrl,
      status,
      featured,
      displayOrder,
    });

    if (hasReplacedFile && existingProj.cloudinaryPublicId) {
      await deleteCloudinaryAsset(existingProj.cloudinaryPublicId, existingProj.cloudinaryResourceType);
    }
  } catch (dbErr) {
    if (hasReplacedFile && newPublicId) {
      await deleteCloudinaryAsset(newPublicId, newResourceType);
    }
    const msg = dbErr instanceof Error ? dbErr.message : "Database error updating project.";
    return { success: false, error: msg };
  }

  revalidatePath("/projects");
  revalidatePath("/admin");
  revalidatePath("/");

  return { success: true };
}

/**
 * Delete Project Action
 * Safely removes the database record and associated Cloudinary asset
 */
export async function deleteProjectAction(id: string): Promise<ActionResult> {
  const auth = await verifyAdminSession();
  if (!auth.isAdmin) {
    return { success: false, error: auth.error || "Unauthorized: Administrator access required." };
  }

  const existingProj = await getProjectById(id);
  if (!existingProj) {
    return { success: false, error: "Project record not found." };
  }

  try {
    await deleteProjectFromDb(id);
  } catch (dbErr) {
    const msg = dbErr instanceof Error ? dbErr.message : "Database error deleting project.";
    return { success: false, error: msg };
  }

  if (existingProj.cloudinaryPublicId) {
    await deleteCloudinaryAsset(existingProj.cloudinaryPublicId, existingProj.cloudinaryResourceType);
  }

  revalidatePath("/projects");
  revalidatePath("/admin");
  revalidatePath("/");

  return { success: true };
}

/**
 * ============================================================================
 * Phase 6: Content Management Server Actions
 * ============================================================================
 */

/**
 * Save Homepage Hero Content Action
 */
export async function saveHeroContentAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const auth = await verifyAdminSession();
  if (!auth.isAdmin) {
    return { success: false, error: auth.error || "Unauthorized: Administrator access required." };
  }

  const eyebrow = (formData.get("eyebrow") as string)?.trim() || "";
  const heading = (formData.get("heading") as string)?.trim() || "";
  const highlightText = (formData.get("highlightText") as string)?.trim() || "";
  const subtitle = (formData.get("subtitle") as string)?.trim() || "";
  const primaryCtaLabel = (formData.get("primaryCtaLabel") as string)?.trim() || "";
  const primaryCtaUrl = (formData.get("primaryCtaUrl") as string)?.trim() || "";
  const secondaryCtaLabel = (formData.get("secondaryCtaLabel") as string)?.trim() || "";
  const secondaryCtaUrl = (formData.get("secondaryCtaUrl") as string)?.trim() || "";
  const tertiaryCtaLabel = (formData.get("tertiaryCtaLabel") as string)?.trim() || "";
  const tertiaryCtaUrl = (formData.get("tertiaryCtaUrl") as string)?.trim() || "";

  if (!heading) {
    return { success: false, error: "Hero heading line is required." };
  }
  if (!subtitle) {
    return { success: false, error: "Hero subtitle / bio paragraph is required." };
  }

  if (primaryCtaUrl && !isValidContentUrl(primaryCtaUrl)) {
    return { success: false, error: "Primary CTA URL must be a valid relative path (/path, #id) or http(s) URL." };
  }
  if (secondaryCtaUrl && !isValidContentUrl(secondaryCtaUrl)) {
    return { success: false, error: "Secondary CTA URL must be a valid relative path or http(s) URL." };
  }
  if (tertiaryCtaUrl && !isValidContentUrl(tertiaryCtaUrl)) {
    return { success: false, error: "Tertiary CTA URL must be a valid relative path or http(s) URL." };
  }

  const heroData: HeroContent = {
    eyebrow,
    heading,
    highlightText,
    subtitle,
    primaryCtaLabel,
    primaryCtaUrl,
    secondaryCtaLabel,
    secondaryCtaUrl,
    tertiaryCtaLabel,
    tertiaryCtaUrl,
  };

  try {
    await updateHeroContentInDb(heroData);
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to update hero content.";
    return { success: false, error: msg };
  }
}

/**
 * Save About Page Content Action
 */
export async function saveAboutContentAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const auth = await verifyAdminSession();
  if (!auth.isAdmin) {
    return { success: false, error: auth.error || "Unauthorized: Administrator access required." };
  }

  const introduction = (formData.get("introduction") as string)?.trim() || "";
  const biography = (formData.get("biography") as string)?.trim() || "";
  const careerObjective = (formData.get("careerObjective") as string)?.trim() || "";
  const location = (formData.get("location") as string)?.trim() || "";
  const academicsText = (formData.get("academicsText") as string)?.trim() || "";
  const problemSolvingText = (formData.get("problemSolvingText") as string)?.trim() || "";

  if (!introduction) {
    return { success: false, error: "About introduction statement is required." };
  }
  if (!biography) {
    return { success: false, error: "About biography narrative is required." };
  }

  const aboutData: AboutContent = {
    introduction,
    biography,
    careerObjective,
    location,
    academicsText,
    problemSolvingText,
  };

  try {
    await updateAboutContentInDb(aboutData);
    revalidatePath("/about");
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to update about content.";
    return { success: false, error: msg };
  }
}

/**
 * Create or Add Skill Action
 */
export async function createSkillAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const auth = await verifyAdminSession();
  if (!auth.isAdmin) {
    return { success: false, error: auth.error || "Unauthorized: Administrator access required." };
  }

  const name = (formData.get("name") as string)?.trim();
  const category = (formData.get("category") as string)?.trim();
  const proficiency = (formData.get("proficiency") as string)?.trim() || "Proficient";
  const featured = formData.get("featured") === "true" || formData.get("featured") === "on";
  const displayOrder = parseInt((formData.get("displayOrder") as string) || "1", 10);

  if (!name) return { success: false, error: "Skill name is required." };
  if (!category) return { success: false, error: "Skill category is required." };

  try {
    const newSkill = await addSkillToDb({
      name,
      category,
      proficiency,
      featured,
      displayOrder: isNaN(displayOrder) ? 1 : displayOrder,
    });
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/admin");
    return { success: true, data: newSkill };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to add skill.";
    return { success: false, error: msg };
  }
}

/**
 * Update Skill Action
 */
export async function updateSkillAction(
  skillId: string,
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const auth = await verifyAdminSession();
  if (!auth.isAdmin) {
    return { success: false, error: auth.error || "Unauthorized: Administrator access required." };
  }

  const name = (formData.get("name") as string)?.trim();
  const category = (formData.get("category") as string)?.trim();
  const proficiency = (formData.get("proficiency") as string)?.trim();
  const featured = formData.get("featured") === "true" || formData.get("featured") === "on";
  const displayOrder = parseInt((formData.get("displayOrder") as string) || "1", 10);

  if (!name) return { success: false, error: "Skill name is required." };
  if (!category) return { success: false, error: "Skill category is required." };

  try {
    await updateSkillInDb(skillId, {
      name,
      category,
      proficiency,
      featured,
      displayOrder: isNaN(displayOrder) ? 1 : displayOrder,
    });
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to update skill.";
    return { success: false, error: msg };
  }
}

/**
 * Delete Skill Action
 */
export async function deleteSkillAction(skillId: string): Promise<ActionResult> {
  const auth = await verifyAdminSession();
  if (!auth.isAdmin) {
    return { success: false, error: auth.error || "Unauthorized: Administrator access required." };
  }

  try {
    await deleteSkillFromDb(skillId);
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to delete skill.";
    return { success: false, error: msg };
  }
}

/**
 * Create Experience Entry Action
 */
export async function createExperienceAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const auth = await verifyAdminSession();
  if (!auth.isAdmin) {
    return { success: false, error: auth.error || "Unauthorized: Administrator access required." };
  }

  const organization = (formData.get("organization") as string)?.trim();
  const role = (formData.get("role") as string)?.trim();
  const employmentType = (formData.get("employmentType") as string)?.trim() as EmploymentType;
  const startDate = (formData.get("startDate") as string)?.trim();
  const endDate = (formData.get("endDate") as string)?.trim();
  const location = (formData.get("location") as string)?.trim() || undefined;
  const currentRole = formData.get("currentRole") === "true" || formData.get("currentRole") === "on";
  const descriptionRaw = (formData.get("description") as string)?.trim() || "";
  const skillsRaw = (formData.get("skills") as string)?.trim() || "";
  const displayOrder = parseInt((formData.get("displayOrder") as string) || "1", 10);

  if (!role) return { success: false, error: "Role title is required." };
  if (!organization) return { success: false, error: "Organization name is required." };

  const description = descriptionRaw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const skills = skillsRaw
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

  try {
    const newExp = await addExperienceToDb({
      organization,
      role,
      employmentType: employmentType || "Independent",
      startDate,
      endDate: currentRole ? "Present" : endDate,
      currentRole,
      location,
      description,
      skills,
      displayOrder: isNaN(displayOrder) ? 1 : displayOrder,
    });
    revalidatePath("/experience");
    revalidatePath("/admin");
    return { success: true, data: newExp };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to add experience.";
    return { success: false, error: msg };
  }
}

/**
 * Update Experience Entry Action
 */
export async function updateExperienceAction(
  expId: string,
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const auth = await verifyAdminSession();
  if (!auth.isAdmin) {
    return { success: false, error: auth.error || "Unauthorized: Administrator access required." };
  }

  const organization = (formData.get("organization") as string)?.trim();
  const role = (formData.get("role") as string)?.trim();
  const employmentType = (formData.get("employmentType") as string)?.trim() as EmploymentType;
  const startDate = (formData.get("startDate") as string)?.trim();
  const endDate = (formData.get("endDate") as string)?.trim();
  const location = (formData.get("location") as string)?.trim() || undefined;
  const currentRole = formData.get("currentRole") === "true" || formData.get("currentRole") === "on";
  const descriptionRaw = (formData.get("description") as string)?.trim() || "";
  const skillsRaw = (formData.get("skills") as string)?.trim() || "";
  const displayOrder = parseInt((formData.get("displayOrder") as string) || "1", 10);

  if (!role) return { success: false, error: "Role title is required." };
  if (!organization) return { success: false, error: "Organization name is required." };

  const description = descriptionRaw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const skills = skillsRaw
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

  try {
    await updateExperienceInDb(expId, {
      organization,
      role,
      employmentType: employmentType || "Independent",
      startDate,
      endDate: currentRole ? "Present" : endDate,
      currentRole,
      location,
      description,
      skills,
      displayOrder: isNaN(displayOrder) ? 1 : displayOrder,
    });
    revalidatePath("/experience");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to update experience.";
    return { success: false, error: msg };
  }
}

/**
 * Delete Experience Entry Action
 */
export async function deleteExperienceAction(expId: string): Promise<ActionResult> {
  const auth = await verifyAdminSession();
  if (!auth.isAdmin) {
    return { success: false, error: auth.error || "Unauthorized: Administrator access required." };
  }

  try {
    await deleteExperienceFromDb(expId);
    revalidatePath("/experience");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to delete experience.";
    return { success: false, error: msg };
  }
}

/**
 * ========================================================
 * RESUME MANAGEMENT ACTIONS
 * ========================================================
 */

/**
 * Upload or Replace Active Resume Action
 * Server-side validated for file size (<=10MB) and %PDF- magic bytes signature.
 */
export async function uploadResumeAction(
  formData: FormData
): Promise<ActionResult<ResumeDisplay>> {
  const auth = await verifyAdminSession();
  if (!auth.isAdmin) {
    return {
      success: false,
      error: auth.error || "Unauthorized: Administrator access required to manage resume.",
    };
  }

  if (!isCloudinaryConfigured()) {
    return {
      success: false,
      error: "Cloudinary credentials are not configured in environment variables.",
    };
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { success: false, error: "Please select a valid PDF resume file to upload." };
  }

  // Read buffer for strict magic bytes verification
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const fileValidation = validateResumeFile(file, buffer);
  if (!fileValidation.valid) {
    return { success: false, error: fileValidation.error };
  }

  try {
    // 1. Fetch current active resume if any (for cleanup after successful upload)
    const oldResume = await getActiveResumeDoc();

    // 2. Upload to Cloudinary under 'portfolio/resume'
    const uploadResult = await uploadResumeAsset(file);

    // 3. Save new resume record to MongoDB Atlas
    const cleanFilename = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .slice(0, 40) + ".pdf";

    const savedResume = await saveActiveResumeInDb({
      filename: file.name,
      cleanFilename,
      cloudinaryPublicId: uploadResult.publicId,
      secureUrl: uploadResult.secureUrl,
      resourceType: uploadResult.resourceType,
      format: uploadResult.format || "pdf",
      bytes: uploadResult.bytes || file.size,
      mimeType: "application/pdf",
    });

    // 4. Clean up previous asset in Cloudinary if it existed
    if (oldResume?.cloudinaryPublicId && oldResume.cloudinaryPublicId !== uploadResult.publicId) {
      const type = oldResume.resourceType === "raw" ? "raw" : "image";
      deleteCloudinaryAsset(oldResume.cloudinaryPublicId, type).catch((cleanupErr) => {
        console.warn("[Cloudinary Resume Cleanup] Could not delete old asset:", cleanupErr);
      });
    }

    // 5. Revalidate affected pages
    revalidatePath("/", "page");
    revalidatePath("/about", "page");
    revalidatePath("/admin", "page");

    return {
      success: true,
      data: savedResume,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[Resume Action] Upload failed:", errorMsg);
    return {
      success: false,
      error: errorMsg || "Failed to upload and publish resume.",
    };
  }
}

/**
 * Delete Active Resume Action
 * Removes the database record and cleans up the Cloudinary asset.
 */
export async function deleteResumeAction(): Promise<ActionResult> {
  const auth = await verifyAdminSession();
  if (!auth.isAdmin) {
    return {
      success: false,
      error: auth.error || "Unauthorized: Administrator access required to delete resume.",
    };
  }

  try {
    // 1. Retrieve current active resume for publicId
    const oldResume = await getActiveResumeDoc();
    if (!oldResume) {
      return { success: true };
    }

    // 2. Delete database record
    const dbResult = await deleteActiveResumeFromDb();
    if (!dbResult.success) {
      return { success: false, error: dbResult.error || "Failed to delete resume record." };
    }

    // 3. Clean up Cloudinary asset
    if (oldResume.cloudinaryPublicId) {
      const type = oldResume.resourceType === "raw" ? "raw" : "image";
      await deleteCloudinaryAsset(oldResume.cloudinaryPublicId, type);
    }

    // 4. Revalidate affected pages
    revalidatePath("/", "page");
    revalidatePath("/about", "page");
    revalidatePath("/admin", "page");

    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[Resume Action] Deletion failed:", errorMsg);
    return {
      success: false,
      error: errorMsg || "Failed to delete resume.",
    };
  }
}



