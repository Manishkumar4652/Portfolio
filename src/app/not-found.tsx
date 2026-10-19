import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Home, FolderGit2, AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-16 px-4">
      <Container size="sm" className="text-center">
        <div className="p-8 sm:p-12 rounded-3xl glass-card-elevated border border-white/10 relative overflow-hidden shadow-2xl">
          {/* Ambient Glow */}
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-950/40 border border-red-600/30 flex items-center justify-center text-red-500 mb-6 shadow-[0_0_25px_-5px_rgba(229,9,20,0.4)]">
            <AlertCircle className="w-8 h-8" aria-hidden="true" />
          </div>

          <span className="text-xs font-mono uppercase tracking-widest text-red-400 font-semibold">
            Error 404 • Resource Missing
          </span>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2 mb-4">
            Page Not Found
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-md mx-auto leading-relaxed mb-8">
            The requested page does not exist or may have been relocated. Use the navigation below to continue exploring the portfolio.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-[0_0_20px_rgba(229,9,20,0.4)] transition-all min-h-[44px]"
            >
              <Home className="w-4 h-4" />
              <span>Back to Homepage</span>
            </Link>

            <Link
              href="/projects"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-semibold text-xs transition-colors min-h-[44px]"
            >
              <FolderGit2 className="w-4 h-4 text-red-500" />
              <span>Explore Projects</span>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
