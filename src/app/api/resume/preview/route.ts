import { NextResponse, connection } from "next/server";
import { getActiveResumeDoc } from "@/lib/mongodb/resume";
import { getPrivateResumeDownloadUrl } from "@/lib/cloudinary/client";
import fs from "fs";
import path from "path";

export async function GET(req: Request) {
  await connection();
  try {
    const resume = await getActiveResumeDoc();
    const staticResumePath = path.join(process.cwd(), "public", "Resume.pdf");
    const hasLocalFile = fs.existsSync(staticResumePath);

    const filename = resume?.filename || "Manish_Kumar_Resume.pdf";
    const cleanFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");

    // 1. If local static resume exists in public/ and no remote URL configured, serve inline directly
    if (hasLocalFile && (!resume?.secureUrl || !resume.secureUrl.startsWith("http") || resume.secureUrl.startsWith("/"))) {
      const fileBuffer = fs.readFileSync(staticResumePath);
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${cleanFilename}"`,
          "Content-Length": String(fileBuffer.length),
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
      });
    }

    // 2. If Cloudinary publicId is available, use authenticated signed download URL (bypasses ACL / 401 restrictions)
    if (resume?.cloudinaryPublicId) {
      try {
        const privateUrl = getPrivateResumeDownloadUrl(
          resume.cloudinaryPublicId,
          resume.format || "pdf",
          resume.resourceType || "image"
        );
        if (privateUrl) {
          const response = await fetch(privateUrl);
          if (response.ok && response.body) {
            return new NextResponse(response.body, {
              status: 200,
              headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="${cleanFilename}"`,
                ...(resume.bytes ? { "Content-Length": String(resume.bytes) } : {}),
                "Cache-Control": "public, max-age=1800, stale-while-revalidate=86400",
              },
            });
          }
        }
      } catch (cldErr) {
        console.warn("[Resume Preview] Authenticated Cloudinary fetch failed:", cldErr);
      }
    }

    // 3. If standard remote CDN URL
    if (resume?.secureUrl && resume.secureUrl.startsWith("http")) {
      try {
        const response = await fetch(resume.secureUrl, {
          headers: {
            Accept: "application/pdf,*/*",
          },
        });

        if (response.ok && response.body) {
          return new NextResponse(response.body, {
            status: 200,
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `inline; filename="${cleanFilename}"`,
              ...(resume.bytes ? { "Content-Length": String(resume.bytes) } : {}),
              "Cache-Control": "public, max-age=1800, stale-while-revalidate=86400",
            },
          });
        }
      } catch (fetchErr) {
        console.warn("[Resume Preview] Remote fetch failed, falling back to local/static file:", fetchErr);
      }
    }

    // 4. Fallback to local file if present on disk
    if (hasLocalFile) {
      const fileBuffer = fs.readFileSync(staticResumePath);
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${cleanFilename}"`,
          "Content-Length": String(fileBuffer.length),
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
      });
    }

    // 5. Fallback to static public CDN route /Resume.pdf
    try {
      const origin = new URL(req.url).origin;
      const staticResponse = await fetch(`${origin}/Resume.pdf`);
      if (staticResponse.ok && staticResponse.body) {
        return new NextResponse(staticResponse.body, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${cleanFilename}"`,
            "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
          },
        });
      }
    } catch {
      // ignore
    }

    // 6. Direct redirect fallback to /Resume.pdf
    return NextResponse.redirect(new URL("/Resume.pdf", req.url));
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[Resume Preview] Failed to process preview:", errorMsg);

    const fallbackPath = path.join(process.cwd(), "public", "Resume.pdf");
    if (fs.existsSync(fallbackPath)) {
      const fileBuffer = fs.readFileSync(fallbackPath);
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="Manish_Kumar_Resume.pdf"`,
          "Content-Length": String(fileBuffer.length),
        },
      });
    }

    return NextResponse.redirect(new URL("/Resume.pdf", req.url));
  }
}
