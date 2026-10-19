import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { verifyAdminSession } from "@/lib/auth/admin";
import { getBackendConfigStatus } from "@/lib/mongodb/config";
import { LoginForm } from "./LoginForm";
import { Container } from "@/components/ui/Container";
import { Shield, KeyRound, AlertTriangle } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Portal Authentication",
  description: "Secure administrator sign-in for portfolio content management.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export const instant = false;

export default async function AdminLoginPage() {
  await connection();
  // If already authenticated and verified as admin, redirect directly to dashboard
  const auth = await verifyAdminSession();
  if (auth.isAdmin) {
    redirect("/admin");
  }

  const configStatus = getBackendConfigStatus();

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <Container size="sm" className="w-full">
        <div className="p-6 sm:p-8 rounded-3xl glass-card-elevated border border-white/10 shadow-2xl relative overflow-hidden">
          {/* Top ambient glow */}
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          {/* Header */}
          <div className="text-center mb-8 relative z-10">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-950/40 border border-red-600/30 flex items-center justify-center text-red-500 mb-4 shadow-[0_0_20px_rgba(229,9,20,0.25)]">
              <KeyRound className="w-7 h-7" aria-hidden="true" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Administrator Login
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">
              Sign in with your authorized administrator credentials to manage portfolio certificates and content.
            </p>
          </div>

          {/* Notice when Backend credentials are not configured */}
          {!configStatus.isMongoConfigured && (
            <div className="mb-6 p-4 rounded-xl bg-amber-950/30 border border-amber-600/30 text-amber-300 text-xs leading-relaxed space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
                <span>Backend Configuration Notice</span>
              </div>
              <p>
                MongoDB Atlas connection is not yet configured in{" "}
                <code className="font-mono text-amber-200 bg-black/40 px-1 py-0.5 rounded">.env.local</code>.
                Refer to <code className="font-mono text-amber-200 bg-black/40 px-1 py-0.5 rounded">.env.example</code> for required keys:
              </p>
              <ul className="list-disc list-inside font-mono text-[11px] text-amber-200/90 pl-1 space-y-0.5">
                <li>MONGODB_URI</li>
                <li>ADMIN_EMAILS</li>
                <li>CLOUDINARY_CLOUD_NAME</li>
                <li>CLOUDINARY_API_KEY</li>
                <li>CLOUDINARY_API_SECRET</li>
              </ul>
            </div>
          )}

          {/* Login Form */}
          <LoginForm isConfigured={configStatus.isMongoConfigured && configStatus.isAdminConfigured} />

          {/* Footer Security Note */}
          <div className="mt-8 pt-6 border-t border-white/[0.08] text-center text-[11px] text-slate-500 flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Shield className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              <span>Protected by MongoDB Session Auth & Server-Side Allowlist</span>
            </div>
            <Link
              href="/"
              className="text-slate-400 hover:text-red-400 transition-colors p-1"
            >
              ← Return to Public Portfolio
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
