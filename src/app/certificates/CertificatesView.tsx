"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import type { CertificateDisplay } from "@/lib/mongodb/types";
import { mapLocalToDisplay } from "@/lib/mongodb/shared";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import {
  ArrowLeft,
  Award,
  ShieldCheck,
  ExternalLink,
  Check,
  FileText,
  Search,
  X,
  RotateCcw,
  Sparkles,
  Maximize2,
  BookOpen,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageModalState {
  isOpen: boolean;
  title: string;
  imageSrc: string;
  issuer: string;
}

interface CertificatesViewProps {
  initialCertificates?: CertificateDisplay[];
}

export function CertificatesView({ initialCertificates }: CertificatesViewProps) {
  // Use passed certificates from MongoDB Atlas or fallback to personalData
  const certificates: CertificateDisplay[] = useMemo(() => {
    if (initialCertificates && initialCertificates.length > 0) {
      return initialCertificates;
    }
    return mapLocalToDisplay();
  }, [initialCertificates]);

  const hasCerts = certificates.length > 0;

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Lightweight modal state for image preview
  const [modalState, setModalState] = useState<ImageModalState | null>(null);

  // Close modal handler
  const closeModal = useCallback(() => {
    setModalState(null);
  }, []);

  // Handle ESC key to close modal & prevent background scrolling
  useEffect(() => {
    if (!modalState?.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [modalState?.isOpen, closeModal]);

  // Extract unique categories from actual certificate records
  const categories = useMemo(() => {
    if (!hasCerts) return [];
    const cats = Array.from(new Set(certificates.map((c) => c.category)));
    return ["All", ...cats];
  }, [hasCerts, certificates]);

  // Featured certificates (up to 3 genuine entries)
  const featuredCerts = useMemo(() => {
    return certificates.filter((c) => c.featured).slice(0, 3);
  }, [certificates]);

  // Filtered certificates for gallery
  const filteredCerts = useMemo(() => {
    return certificates.filter((cert) => {
      // Category filter
      if (activeCategory !== "All" && cert.category !== activeCategory) {
        return false;
      }
      // Search filter (searches title, issuer, and verified skills)
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = cert.title.toLowerCase().includes(query);
        const matchesIssuer = cert.issuer.toLowerCase().includes(query);
        const matchesSkill = cert.skills.some((s) => s.toLowerCase().includes(query));
        return matchesTitle || matchesIssuer || matchesSkill;
      }
      return true;
    });
  }, [certificates, activeCategory, searchQuery]);

  // Reset filters handler
  const handleResetFilters = () => {
    setSearchQuery("");
    setActiveCategory("All");
  };

  const isFiltering = searchQuery.trim() !== "" || activeCategory !== "All";

  // Render individual card with top document preview
  const renderCertificateCard = (cert: CertificateDisplay, keyPrefix: string) => {
    const visualSrc = cert.previewImageUrl || (cert.fileType !== "pdf" ? cert.fileUrl : null);
    const hasVisual = Boolean(visualSrc);
    const isPdf = cert.fileType === "pdf";

    return (
      <div
        key={`${keyPrefix}-${cert.id}`}
        className="rounded-2xl glass-card-elevated border border-white/10 hover:border-red-600/35 transition-all duration-300 flex flex-col justify-between overflow-hidden group shadow-lg"
      >
        <div>
          {/* ======================================================== */}
          {/* TOP PREVIEW CONTAINER                                    */}
          {/* ======================================================== */}
          <div className="relative w-full aspect-[16/10] bg-[#07080a] border-b border-white/[0.08] overflow-hidden flex items-center justify-center group/preview">
            {hasVisual ? (
              <button
                type="button"
                onClick={() =>
                  setModalState({
                    isOpen: true,
                    title: cert.title,
                    imageSrc: visualSrc!,
                    issuer: cert.issuer,
                  })
                }
                className="w-full h-full flex items-center justify-center p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 cursor-pointer"
                aria-label={`Enlarge certificate preview for ${cert.title}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={visualSrc!}
                  alt={`Official Certificate for ${cert.title}`}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover/preview:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-semibold shadow-lg">
                    <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Enlarge Certificate</span>
                  </span>
                </div>
              </button>
            ) : isPdf ? (
              <a
                href={cert.fileUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-red-400 hover:text-red-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 group/pdf"
                aria-label={`Open official PDF document for ${cert.title} in new tab`}
              >
                <div className="w-12 h-12 rounded-xl bg-red-950/40 border border-red-600/30 flex items-center justify-center text-red-500 mb-2 shadow-[0_0_15px_rgba(229,9,20,0.25)] group-hover/pdf:scale-105 transition-transform">
                  <FileText className="w-6 h-6" aria-hidden="true" />
                </div>
                <span className="text-xs font-semibold text-slate-200">Official PDF Document</span>
                <span className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                  <span>Open Document</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              </a>
            ) : (
              /* Non-deceptive, restrained fallback when no document is uploaded */
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <div className="w-11 h-11 rounded-xl bg-[#101216] border border-white/10 flex items-center justify-center text-slate-500 mb-2">
                  <Award className="w-5 h-5 text-red-500/70" aria-hidden="true" />
                </div>
                <span className="text-xs font-medium text-slate-300">Curriculum Record</span>
                <span className="text-[10px] font-mono text-slate-500 mt-0.5">
                  Verified Academic Coursework
                </span>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* METADATA BELOW PREVIEW                                   */}
          {/* ======================================================== */}
          <div className="p-6">
            {/* Header: Issuer & Category */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <Badge variant="crimson">{cert.issuer}</Badge>
              <span className="text-[11px] font-mono text-slate-400">
                {cert.category}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-red-400 transition-colors mb-2">
              {cert.title}
            </h3>

            {cert.issueDate && (
              <p className="text-xs text-slate-400 mb-3 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                <span>{cert.issueDate}</span>
              </p>
            )}

            {/* Credential ID if available */}
            {cert.credentialId && (
              <p className="text-[11px] font-mono text-slate-400 mb-3 px-2.5 py-1 rounded bg-[#0a0b0d] border border-white/[0.08] inline-block">
                ID: <span className="text-slate-300">{cert.credentialId}</span>
              </p>
            )}

            {/* Skill Tags */}
            {cert.skills && cert.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {cert.skills.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#0a0b0d] border border-white/[0.08] text-[11px] font-medium text-slate-300"
                  >
                    <Check className="w-2.5 h-2.5 text-red-500 shrink-0" aria-hidden="true" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* CARD FOOTER: Actions & Verification                     */}
        {/* ======================================================== */}
        <div className="px-6 py-3.5 border-t border-white/[0.08] flex items-center justify-between gap-2 text-xs bg-black/20">
          {cert.verificationUrl ? (
            <a
              href={cert.verificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 font-semibold p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded min-h-[44px]"
              aria-label={`Verify ${cert.title} accreditation (opens in new tab)`}
            >
              <span>Verify Credential</span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          ) : hasVisual ? (
            <button
              type="button"
              onClick={() =>
                setModalState({
                  isOpen: true,
                  title: cert.title,
                  imageSrc: visualSrc!,
                  issuer: cert.issuer,
                })
              }
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white font-medium p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded min-h-[44px] cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-red-400" aria-hidden="true" />
              <span>View Certificate</span>
            </button>
          ) : isPdf ? (
            <a
              href={cert.fileUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-slate-300 hover:text-white font-medium p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded min-h-[44px]"
            >
              <FileText className="w-3.5 h-3.5 text-red-400" aria-hidden="true" />
              <span>View Document</span>
            </a>
          ) : (
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Verified on Academic Record</span>
            </span>
          )}

          {(cert.source === "mongodb" || cert.source === "supabase") && (
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              Live
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Section
        id="certificates"
        titleAs="h1"
        containerSize="lg"
        title="Certificates & Accreditations"
        description="Official coursework completions, algorithms training, and artificial intelligence accreditations earned by Manish Kumar."
      >
        {/* Navigation & Summary Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-white/[0.08]">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-red-400 transition-colors p-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Back to Homepage</span>
          </Link>

          {/* Genuine Summary Count Chips */}
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#101216] border border-white/10 text-slate-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              <span>{certificates.length} Verified Accreditations</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#101216] border border-white/10 text-slate-400 font-mono text-[11px]">
              <BookOpen className="w-3 h-3 text-red-400" aria-hidden="true" />
              <span>{categories.length > 1 ? categories.length - 1 : 0} Domains</span>
            </span>
          </div>
        </div>

        {hasCerts ? (
          <div className="space-y-16">
            {/* ======================================================== */}
            {/* SECTION B: Featured Certificates Showcase                */}
            {/* ======================================================== */}
            {featuredCerts.length > 0 && (
              <section aria-labelledby="featured-certificates-heading">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-red-400 mb-1">
                      <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Curated Highlights</span>
                    </div>
                    <h2
                      id="featured-certificates-heading"
                      className="text-xl sm:text-2xl font-bold text-white tracking-tight"
                    >
                      Featured Accreditations
                    </h2>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {featuredCerts.length} of {certificates.length} Featured
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredCerts.map((cert) => renderCertificateCard(cert, "featured"))}
                </div>
              </section>
            )}

            {/* ======================================================== */}
            {/* SECTION C: Complete Certificate Gallery & Search         */}
            {/* ======================================================== */}
            <section aria-labelledby="all-certificates-heading" className="pt-8 border-t border-white/[0.08]">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    <BookOpen className="w-3.5 h-3.5 text-red-500" aria-hidden="true" />
                    <span>Complete Portfolio</span>
                  </div>
                  <h2
                    id="all-certificates-heading"
                    className="text-xl sm:text-2xl font-bold text-white tracking-tight"
                  >
                    All Certifications & Coursework
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-400">
                    Search and filter verified coursework completions and algorithm certifications.
                  </p>
                </div>

                {/* Filter Summary Count */}
                <div className="text-xs text-slate-400 font-mono">
                  Showing <span className="text-white font-semibold">{filteredCerts.length}</span> of{" "}
                  <span>{certificates.length}</span> credentials
                </div>
              </div>

              {/* Search Bar & Category Controls */}
              <div className="space-y-4 mb-8">
                {/* Search Input */}
                <div className="relative max-w-md">
                  <label htmlFor="certificate-search" className="sr-only">
                    Search certificates by title, issuer, or skill
                  </label>
                  <div className="relative">
                    <Search
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      id="certificate-search"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by title, issuer (e.g. NPTEL, Google, Python)..."
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded min-w-[32px] min-h-[32px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 cursor-pointer"
                        aria-label="Clear search input"
                      >
                        <X className="w-4 h-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Category Filters Bar */}
                {categories.length > 1 && (
                  <div
                    role="tablist"
                    aria-label="Filter certificates by category"
                    className="flex flex-wrap items-center gap-2 pt-2"
                  >
                    {categories.map((cat) => {
                      const isActive = activeCategory === cat;
                      const count =
                        cat === "All"
                          ? certificates.length
                          : certificates.filter((c) => c.category === cat).length;

                      return (
                        <button
                          key={cat}
                          role="tab"
                          aria-selected={isActive}
                          type="button"
                          onClick={() => setActiveCategory(cat)}
                          className={cn(
                            "inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 cursor-pointer min-h-[44px]",
                            isActive
                              ? "bg-red-600 text-white shadow-[0_0_15px_rgba(229,9,20,0.35)]"
                              : "bg-[#0a0b0d] text-slate-400 hover:text-white hover:bg-white/5 border border-white/10"
                          )}
                        >
                          <span>{cat}</span>
                          <span
                            className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded-full font-mono",
                              isActive ? "bg-black/30 text-white" : "bg-white/10 text-slate-400"
                            )}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}

                    {/* Reset Filters Quick Button (when active) */}
                    {isFiltering && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/20 border border-red-800/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 cursor-pointer min-h-[44px]"
                        aria-label="Reset all search queries and category filters"
                      >
                        <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Reset Filters</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Complete Gallery Cards Grid */}
              {filteredCerts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCerts.map((cert) => renderCertificateCard(cert, "gallery"))}
                </div>
              ) : (
                /* Empty state when search or filter returns 0 matches */
                <div className="p-8 sm:p-12 rounded-2xl glass-card-elevated border border-white/10 text-center max-w-xl mx-auto my-6">
                  <div className="w-12 h-12 mx-auto rounded-full bg-red-950/40 border border-red-600/30 flex items-center justify-center text-red-500 mb-4 shadow-[0_0_15px_rgba(229,9,20,0.2)]">
                    <Search className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">No Matching Certificates Found</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                    No accreditations match &ldquo;<span className="text-white font-medium">{searchQuery}</span>&rdquo;
                    {activeCategory !== "All" && (
                      <span> in category &ldquo;<span className="text-white font-medium">{activeCategory}</span>&rdquo;</span>
                    )}
                    .
                  </p>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-[0_0_15px_rgba(229,9,20,0.4)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 cursor-pointer min-h-[44px]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Reset Search & Filters</span>
                  </button>
                </div>
              )}
            </section>

            {/* Verification Note */}
            <div className="p-5 rounded-2xl bg-[#0a0b0d] border border-white/[0.08] text-xs text-slate-400 flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
              <span>
                All certificates are verified and backed by completed academic coursework and official accreditation.
              </span>
            </div>
          </div>
        ) : (
          <div className="p-8 sm:p-12 rounded-2xl glass-card-elevated text-center max-w-2xl mx-auto border border-white/10">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-950/40 border border-red-600/30 flex items-center justify-center text-red-500 mb-4 shadow-[0_0_20px_rgba(229,9,20,0.2)]">
              <Award className="w-7 h-7" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Certificates Scaffolding Ready
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Certificates will be listed with direct verification links.
            </p>
          </div>
        )}
      </Section>

      {/* ======================================================== */}
      {/* Accessible Image Preview Modal                           */}
      {/* ======================================================== */}
      {modalState?.isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cert-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
          onClick={closeModal}
        >
          <div
            className="relative max-w-3xl w-full bg-[#101216] border border-white/15 rounded-2xl p-4 sm:p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-white/10">
              <div>
                <Badge variant="crimson" className="mb-1">{modalState.issuer}</Badge>
                <h3 id="cert-modal-title" className="text-base sm:text-lg font-bold text-white">
                  {modalState.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close certificate preview"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Modal Image Body */}
            <div className="overflow-auto flex items-center justify-center bg-[#040405] rounded-xl p-2 sm:p-4 border border-white/[0.08]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={modalState.imageSrc}
                alt={`Official Certificate for ${modalState.title} issued by ${modalState.issuer}`}
                className="max-h-[65vh] w-auto object-contain rounded-lg shadow-lg"
              />
            </div>

            {/* Modal Footer */}
            <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                <span>Verified Academic Accreditation</span>
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={modalState.imageSrc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 border border-red-600/30 text-red-300 hover:text-white hover:bg-red-600/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
                >
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Open Full Size</span>
                </a>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px] cursor-pointer"
                >
                  Close Preview (Esc)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
