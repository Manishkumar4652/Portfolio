"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { Menu, X, ArrowUpRight, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "../ui/Container";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Handle Escape key to close mobile menu
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Accessible Skip to Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#e50914] focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#040405]/80 border-b border-white/[0.08] transition-colors duration-200">
        <Container size="lg">
          <div className="flex h-16 items-center justify-between">
            {/* Brand Logo */}
            <Link
              href="/"
              className="group flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:ring-offset-[#040405] rounded-lg p-1"
              aria-label="Manish Kumar Portfolio - Return to Homepage"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center font-bold text-white text-base shadow-[0_0_15px_rgba(229,9,20,0.4)] group-hover:shadow-[0_0_20px_rgba(229,9,20,0.7)] transition-all">
                MK
              </div>
              <div className="flex flex-col">
                <span
                  className="font-semibold text-sm sm:text-base tracking-tight text-white group-hover:text-red-400 transition-colors"
                  suppressHydrationWarning
                >
                  {siteConfig.author}
                </span>
                <span
                  className="text-xs text-slate-400 hidden sm:inline-block"
                  suppressHydrationWarning
                >
                  {siteConfig.role}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav
              className="hidden lg:flex items-center gap-1 xl:gap-2"
              aria-label="Main Navigation"
            >
              {siteConfig.navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600",
                      isActive
                        ? "text-white bg-white/5 shadow-[inset_0_-2px_0_0_#e50914]"
                        : "text-slate-300 hover:text-white hover:bg-white/[0.04]"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Header Right Action (Contact and Resume) */}
            <div className="hidden lg:flex items-center gap-2.5">
              <a
                href="/api/resume/download"
                download
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                aria-label="Download verified resume PDF"
              >
                <FileText className="w-3.5 h-3.5 text-red-500" aria-hidden="true" />
                <span>Resume</span>
              </a>

              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-red-600/10 text-red-400 border border-red-600/30 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-[0_0_15px_-3px_rgba(229,9,20,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              >
                <span>Get in touch</span>
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="flex lg:hidden">
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setMobileMenuOpen(true)}
                className="p-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer transition-colors"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation"
                aria-label="Open navigation menu"
              >
                <Menu className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        </Container>
      </header>

      {/* Mobile Slide-in Drawer Backdrop Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/75 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Navigation Drawer - Slides in from the Right */}
      <aside
        id="mobile-navigation"
        aria-label="Mobile Navigation"
        aria-hidden={!mobileMenuOpen}
        className={cn(
          "fixed top-0 right-0 bottom-0 z-50 w-[85%] sm:w-[380px] max-w-full bg-[#08090c]/98 backdrop-blur-2xl border-l border-white/10 shadow-[-20px_0_50px_rgba(0,0,0,0.85)] flex flex-col transition-transform duration-300 ease-out lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Soft Crimson Ambient Glow in Drawer */}
        <div
          className="pointer-events-none absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl -z-10"
          aria-hidden="true"
        />

        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/[0.08] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center font-bold text-white text-xs shadow-[0_0_12px_rgba(229,9,20,0.5)]">
              MK
            </div>
            <span className="font-bold text-sm tracking-tight text-white">
              Navigation Menu
            </span>
          </div>

          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Drawer Links List (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {siteConfig.navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all group min-h-[46px]",
                  isActive
                    ? "bg-red-950/40 text-red-400 border border-red-800/40 font-semibold shadow-[0_0_15px_-3px_rgba(229,9,20,0.3)]"
                    : "text-slate-300 hover:bg-white/5 hover:text-white hover:translate-x-1"
                )}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{item.name}</span>
                  {item.description && (
                    <span className="text-[11px] text-slate-400 font-normal mt-0.5 line-clamp-1">
                      {item.description}
                    </span>
                  )}
                </div>
                <ArrowUpRight
                  className={cn(
                    "w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
                    isActive ? "text-red-400" : "text-slate-500"
                  )}
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-white/[0.08] bg-[#050608]/80 space-y-2.5 shrink-0">
          <a
            href="/api/resume/download"
            download
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-medium text-xs sm:text-sm transition-colors min-h-[44px]"
            onClick={() => setMobileMenuOpen(false)}
          >
            <FileText className="w-4 h-4 text-red-500" aria-hidden="true" />
            <span>Download Resume (PDF)</span>
          </a>

          <Link
            href="/contact"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold text-xs sm:text-sm shadow-[0_0_20px_rgba(229,9,20,0.4)] hover:brightness-110 transition-all min-h-[44px]"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span>Contact Manish</span>
            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </aside>
    </>
  );
}
