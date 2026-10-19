/**
 * Safe MongoDB Atlas & Cloudinary Configuration Detector
 * STRICTLY SERVER-SIDE.
 * 
 * Inspects server-only environment variables:
 * - MONGODB_URI
 * - CLOUDINARY_CLOUD_NAME
 * - CLOUDINARY_API_KEY
 * - CLOUDINARY_API_SECRET
 * - ADMIN_EMAILS
 * 
 * Never leaks sensitive connection strings or API secrets to client code.
 */

export interface BackendConfigStatus {
  isMongoConfigured: boolean;
  isCloudinaryConfigured: boolean;
  isAdminConfigured: boolean;
  isFullyConfigured: boolean;
  statusMessage: string;
  missingVariables: string[];
}

export function isMongoConfigured(): boolean {
  const uri = process.env.MONGODB_URI;
  return Boolean(
    uri &&
      !uri.includes("<username>") &&
      !uri.includes("your-mongodb-uri-placeholder") &&
      uri.startsWith("mongodb")
  );
}

export function isCloudinaryConfigured(): boolean {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  return Boolean(
    cloudName &&
      !cloudName.includes("your_cloud_name") &&
      apiKey &&
      !apiKey.includes("your_api_key") &&
      apiSecret &&
      !apiSecret.includes("your_api_secret")
  );
}

export function isAdminConfigured(): boolean {
  const adminEmails = process.env.ADMIN_EMAILS;
  return Boolean(adminEmails && adminEmails.trim().length > 0);
}

export function getBackendConfigStatus(): BackendConfigStatus {
  const missing: string[] = [];

  const mongoOk = isMongoConfigured();
  if (!mongoOk) missing.push("MONGODB_URI");

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName || cloudName.includes("your_cloud_name")) missing.push("CLOUDINARY_CLOUD_NAME");

  const apiKey = process.env.CLOUDINARY_API_KEY;
  if (!apiKey || apiKey.includes("your_api_key")) missing.push("CLOUDINARY_API_KEY");

  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!apiSecret || apiSecret.includes("your_api_secret")) missing.push("CLOUDINARY_API_SECRET");

  const adminOk = isAdminConfigured();
  if (!adminOk) missing.push("ADMIN_EMAILS");

  const cloudinaryOk = isCloudinaryConfigured();
  const fullyConfigured = mongoOk && cloudinaryOk && adminOk;

  let statusMessage = "Backend environment credentials (MongoDB Atlas & Cloudinary) are active.";
  if (!fullyConfigured) {
    if (!mongoOk && !cloudinaryOk) {
      statusMessage = "MongoDB Atlas and Cloudinary are not configured. Using local fallback data.";
    } else if (!mongoOk) {
      statusMessage = "MongoDB Atlas is not configured. Falling back to local verified certificates.";
    } else if (!cloudinaryOk) {
      statusMessage = "Cloudinary storage credentials are missing or incomplete. File uploads are disabled.";
    } else if (!adminOk) {
      statusMessage = "ADMIN_EMAILS allowlist is not configured. Admin access is disabled.";
    }
  }

  return {
    isMongoConfigured: mongoOk,
    isCloudinaryConfigured: cloudinaryOk,
    isAdminConfigured: adminOk,
    isFullyConfigured: fullyConfigured,
    statusMessage,
    missingVariables: missing,
  };
}
