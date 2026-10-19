import { NextResponse, connection } from "next/server";
import { getActiveResumeDoc } from "@/lib/mongodb/resume";
import fs from "fs";
import path from "path";

export async function GET() {
  await connection();
  try {
    const resume = await getActiveResumeDoc();
    const staticResumePath = path.join(process.cwd(), "public", "Resume.pdf");
    const hasLocalFile = fs.existsSync(staticResumePath);

    const filename = resume?.filename || "Manish_Kumar_Resume.pdf";
    const cleanFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");

    // 1. If local static resume exists in public/, serve inline directly
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

    // 2. If remote CDN URL (e.g. Cloudinary)
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
        console.warn("[Resume Preview] Remote fetch failed, falling back to local file:", fetchErr);
      }
    }

    // 3. Fallback to local file if fetch failed or returned non-ok (e.g. 401 Unauthorized from Cloudinary)
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

    return new NextResponse(
      JSON.stringify({
        error: "No active resume document is currently published.",
        code: "RESUME_NOT_FOUND",
      }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
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

    return new NextResponse(
      JSON.stringify({ error: "Failed to preview resume.", details: errorMsg }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
