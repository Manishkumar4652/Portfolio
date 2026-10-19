import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { isCloudinaryConfigured } from "@/lib/mongodb/config";
import type { CertificateResourceType } from "@/lib/mongodb/types";

// Maximum file size: 10 MB
export const MAX_CERTIFICATE_FILE_SIZE = 10 * 1024 * 1024;

// Allowed MIME types
export const ALLOWED_CERTIFICATE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
];

/**
 * Configure Cloudinary server-side SDK using environment variables
 */
function getCloudinary() {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary credentials are not configured in environment variables. Check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    );
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  return cloudinary;
}

export interface UploadResult {
  publicId: string;
  secureUrl: string;
  resourceType: CertificateResourceType;
  format?: string;
  bytes: number;
}

/**
 * Validates file buffer, size, and MIME type on the server.
 */
export function validateCertificateFile(file: File): { valid: boolean; error?: string } {
  if (!file || file.size === 0) {
    return { valid: false, error: "No file provided or file is empty." };
  }

  if (file.size > MAX_CERTIFICATE_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds the 10MB limit (received ${(file.size / (1024 * 1024)).toFixed(2)}MB).`,
    };
  }

  if (!ALLOWED_CERTIFICATE_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported file type (${file.type}). Allowed formats: JPG, PNG, WebP, SVG, and PDF.`,
    };
  }

  return { valid: true };
}

/**
 * Uploads a certificate asset (Image or PDF) to Cloudinary.
 * Stores files under the 'portfolio/certificates' folder.
 */
