import type { ObjectId } from "mongodb";

export type CertificateCategory =
  | "Programming & Computer Science"
  | "Data Structures & Algorithms"
  | "Artificial Intelligence & Tools"
  | "Systems & Tools"
  | "Cloud & DevOps";

export type CertificateResourceType = "image" | "raw";

/**
 * MongoDB Certificate Document Interface
 * Represents the persistent schema in MongoDB Atlas collection 'certificates'
 */
export interface CertificateDocument {
  _id?: ObjectId;
  id?: string;
  title: string;
  issuer: string;
  description: string | null;
  category: CertificateCategory;
  issueDate: string | null;
  publicId: string | null;
  secureUrl: string | null;
  resourceType: CertificateResourceType | null;
  featured: boolean;
  displayOrder: number;
  skills: string[];
  verificationUrl: string | null;
  credentialId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Unified frontend display model compatible with existing UI cards,
 * admin dashboard, search, and filters.
 */
export interface CertificateDisplay {
  id: string;
  title: string;
  issuer: string;
  issueDate: string | null;
  category: CertificateCategory;
  skills: string[];
  description: string | null;
  filePath: string | null;
  fileType: "image" | "pdf" | null;
  fileUrl: string | null;
  previewImageUrl?: string | null;
  featured: boolean;
  sortOrder: number;
  displayOrder: number;
  verificationUrl: string | null;
  credentialId: string | null;
  publicId: string | null;
  secureUrl: string | null;
  resourceType: CertificateResourceType | null;
  source: "mongodb" | "local" | "supabase";
}

/**
 * Admin User Document in MongoDB Atlas 'admin_users' collection
 */
export interface AdminUserDocument {
  _id?: ObjectId;
  email: string;
  passwordHash: string;
  salt: string;
  role: "admin" | "superadmin";
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Admin Session Document in MongoDB Atlas 'admin_sessions' collection
 */
export interface AdminSessionDocument {
  _id?: ObjectId;
  sessionId: string;
  email: string;
  createdAt: Date;
  expiresAt: Date;
}

export type ProjectStatus = "completed" | "in-development" | "planned";

export type ProjectCategory =
  | "Web Application"
  | "AI / ML"
  | "Systems & Tools"
  | "Mobile App"
  | "Cloud & DevOps"
  | string;

/**
 * MongoDB Project Document Interface
 * Represents the persistent schema in MongoDB Atlas collection 'projects'
 */
export interface ProjectDocument {
  _id?: ObjectId;
  id?: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  technologies: string[];
  category: string;
  thumbnailUrl: string | null;
  cloudinaryPublicId: string | null;
  cloudinaryResourceType: CertificateResourceType | null;
  githubUrl: string | null;
  liveDemoUrl: string | null;
  status: ProjectStatus;
  featured: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Unified frontend display model for projects
 */
export interface ProjectDisplay {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  technologies: string[];
  category: string;
  thumbnailUrl: string | null;
  cloudinaryPublicId: string | null;
  cloudinaryResourceType: CertificateResourceType | null;
  githubUrl: string | null;
  liveDemoUrl: string | null;
  status: ProjectStatus;
  featured: boolean;
  displayOrder: number;
  source: "mongodb" | "local";
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Phase 6: Dynamic Content Management Types
 */

export interface HeroContent {
  eyebrow: string;
  heading: string;
  highlightText: string;
  subtitle: string;
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  secondaryCtaLabel: string;
  secondaryCtaUrl: string;
  tertiaryCtaLabel: string;
  tertiaryCtaUrl: string;
}

export interface AboutContent {
  introduction: string;
  biography: string;
  careerObjective: string;
  location?: string;
  academicsText?: string;
  problemSolvingText?: string;
}

export interface SkillItem {
  id: string;
  name: string;
  category: string;
  proficiency?: string;
  featured: boolean;
  displayOrder: number;
}

export type EmploymentType =
  | "Internship"
  | "Independent"
  | "Full-time"
  | "Part-time"
  | "Contract";

export interface ExperienceItem {
  id: string;
  organization: string;
  role: string;
  employmentType: EmploymentType;
  startDate: string;
  endDate: string;
  currentRole: boolean;
  location?: string;
  description: string[];
  skills: string[];
  displayOrder: number;
}

export interface PortfolioContentDocument {
  _id?: ObjectId;
  key: "portfolio_global";
  hero: HeroContent;
  about: AboutContent;
  skills: SkillItem[];
  experiences: ExperienceItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PortfolioContentDisplay {
  hero: HeroContent;
  about: AboutContent;
  skills: SkillItem[];
  experiences: ExperienceItem[];
  updatedAt?: string;
  source: "mongodb" | "local";
}

/**
 * MongoDB Resume Document Interface
 * Persistent schema in MongoDB Atlas collection 'resumes'
 */
export interface ResumeDocument {
  _id?: ObjectId;
  id: string; // stable identifier e.g. "active_resume"
  isActive: boolean;
  filename: string;
  cleanFilename: string;
  cloudinaryPublicId: string;
  secureUrl: string;
  resourceType: "raw" | "image" | "auto";
  format: string; // "pdf"
  bytes: number;
  mimeType: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Unified frontend display model for active resume
 */
export interface ResumeDisplay {
  id: string;
  filename: string;
  fileSizeFormatted: string;
  bytes: number;
  uploadDate: string;
  updatedAt: string;
  downloadUrl: string;
  previewUrl: string;
  isActive: boolean;
  secureUrl: string;
}

