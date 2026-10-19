"use client";

import React, { useActionState, useTransition } from "react";
import { loginAdminAction } from "../actions";
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";

interface LoginFormProps {
  isConfigured: boolean;
}

export function LoginForm({ isConfigured }: LoginFormProps) {
  const [state, formAction] = useActionState(loginAdminAction, null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <form onSubmit={handleSubmit} suppressHydrationWarning className="space-y-4">
      {state?.error && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-red-950/40 border border-red-600/40 text-red-300 text-xs flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
          <span className="leading-relaxed">{state.error}</span>
        </div>
      )}

      {/* Email Input */}
      <div>
        <label
          htmlFor="admin-email"
          className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
        >
          Administrator Email
        </label>
        <div className="relative">
          <Mail
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="admin-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            suppressHydrationWarning
            disabled={!isConfigured || isPending}
            placeholder="admin@example.com"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white placeholder-slate-500 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:opacity-50 min-h-[44px]"
          />
        </div>
      </div>

      {/* Password Input */}
      <div>
        <label
          htmlFor="admin-password"
          className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
        >
          Password
        </label>
        <div className="relative">
          <Lock
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            suppressHydrationWarning
            disabled={!isConfigured || isPending}
            placeholder="••••••••••••"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white placeholder-slate-500 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:opacity-50 min-h-[44px]"
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        suppressHydrationWarning
        disabled={!isConfigured || isPending}
        className="w-full mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-[0_0_20px_rgba(229,9,20,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px] cursor-pointer"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            <span>Verifying Credentials...</span>
          </>
        ) : (
          <>
            <span>Authenticate to Dashboard</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  );
}