export async function uploadCertificateAsset(file: File): Promise<UploadResult> {
  const validation = validateCertificateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const cld = getCloudinary();
  const isPdf = file.type === "application/pdf";
  const resourceTypeChoice: "auto" | "image" = isPdf ? "auto" : "image";

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const cleanFilename = file.name
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .slice(0, 30);
  const publicId = `cert_${Date.now()}_${cleanFilename}`;

  return new Promise<UploadResult>((resolve, reject) => {
    const uploadStream = cld.uploader.upload_stream(
      {
        folder: "portfolio/certificates",
        public_id: publicId,
        resource_type: resourceTypeChoice,
        overwrite: true,
      },
      (error, result?: UploadApiResponse) => {
        if (error || !result) {
          console.error("Cloudinary upload failed:", error);
          let errorMsg = error?.message || "Failed to upload asset to Cloudinary storage.";
          if (errorMsg.includes("403") || errorMsg.includes("missing permissions") || (error as { http_code?: number })?.http_code === 403) {
            errorMsg = "Cloudinary Error (HTTP 403): Aapki Cloudinary API Key ke paas 'create' (file upload) permission nahi hai. Kripya Cloudinary Console > Settings (⚙️) > Access Keys me jaakar API Key ko 'All / Full permissions' (create, read, write) allow karein.";
          }
          return reject(
            new Error(
              errorMsg.startsWith("Cloudinary Error")
                ? errorMsg
                : `Cloudinary storage upload error: ${errorMsg}`
            )
          );
        }

        const normalizedResourceType: CertificateResourceType =
          result.resource_type === "raw" ? "raw" : "image";

        resolve({
          publicId: result.public_id,
          secureUrl: result.secure_url,
          resourceType: normalizedResourceType,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Safely deletes an asset from Cloudinary by its publicId.
 * Prevents errors from bubbling if asset is already deleted.
 */
export async function deleteCloudinaryAsset(
  publicId: string | null | undefined,
  resourceType: CertificateResourceType | null | undefined = "image"
): Promise<{ success: boolean; error?: string }> {
  if (!publicId) return { success: true };

  try {
    const cld = getCloudinary();
    const type = resourceType === "raw" ? "raw" : "image";
    const result = await cld.uploader.destroy(publicId, { resource_type: type });

    if (result.result === "ok" || result.result === "not found") {
      return { success: true };
    }

    return { success: false, error: `Cloudinary response: ${result.result}` };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`Failed to delete Cloudinary asset ${publicId}:`, errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Uploads a project thumbnail asset to Cloudinary under 'portfolio/projects'.
 */
export async function uploadProjectThumbnail(file: File): Promise<UploadResult> {
  const validation = validateCertificateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const cld = getCloudinary();
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const cleanFilename = file.name
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .slice(0, 30);
  const publicId = `proj_${Date.now()}_${cleanFilename}`;

  return new Promise<UploadResult>((resolve, reject) => {
    const uploadStream = cld.uploader.upload_stream(
      {
        folder: "portfolio/projects",
        public_id: publicId,
        resource_type: "image",
        overwrite: true,
      },
      (error, result?: UploadApiResponse) => {
        if (error || !result) {
          console.error("Cloudinary project upload failed:", error);
          let errorMsg = error?.message || "Failed to upload asset to Cloudinary storage.";
          if (errorMsg.includes("403") || errorMsg.includes("missing permissions") || (error as { http_code?: number })?.http_code === 403) {
            errorMsg = "Cloudinary Error (HTTP 403): Missing upload permissions on API Key.";
          }
          return reject(
            new Error(
              errorMsg.startsWith("Cloudinary Error")
                ? errorMsg
                : `Cloudinary storage upload error: ${errorMsg}`
            )
          );
        }

        resolve({
          publicId: result.public_id,
          secureUrl: result.secure_url,
          resourceType: "image",
          format: result.format,
          bytes: result.bytes,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

export const MAX_RESUME_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * Checks if a buffer begins with the magic bytes for a PDF file (%PDF-)
 */
export function isPdfSignature(buffer: Buffer): boolean {
  if (buffer.length < 5) return false;
  return (
    buffer[0] === 0x25 && // %
    buffer[1] === 0x50 && // P
    buffer[2] === 0x44 && // D
    buffer[3] === 0x46 && // F
    buffer[4] === 0x2d    // -
  );
}

/**
 * Validates a Resume file buffer, size, and magic bytes signature.
 */
export function validateResumeFile(
  file: File,
  buffer: Buffer
): { valid: boolean; error?: string } {
  if (!file || file.size === 0) {
    return { valid: false, error: "No file provided or file is empty." };
  }

  if (file.size > MAX_RESUME_FILE_SIZE) {
    return {
      valid: false,
      error: `Resume file exceeds 10MB limit (received ${(file.size / (1024 * 1024)).toFixed(2)}MB).`,
    };
  }

  // Check magic bytes header
  if (!isPdfSignature(buffer)) {
    return {
      valid: false,
      error: "Invalid file format: File signature does not match a valid PDF document (%PDF-).",
    };
  }

  return { valid: true };
}

/**
 * Uploads a resume PDF to Cloudinary under 'portfolio/resume'.
 */
export async function uploadResumeAsset(file: File): Promise<UploadResult> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const validation = validateResumeFile(file, buffer);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const cld = getCloudinary();
  const cleanFilename = file.name
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .slice(0, 30);
  const publicId = `resume_${Date.now()}_${cleanFilename}`;

  return new Promise<UploadResult>((resolve, reject) => {
    const uploadStream = cld.uploader.upload_stream(
      {
        folder: "portfolio/resume",
        public_id: publicId,
        resource_type: "auto",
        overwrite: true,
      },
      (error, result?: UploadApiResponse) => {
        if (error || !result) {
          console.error("Cloudinary resume upload failed:", error);
          let errorMsg = error?.message || "Failed to upload resume to Cloudinary storage.";
          if (
            errorMsg.includes("403") ||
            errorMsg.includes("missing permissions") ||
            (error as { http_code?: number })?.http_code === 403
          ) {
            errorMsg = "Cloudinary Error (HTTP 403): Missing upload permissions on API Key.";
          }
          return reject(
            new Error(
              errorMsg.startsWith("Cloudinary Error")
                ? errorMsg
                : `Cloudinary storage upload error: ${errorMsg}`
            )
          );
        }

        const normalizedResourceType: CertificateResourceType =
          result.resource_type === "raw" ? "raw" : "image";

        resolve({
          publicId: result.public_id,
          secureUrl: result.secure_url,
          resourceType: normalizedResourceType,
          format: result.format || "pdf",
          bytes: result.bytes || file.size,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

