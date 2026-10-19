import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { verifyAdminSession } from "@/lib/auth/admin";
import { getBackendConfigStatus } from "@/lib/mongodb/config";
import { getCertificates } from "@/lib/mongodb/certificates";
import { getProjects } from "@/lib/mongodb/projects";
import { getPortfolioContent } from "@/lib/mongodb/content";
import { getActiveResume } from "@/lib/mongodb/resume";
import { AdminDashboardView } from "./AdminDashboardView";

export const metadata: Metadata = {
  title: "Admin Dashboard | Portfolio CMS",
  description: "Secure administrative certificate, project, and content management dashboard.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export const instant = false;

export default async function AdminDashboardPage() {
  await connection();
  // Enforce server-side authorization guard
  const auth = await verifyAdminSession();

  if (!auth.isAdmin) {
    redirect("/admin/login");
  }

  const [certificates, projects, content, resume] = await Promise.all([
    getCertificates(),
    getProjects(),
    getPortfolioContent(),
    getActiveResume(),
  ]);
  const configStatus = getBackendConfigStatus();

  return (
    <div className="py-8 sm:py-12">
      <AdminDashboardView
        userEmail={auth.user?.email || "admin"}
        initialCertificates={certificates}
        initialProjects={projects}
        initialContent={content}
        initialResume={resume}
        isConfigured={configStatus.isMongoConfigured}
        configStatus={configStatus}
      />
    </div>
  );
}
