"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log sanitized error message without exposing sensitive credentials
    console.error("[Application Error Boundary Caught]:", error.message);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-16 px-4">
      <Container size="sm" className="text-center">
        <div className="p-8 sm:p-12 rounded-3xl glass-card-elevated border border-white/10 relative overflow-hidden shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-950/40 border border-red-600/30 flex items-center justify-center text-red-500 mb-6 shadow-[0_0_25px_-5px_rgba(229,9,20,0.4)]">
            <AlertTriangle className="w-8 h-8" aria-hidden="true" />
          </div>

          <span className="text-xs font-mono uppercase tracking-widest text-red-400 font-semibold">
            System Alert • Render Interrupted
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2 mb-4">
            Something went wrong
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed mb-8">
            An unexpected application error occurred while preparing this view. The system recovered safely to protect session state.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-[0_0_20px_rgba(229,9,20,0.4)] transition-all min-h-[44px] cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Action</span>
            </button>

            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-semibold text-xs transition-colors min-h-[44px]"
            >
              <Home className="w-4 h-4 text-slate-400" />
              <span>Return to Homepage</span>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
