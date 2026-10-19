"use client";

import React, { useState, useTransition, useRef } from "react";
import type { ResumeDisplay } from "@/lib/mongodb/types";
import { uploadResumeAction, deleteResumeAction } from "./actions";
import {
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Calendar,
  HardDrive,
  Check,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";

interface ResumeManagerProps {
  initialResume: ResumeDisplay | null;
  isConfigured: boolean;
}

export function ResumeManager({
  initialResume,
  isConfigured,
}: ResumeManagerProps) {
  const [resume, setResume] = useState<ResumeDisplay | null>(initialResume);
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setStatusMessage(null);
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      setStatusMessage({
        type: "error",
        text: "Only PDF documents (.pdf) are supported. Please select a valid PDF file.",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setStatusMessage({
        type: "error",
        text: `File exceeds maximum 10MB limit (received ${(file.size / (1024 * 1024)).toFixed(2)}MB).`,
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    setStatusMessage(null);
    const formData = new FormData();
    formData.append("file", selectedFile);

    startTransition(async () => {
      const res = await uploadResumeAction(formData);
      if (res.success && res.data) {
        setResume(res.data);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setStatusMessage({
          type: "success",
          text: `Resume "${res.data.filename}" successfully uploaded and published to the portfolio.`,
        });
      } else {
        setStatusMessage({
          type: "error",
          text: res.error || "Failed to upload resume. Please try again.",
        });
      }
    });
  };

  const handleDelete = () => {
    setStatusMessage(null);
    startTransition(async () => {
      const res = await deleteResumeAction();
      if (res.success) {
        setResume(null);
        setIsDeleteModalOpen(false);
        setStatusMessage({
          type: "success",
          text: "Resume document successfully removed. Public links are now gracefully disabled.",
        });
      } else {
        setIsDeleteModalOpen(false);
        setStatusMessage({
          type: "error",
          text: res.error || "Failed to delete resume.",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Feedback Alert */}
      {statusMessage && (
        <div
          role="alert"
          className={`p-4 rounded-xl flex items-start gap-3 text-xs sm:text-sm font-medium transition-all ${
            statusMessage.type === "success"
              ? "bg-emerald-950/40 border border-emerald-500/30 text-emerald-300"
              : "bg-red-950/40 border border-red-500/30 text-red-300"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          )}
          <span className="flex-1">{statusMessage.text}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-white p-1"
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      {/* Cloudinary Configuration Warning if not ready */}
      {!isConfigured && (
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs sm:text-sm flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Cloudinary Storage Offline</p>
            <p className="mt-1 text-slate-400 text-xs">
              Cloudinary credentials are not configured in your environment. Resume uploads require Cloudinary.
            </p>
          </div>
        </div>
      )}

      {/* ACTIVE RESUME VIEW */}
      {resume ? (
        <div className="space-y-6">
          <div className="p-5 sm:p-7 rounded-2xl glass-card-elevated border border-white/10 hover:border-red-600/30 transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-5 border-b border-white/[0.08]">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-red-950/40 border border-red-600/30 flex items-center justify-center text-red-500 shrink-0">
                  <FileText className="w-6 h-6" aria-hidden="true" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-white break-all">
                      {resume.filename}
                    </h3>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/50 border border-emerald-500/30 text-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active & Published
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1">
                      <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                      {resume.fileSizeFormatted}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      Uploaded {resume.uploadDate}
                    </span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href="/api/resume/preview"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 text-xs font-semibold min-h-[44px] transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-red-400" />
                  <span>Preview PDF</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                </a>

                <a
                  href="/api/resume/download"
                  download
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-600/30 text-xs font-semibold min-h-[44px] transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>

                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-950/30 hover:bg-red-900/40 text-red-400 hover:text-red-300 border border-red-600/20 text-xs font-semibold min-h-[44px] transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>

            {/* Public Links Integration Notice */}
            <div className="pt-4 flex items-center justify-between gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                Served automatically to Homepage Hero and About Page download actions.
              </span>
              <span className="text-[11px] font-mono text-slate-500 hidden sm:inline-block">
                Endpoint: /api/resume/download
              </span>
            </div>
          </div>

          {/* REPLACE RESUME ZONE */}
          <div className="p-5 sm:p-7 rounded-2xl glass-card-elevated border border-white/10 space-y-4">
            <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-red-500" />
              <span>Replace Active Resume</span>
            </h4>
            <p className="text-xs text-slate-400">
              Uploading a new PDF safely replaces the current resume document in MongoDB Atlas and cleans up the previous asset in Cloudinary.
            </p>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-xl cursor-pointer text-center transition-colors ${
                isDragging
                  ? "border-red-500 bg-red-950/20"
                  : selectedFile
                  ? "border-emerald-500/50 bg-emerald-950/10"
                  : "border-white/10 hover:border-red-600/40 bg-[#0a0b0d]"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                }}
              />

              {selectedFile ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Check className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold text-white break-all">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Ready to publish
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-red-950/40 border border-red-600/30 flex items-center justify-center text-red-500">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-slate-200">
                    Click to browse or drag and drop a new PDF resume here
                  </p>
                  <p className="text-[11px] text-slate-500">
                    PDF document only • Maximum 10MB • Server validated signature (%PDF-)
                  </p>
                </div>
              )}
            </div>

            {selectedFile && (
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  disabled={isPending}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold min-h-[44px] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold min-h-[44px] shadow-[0_0_15px_rgba(229,9,20,0.4)] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading & Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload & Replace</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* EMPTY STATE VIEW */
        <div className="p-8 sm:p-12 rounded-2xl glass-card-elevated border border-white/10 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-950/40 border border-red-600/30 flex items-center justify-center text-red-500 mx-auto shadow-[0_0_25px_-5px_rgba(229,9,20,0.4)]">
            <FileText className="w-8 h-8" aria-hidden="true" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg sm:text-xl font-bold text-white">
              No Resume Uploaded
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Upload Manish Kumar&apos;s verified curriculum vitae (PDF) to activate the public download buttons on the Homepage and About page.
            </p>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`max-w-lg mx-auto p-8 border-2 border-dashed rounded-2xl cursor-pointer text-center transition-colors ${
              isDragging
                ? "border-red-500 bg-red-950/20"
                : selectedFile
                ? "border-emerald-500/50 bg-emerald-950/10"
                : "border-white/15 hover:border-red-600/40 bg-[#0a0b0d]"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
              }}
            />

            {selectedFile ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Check className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-white break-all">{selectedFile.name}</p>
                <p className="text-xs text-slate-400">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Ready to upload
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Select a PDF resume to upload
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Drag and drop or click to choose from your device
                  </p>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  Max 10 MB • application/pdf
                </span>
              </div>
            )}
          </div>

          {selectedFile && (
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                disabled={isPending}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold min-h-[44px] transition-colors cursor-pointer"
              >
                Clear Selection
              </button>

              <button
                type="button"
                onClick={handleUpload}
                disabled={isPending}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold min-h-[44px] shadow-[0_0_20px_rgba(229,9,20,0.5)] transition-all cursor-pointer disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading to Cloudinary...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload & Publish Resume</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {isDeleteModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-2xl glass-card-elevated border border-white/15 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-xl bg-red-950/50 border border-red-600/30 flex items-center justify-center text-red-500">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">
                Delete Active Resume?
              </h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                This will delete the resume record from MongoDB Atlas and clean up the asset in Cloudinary. Public download buttons will gracefully show as unavailable.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isPending}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold min-h-[44px] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold min-h-[44px] transition-colors cursor-pointer disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
