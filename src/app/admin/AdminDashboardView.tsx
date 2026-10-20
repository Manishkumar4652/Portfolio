"use client";

import React, { useState, useTransition, useMemo, useSyncExternalStore } from "react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import {
  createCertificateAction,
  updateCertificateAction,
  deleteCertificateAction,
  logoutAdminAction,
} from "./actions";
import type {
  CertificateDisplay,
  CertificateCategory,
  ProjectDisplay,
  PortfolioContentDisplay,
  ResumeDisplay,
} from "@/lib/mongodb/types";
import type { BackendConfigStatus } from "@/lib/mongodb/config";
import { ProjectsManager } from "./ProjectsManager";
import { ContentManager } from "./ContentManager";
import { ResumeManager } from "./ResumeManager";
import {
  ShieldCheck,
  LogOut,
  Plus,
  Search,
  Trash2,
  Edit2,
  FileText,
  Upload,
  AlertTriangle,
  X,
  FolderGit2,
  Sparkles,
  Loader2,
  Eye,
} from "lucide-react";

const emptySubscribe = () => () => {};

const CATEGORIES: CertificateCategory[] = [
  "Programming & Computer Science",
  "Data Structures & Algorithms",
  "Artificial Intelligence & Tools",
  "Systems & Tools",
  "Cloud & DevOps",
];

interface AdminDashboardViewProps {
  userEmail: string;
  initialCertificates: CertificateDisplay[];
  initialProjects?: ProjectDisplay[];
  initialContent?: PortfolioContentDisplay;
  initialResume?: ResumeDisplay | null;
  isConfigured: boolean;
  configStatus: BackendConfigStatus;
}

export function AdminDashboardView({
  userEmail,
  initialCertificates,
  initialProjects = [],
  initialContent,
  initialResume = null,
  isConfigured,
  configStatus,
}: AdminDashboardViewProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [activeTab, setActiveTab] = useState<
    "certificates" | "projects" | "content" | "resume"
  >("certificates");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // Modal states for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<CertificateDisplay | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  // File preview state within modal
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<"image" | "pdf" | null>(null);

  // Delete confirmation modal
  const [certToDelete, setCertToDelete] = useState<CertificateDisplay | null>(null);

  // Filtered certificates list
  const filteredCerts = useMemo(() => {
    if (!searchQuery.trim()) return initialCertificates;
    const q = searchQuery.toLowerCase().trim();
    return initialCertificates.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.issuer.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.skills.some((s) => s.toLowerCase().includes(q))
    );
  }, [initialCertificates, searchQuery]);

  // Handle open create modal
  const handleOpenCreate = () => {
    setEditingCert(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setPreviewType(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  // Handle open edit modal
  const handleOpenEdit = (cert: CertificateDisplay) => {
    setEditingCert(cert);
    setSelectedFile(null);
    setPreviewUrl(cert.previewImageUrl || cert.fileUrl);
    setPreviewType(cert.previewImageUrl ? "image" : cert.fileType);
    setModalError(null);
    setIsModalOpen(true);
  };

  // Handle file selection and client-side preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setModalError("File exceeds 10MB limit.");
      return;
    }

    setSelectedFile(file);
    setModalError(null);

    const isPdf = file.type === "application/pdf";
    setPreviewType(isPdf ? "pdf" : "image");

    if (!isPdf) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl(file.name);
    }
  };

  // Handle Save (Create or Update)
  const handleSaveCertificate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setModalError(null);

    const formData = new FormData(e.currentTarget);
    if (selectedFile) {
      formData.set("file", selectedFile);
    }

    startTransition(async () => {
      let result;
      if (editingCert) {
        result = await updateCertificateAction(editingCert.id, null, formData);
      } else {
        result = await createCertificateAction(null, formData);
      }

      if (result.success) {
        setIsModalOpen(false);
        // Clean up object URL if created
        if (previewUrl && previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(previewUrl);
        }
      } else {
        setModalError(result.error || "Failed to save certificate.");
      }
    });
  };

  // Handle Delete
  const handleConfirmDelete = () => {
    if (!certToDelete) return;
    startTransition(async () => {
      const result = await deleteCertificateAction(certToDelete.id);
      if (result.success) {
        setCertToDelete(null);
      } else {
        alert(result.error || "Failed to delete certificate.");
      }
    });
  };

  if (!mounted) {
    return (
      <Container size="lg">
        <div className="w-full mx-auto space-y-8 animate-pulse" aria-hidden="true">
          {/* Header skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-white/[0.08]">
            <div className="space-y-2.5">
              <div className="h-4 w-36 bg-white/10 rounded" />
              <div className="h-8 w-72 sm:w-96 bg-white/10 rounded-xl" />
            </div>
            <div className="h-10 w-44 bg-white/10 rounded-xl" />
          </div>

          {/* Tabs skeleton */}
          <div className="flex gap-2 border-b border-white/[0.08] pb-1">
            <div className="h-10 w-48 bg-white/10 rounded-t-xl" />
            <div className="h-10 w-48 bg-white/5 rounded-t-xl" />
            <div className="h-10 w-36 bg-white/5 rounded-t-xl" />
            <div className="h-10 w-40 bg-white/5 rounded-t-xl" />
          </div>

          {/* Search bar & action button skeleton */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="h-11 max-w-md w-full bg-white/5 rounded-xl border border-white/10" />
            <div className="h-11 w-44 bg-red-600/20 rounded-xl border border-red-600/30" />
          </div>

          {/* Cards skeleton list */}
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-28 bg-[#0a0b0d] border border-white/10 rounded-2xl p-5 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-12 bg-white/10 rounded-xl" />
                  <div className="space-y-2">
                    <div className="h-4 w-48 sm:w-64 bg-white/10 rounded" />
                    <div className="h-3 w-32 bg-white/5 rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-8 bg-white/5 rounded-xl" />
                  <div className="w-16 h-8 bg-white/5 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container size="lg">
      {/* ======================================================== */}
      {/* Dashboard Top Header                                     */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              CMS Administration Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Portfolio Management Dashboard
          </h1>
        </div>

        {/* Admin Identity & Logout */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3 py-1.5 rounded-xl bg-[#101216] border border-white/10 text-xs text-slate-300 max-w-full">
            <span className="text-slate-500 mr-1.5">Admin:</span>
            <span className="font-semibold text-white break-all">{userEmail}</span>
          </div>

          <form action={logoutAdminAction}>
            <button
              type="submit"
              suppressHydrationWarning
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800/40 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px] cursor-pointer"
              aria-label="Sign out of administration portal"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </div>

      {/* Database Status Alert if local fallback active */}
      {!isConfigured && (
        <div className="mb-8 p-4 rounded-2xl bg-amber-950/30 border border-amber-600/30 text-amber-200 text-xs leading-relaxed flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <span className="font-bold">Local Data Mode: </span>
            {configStatus.statusMessage} Live database mutations require valid credentials in{" "}
            <code className="bg-black/40 px-1 py-0.5 rounded text-amber-100 font-mono">.env.local</code>.
          </div>
        </div>
      )}

      {/* Navigation Tabs - Responsive overflow-x-auto for mobile */}
      <div className="flex items-center gap-2 mb-8 border-b border-white/[0.08] pb-1 overflow-x-auto no-scrollbar flex-nowrap">
        <button
          type="button"
          suppressHydrationWarning
          onClick={() => setActiveTab("certificates")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold tracking-wide transition-all min-h-[44px] cursor-pointer border-b-2 shrink-0 ${
            activeTab === "certificates"
              ? "border-red-600 text-white bg-white/5"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-red-500" aria-hidden="true" />
          <span>Certificates & Media Storage</span>
          <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-[10px] font-mono">
            {initialCertificates.length}
          </span>
        </button>

        <button
          type="button"
          suppressHydrationWarning
          onClick={() => setActiveTab("projects")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold tracking-wide transition-all min-h-[44px] cursor-pointer border-b-2 shrink-0 ${
            activeTab === "projects"
              ? "border-red-600 text-white bg-white/5"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <FolderGit2 className="w-4 h-4 text-red-500" aria-hidden="true" />
          <span>Projects & Repositories</span>
          <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-[10px] font-mono">
            {initialProjects.length}
          </span>
        </button>

        <button
          type="button"
          suppressHydrationWarning
          onClick={() => setActiveTab("content")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold tracking-wide transition-all min-h-[44px] cursor-pointer border-b-2 shrink-0 ${
            activeTab === "content"
              ? "border-red-600 text-white bg-white/5"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Sparkles className="w-4 h-4 text-red-500" aria-hidden="true" />
          <span>Portfolio Content</span>
        </button>

        <button
          type="button"
          suppressHydrationWarning
          onClick={() => setActiveTab("resume")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold tracking-wide transition-all min-h-[44px] cursor-pointer border-b-2 shrink-0 ${
            activeTab === "resume"
              ? "border-red-600 text-white bg-white/5"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <FileText className="w-4 h-4 text-red-500" aria-hidden="true" />
          <span>Resume Management</span>
          {initialResume && (
            <span className="w-2 h-2 rounded-full bg-emerald-400" title="Active resume published" />
          )}
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: Certificate Management                            */}
      {/* ======================================================== */}
      {activeTab === "certificates" && (
        <div className="space-y-6">
          {/* Action & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative max-w-md w-full">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="text"
                suppressHydrationWarning
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search certificates by title, issuer, or skill..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
              />
            </div>

            <button
              type="button"
              suppressHydrationWarning
              onClick={handleOpenCreate}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-[0_0_15px_rgba(229,9,20,0.4)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px] cursor-pointer"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Add New Certificate</span>
            </button>
          </div>

          {/* Certificate List Cards */}
          <div className="space-y-4">
            {filteredCerts.length > 0 ? (
              filteredCerts.map((cert) => (
                <div
                  key={cert.id}
                  className="p-5 sm:p-6 rounded-2xl glass-card-elevated border border-white/10 hover:border-red-600/30 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                >
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-start gap-4">
                    {/* Media Thumbnail or Placeholder */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#040405] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden relative group">
                      {cert.previewImageUrl || cert.fileUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={cert.previewImageUrl || cert.fileUrl!}
                          alt={cert.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-amber-500/80 p-1 text-center">
                          <AlertTriangle className="w-5 h-5" aria-hidden="true" />
                          <span className="text-[8px] font-mono mt-0.5 leading-tight">No Media</span>
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="crimson">{cert.issuer}</Badge>
                        <span className="text-[11px] font-mono text-slate-400">{cert.category}</span>
                        {cert.featured && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-950/60 border border-red-800/40 text-[10px] text-red-300 font-semibold">
                            <Sparkles className="w-2.5 h-2.5" aria-hidden="true" />
                            Featured
                          </span>
                        )}
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                          Order: {cert.sortOrder}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-white">{cert.title}</h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        {cert.issueDate && <span>{cert.issueDate}</span>}
                        {cert.credentialId && (
                          <span className="font-mono text-[11px] text-slate-500">
                            ID: {cert.credentialId}
                          </span>
                        )}
                        {cert.source === "local" ? (
                          <span className="text-[10px] text-amber-400 font-mono">
                            (Local fallback record)
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-mono">
                            (Live Database)
                          </span>
                        )}
                      </div>

                      {/* Skills */}
                      {cert.skills && cert.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {cert.skills.map((s, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-[#0a0b0d] border border-white/[0.06] text-[10px] text-slate-300"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {cert.fileUrl && (
                      <a
                        href={cert.previewImageUrl || cert.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
                        aria-label={`View uploaded media for ${cert.title}`}
                        title="View Certificate"
                      >
                        <Eye className="w-4 h-4" aria-hidden="true" />
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(cert)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px] cursor-pointer"
                      aria-label={`Edit ${cert.title}`}
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-300" aria-hidden="true" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCertToDelete(cert)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800/40 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px] cursor-pointer"
                      aria-label={`Delete ${cert.title}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 rounded-2xl glass-card text-center text-slate-400 text-xs sm:text-sm">
                No certificates match your search query.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: Project Management                                 */}
      {/* ======================================================== */}
      {activeTab === "projects" && (
        <ProjectsManager
          initialProjects={initialProjects}
          isConfigured={isConfigured}
        />
      )}

      {/* ======================================================== */}
      {/* TAB 3: Dynamic Content Management                         */}
      {/* ======================================================== */}
      {activeTab === "content" && initialContent && (
        <ContentManager
          initialContent={initialContent}
          isConfigured={isConfigured}
        />
      )}

      {/* ======================================================== */}
      {/* TAB 4: Resume Management                                 */}
      {/* ======================================================== */}
      {activeTab === "resume" && (
        <ResumeManager
          initialResume={initialResume || null}
          isConfigured={isConfigured}
        />
      )}

      {/* ======================================================== */}
      {/* MODAL: Create / Edit Certificate                         */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cert-form-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
        >
          <div className="relative max-w-2xl w-full bg-[#101216] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
              <div>
                <h2 id="cert-form-title" className="text-lg sm:text-xl font-bold text-white">
                  {editingCert ? "Edit Certificate Metadata" : "Add New Certificate"}
                </h2>
                <p className="text-xs text-slate-400">
                  Update database record and upload official certificate image or PDF.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-950/40 border border-red-600/40 text-red-300 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSaveCertificate} className="space-y-4">
              {/* Title & Issuer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Certificate Title *
                  </label>
                  <input
                    name="title"
                    type="text"
                    required
                    defaultValue={editingCert?.title || ""}
                    placeholder="e.g. The Joy of Computing using Python"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Issuing Organization *
                  </label>
                  <input
                    name="issuer"
                    type="text"
                    required
                    defaultValue={editingCert?.issuer || ""}
                    placeholder="e.g. NPTEL / SWAYAM, Google, ExcelR"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
                  />
                </div>
              </div>

              {/* Category & Issue Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Category *
                  </label>
                  <select
                    name="category"
                    required
                    defaultValue={editingCert?.category || "Programming & Computer Science"}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Issue Date or Status
                  </label>
                  <input
                    name="issueDate"
                    type="text"
                    defaultValue={editingCert?.issueDate || ""}
                    placeholder="e.g. Verified Course Completion"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
                  />
                </div>
              </div>

              {/* Skills (Comma-separated) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Verified Skills (comma separated)
                </label>
                <input
                  name="skills"
                  type="text"
                  defaultValue={editingCert?.skills.join(", ") || ""}
                  placeholder="Python, Algorithms, Problem Solving"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
                />
              </div>

              {/* Verification URL & Credential ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Verification URL (Optional)
                  </label>
                  <input
                    name="verificationUrl"
                    type="url"
                    defaultValue={editingCert?.verificationUrl || ""}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Credential ID (Optional)
                  </label>
                  <input
                    name="credentialId"
                    type="text"
                    defaultValue={editingCert?.credentialId || ""}
                    placeholder="e.g. NPTEL24CS109..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
                  />
                </div>
              </div>

              {/* Sort Order & Featured Flag */}
              <div className="flex items-center gap-6 pt-1">
                <div className="w-32">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Sort Order
                  </label>
                  <input
                    name="sortOrder"
                    type="number"
                    defaultValue={editingCert?.sortOrder || 1}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    id="featured-checkbox"
                    name="featured"
                    type="checkbox"
                    defaultChecked={editingCert?.featured ?? false}
                    className="w-4 h-4 rounded border-white/20 bg-[#0a0b0d] text-red-600 focus:ring-red-600"
                  />
                  <label htmlFor="featured-checkbox" className="text-xs font-semibold text-slate-300">
                    Feature on Homepage & Highlights
                  </label>
                </div>
              </div>

              {/* File Upload Section with Client-Side Preview */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Certificate Document (Image or PDF, max 10MB)
                </label>
                <div className="p-4 rounded-2xl bg-[#0a0b0d] border border-white/10 border-dashed text-center">
                  <input
                    id="cert-file-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml,application/pdf"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                  <label
                    htmlFor="cert-file-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold cursor-pointer transition-colors min-h-[44px]"
                  >
                    <Upload className="w-4 h-4 text-red-500" aria-hidden="true" />
                    <span>{selectedFile ? "Replace Selected File" : "Choose Image / PDF"}</span>
                  </label>

                  {/* Selected / Existing File Preview */}
                  {previewUrl && (
                    <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-center gap-3">
                      {previewType === "pdf" ? (
                        <div className="inline-flex items-center gap-2 text-xs text-red-400 font-mono">
                          <FileText className="w-4 h-4" />
                          <span>PDF Document attached: {selectedFile?.name || "Stored PDF"}</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span className="text-[11px] font-mono text-slate-400">Visual Preview:</span>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={previewUrl}
                            alt="Certificate preview"
                            className="max-h-32 mx-auto rounded-lg border border-white/15 shadow-md object-contain"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isPending}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-[0_0_15px_rgba(229,9,20,0.4)] transition-all disabled:opacity-50 min-h-[44px] cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to Database...</span>
                    </>
                  ) : (
                    <span>Save Certificate</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: Delete Confirmation                               */}
      {/* ======================================================== */}
      {certToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div className="relative max-w-md w-full bg-[#101216] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-950/40 border border-red-600/30 flex items-center justify-center text-red-500">
              <Trash2 className="w-6 h-6" aria-hidden="true" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Delete Certificate?</h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Are you sure you want to delete{" "}
                <strong className="text-white">&ldquo;{certToDelete.title}&rdquo;</strong>?
                This action deletes the database record and removes associated storage media.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCertToDelete(null)}
                disabled={isPending}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold transition-colors min-h-[44px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors min-h-[44px] cursor-pointer"
              >
                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
