"use client";

import React, { useState, useTransition, useMemo } from "react";
import type { ProjectDisplay, ProjectStatus } from "@/lib/mongodb/types";
import { Badge } from "@/components/ui/Badge";
import { GithubIcon } from "@/components/ui/Icons";
import {
  createProjectAction,
  updateProjectAction,
  deleteProjectAction,
} from "./actions";
import {
  FolderGit2,
  Plus,
  Search,
  Trash2,
  Edit2,
  Upload,
  AlertTriangle,
  X,
  Sparkles,
  Loader2,
  ExternalLink,
  CheckCircle2,
  Clock,
} from "lucide-react";

const PROJECT_CATEGORIES = [
  "Web Application",
  "AI / ML",
  "Systems & Tools",
  "Mobile App",
  "Cloud & DevOps",
];

interface ProjectsManagerProps {
  initialProjects: ProjectDisplay[];
  isConfigured: boolean;
}

export function ProjectsManager({
  initialProjects,
  isConfigured,
}: ProjectsManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [isPending, startTransition] = useTransition();

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectDisplay | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  // Thumbnail File & Preview State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Delete Confirmation State
  const [projectToDelete, setProjectToDelete] = useState<ProjectDisplay | null>(null);

  // Form Field State for auto-slug generation
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    let result = initialProjects;

    // Status filter
    if (statusFilter !== "All") {
      result = result.filter((p) => p.status === statusFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.technologies.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [initialProjects, statusFilter, searchQuery]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingProject(null);
    setFormTitle("");
    setFormSlug("");
    setIsSlugManuallyEdited(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (project: ProjectDisplay) => {
    setEditingProject(project);
    setFormTitle(project.title);
    setFormSlug(project.slug);
    setIsSlugManuallyEdited(true);
    setSelectedFile(null);
    setPreviewUrl(project.thumbnailUrl);
    setModalError(null);
    setIsModalOpen(true);
  };

  // Title change with auto-slug generation
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormTitle(val);
    if (!isSlugManuallyEdited && !editingProject) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormSlug(generated);
    }
  };

  // Handle Thumbnail File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setModalError("Thumbnail image file exceeds 10MB limit.");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      setModalError("Unsupported image format. Allowed: JPG, PNG, WebP, SVG.");
      return;
    }

    setSelectedFile(file);
    setModalError(null);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  // Handle Save (Create or Update)
  const handleSaveProject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setModalError(null);

    const formData = new FormData(e.currentTarget);
    if (selectedFile) {
      formData.set("file", selectedFile);
    }

    startTransition(async () => {
      let result;
      if (editingProject) {
        result = await updateProjectAction(editingProject.id, null, formData);
      } else {
        result = await createProjectAction(null, formData);
      }

      if (result.success) {
        setIsModalOpen(false);
        if (previewUrl && previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(previewUrl);
        }
      } else {
        setModalError(result.error || "Failed to save project.");
      }
    });
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = () => {
    if (!projectToDelete) return;
    startTransition(async () => {
      const result = await deleteProjectAction(projectToDelete.id);
      if (result.success) {
        setProjectToDelete(null);
      } else {
        alert(result.error || "Failed to delete project.");
      }
    });
  };

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/50 border border-emerald-800/40 text-[10px] font-semibold text-emerald-400">
            <CheckCircle2 className="w-2.5 h-2.5" />
            Completed
          </span>
        );
      case "in-development":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-950/50 border border-red-800/40 text-[10px] font-semibold text-red-400">
            <Clock className="w-2.5 h-2.5" />
            In Development
          </span>
        );
      case "planned":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#16191f] border border-white/10 text-[10px] font-semibold text-slate-400">
            Planned
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {!isConfigured && (
        <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-600/30 text-amber-200 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
          <span>Local Data Mode: Project modifications will not persist to MongoDB Atlas without active credentials.</span>
        </div>
      )}

      {/* Action, Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search & Status Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects by title, tech, or slug..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0a0b0d] border border-white/10 shrink-0 overflow-x-auto">
            {["All", "completed", "in-development", "planned"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                  statusFilter === st
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {st === "in-development" ? "In Dev" : st}
              </button>
            ))}
          </div>
        </div>

        {/* Add Project Button */}
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-[0_0_15px_rgba(229,9,20,0.4)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px] cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Add New Project</span>
        </button>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <div
              key={project.id}
              className="p-5 sm:p-6 rounded-2xl glass-card-elevated border border-white/10 hover:border-red-600/30 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
            >
              {/* Left: Thumbnail & Details */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {/* Media Thumbnail or Placeholder */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-[#040405] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden relative group">
                  {project.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.thumbnailUrl}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-500 p-2 text-center">
                      <FolderGit2 className="w-7 h-7 text-red-500/70 mb-1" aria-hidden="true" />
                      <span className="text-[9px] font-mono text-slate-500">No Image</span>
                    </div>
                  )}
                </div>

                {/* Metadata */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="crimson">{project.category}</Badge>
                    {getStatusBadge(project.status)}
                    {project.featured && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-950/60 border border-red-800/40 text-[10px] text-red-300 font-semibold">
                        <Sparkles className="w-2.5 h-2.5" aria-hidden="true" />
                        Featured
                      </span>
                    )}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                      Order: {project.displayOrder}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-slate-500 border border-white/[0.05]">
                      /{project.slug}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white truncate">
                    {project.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {project.shortDescription}
                  </p>

                  {/* Tech stack pills */}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {project.technologies.slice(0, 6).map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-[#0a0b0d] border border-white/[0.06] text-[10px] font-mono text-slate-300"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 6 && (
                        <span className="text-[10px] font-mono text-slate-500">
                          +{project.technologies.length - 6} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Public links preview */}
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                      >
                        <GithubIcon className="w-3 h-3" />
                        <span>GitHub</span>
                      </a>
                    )}
                    {project.liveDemoUrl && (
                      <a
                        href={project.liveDemoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Live Demo</span>
                      </a>
                    )}
                    {project.source === "local" && (
                      <span className="text-amber-400 text-[10px]">
                        (Local fallback record)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(project)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px] cursor-pointer"
                  aria-label={`Edit ${project.title}`}
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-300" aria-hidden="true" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProjectToDelete(project)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800/40 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px] cursor-pointer"
                  aria-label={`Delete ${project.title}`}
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 sm:p-12 rounded-2xl glass-card text-center text-slate-400 text-xs sm:text-sm">
            <FolderGit2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <span>No projects match your filter or search query.</span>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL: Create / Edit Project                             */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-form-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
        >
          <div className="relative max-w-2xl w-full bg-[#101216] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
              <div>
                <h2 id="project-form-title" className="text-lg sm:text-xl font-bold text-white">
                  {editingProject ? "Edit Project Details" : "Add New Project"}
                </h2>
                <p className="text-xs text-slate-400">
                  Manage engineering projects, technologies, repositories, and Cloudinary visuals.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                aria-label="Close project modal"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Error Message */}
            {modalError && (
              <div
                role="alert"
                className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-600/40 text-red-300 text-xs leading-relaxed flex items-start gap-2.5"
              >
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveProject} className="space-y-4">
              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Project Title *
                  </label>
                  <input
                    name="title"
                    type="text"
                    required
                    value={formTitle}
                    onChange={handleTitleChange}
                    placeholder="e.g. GPAHub Calculator"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Unique Slug * (lowercase-hyphenated)
                  </label>
                  <input
                    name="slug"
                    type="text"
                    required
                    value={formSlug}
                    onChange={(e) => {
                      setFormSlug(e.target.value.toLowerCase());
                      setIsSlugManuallyEdited(true);
                    }}
                    placeholder="e.g. gpahub-calc"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white font-mono text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
                  />
                </div>
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Category *
                  </label>
                  <select
                    name="category"
                    required
                    defaultValue={editingProject?.category || "Web Application"}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
                  >
                    {PROJECT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Project Status *
                  </label>
                  <select
                    name="status"
                    required
                    defaultValue={editingProject?.status || "completed"}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
                  >
                    <option value="completed">Completed</option>
                    <option value="in-development">In Development</option>
                    <option value="planned">Planned</option>
                  </select>
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Short Description / Tagline * (max 500 chars)
                </label>
                <textarea
                  name="shortDescription"
                  required
                  rows={2}
                  maxLength={500}
                  defaultValue={editingProject?.shortDescription || ""}
                  placeholder="Concise overview displayed on cards and homepage..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 resize-none"
                />
              </div>

              {/* Full Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Description (Optional detailed architecture breakdown)
                </label>
                <textarea
                  name="fullDescription"
                  rows={3}
                  maxLength={5000}
                  defaultValue={editingProject?.fullDescription || ""}
                  placeholder="Detailed project architecture, challenges solved, or algorithmic approach..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 resize-none"
                />
              </div>

              {/* Technologies */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Technologies / Stack * (comma separated)
                </label>
                <input
                  name="technologies"
                  type="text"
                  required
                  defaultValue={editingProject?.technologies?.join(", ") || ""}
                  placeholder="Next.js, TypeScript, MongoDB Atlas, Tailwind CSS"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
                />
              </div>

              {/* GitHub & Live Demo URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    GitHub URL (Optional)
                  </label>
                  <input
                    name="githubUrl"
                    type="url"
                    defaultValue={editingProject?.githubUrl || ""}
                    placeholder="https://github.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Live Demo URL (Optional)
                  </label>
                  <input
                    name="liveDemoUrl"
                    type="url"
                    defaultValue={editingProject?.liveDemoUrl || ""}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
                  />
                </div>
              </div>

              {/* Sort Order & Featured Flag */}
              <div className="flex items-center gap-6 pt-1">
                <div className="w-32">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Display Order
                  </label>
                  <input
                    name="displayOrder"
                    type="number"
                    defaultValue={editingProject?.displayOrder || 1}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    id="project-featured-checkbox"
                    name="featured"
                    type="checkbox"
                    defaultChecked={editingProject?.featured ?? true}
                    className="w-4 h-4 rounded border-white/20 bg-[#0a0b0d] text-red-600 focus:ring-red-600"
                  />
                  <label htmlFor="project-featured-checkbox" className="text-xs font-semibold text-slate-300">
                    Feature on Homepage Showcase
                  </label>
                </div>
              </div>

              {/* Thumbnail Image Upload Section */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Project Thumbnail Image (JPG, PNG, WebP, SVG, max 10MB)
                </label>
                <div className="p-4 rounded-2xl bg-[#0a0b0d] border border-white/10 border-dashed text-center">
                  <input
                    id="project-thumbnail-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                  <label
                    htmlFor="project-thumbnail-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold cursor-pointer transition-colors min-h-[44px]"
                  >
                    <Upload className="w-4 h-4 text-red-500" aria-hidden="true" />
                    <span>{selectedFile ? "Replace Selected Image" : "Upload Thumbnail Image"}</span>
                  </label>

                  {/* Preview */}
                  {previewUrl && (
                    <div className="mt-4 pt-3 border-t border-white/[0.08] flex flex-col items-center justify-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400">Image Preview:</span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt="Project thumbnail preview"
                        className="max-h-36 max-w-full rounded-lg border border-white/15 shadow-md object-contain"
                      />
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
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-[0_0_15px_rgba(229,9,20,0.4)] transition-all disabled:opacity-50 min-h-[44px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      <span>Saving to MongoDB & Cloudinary...</span>
                    </>
                  ) : (
                    <span>{editingProject ? "Update Project" : "Create Project"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: Delete Project Confirmation                       */}
      {/* ======================================================== */}
      {projectToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div className="max-w-md w-full bg-[#101216] border border-red-600/30 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-600/40 flex items-center justify-center text-red-500">
              <Trash2 className="w-6 h-6" aria-hidden="true" />
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Delete Project Confirmation
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Are you sure you want to permanently delete{" "}
                <span className="font-semibold text-white">&apos;{projectToDelete.title}&apos;</span>?
                This will remove the record from MongoDB Atlas and clean up any associated Cloudinary assets.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                disabled={isPending}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-[0_0_15px_rgba(229,9,20,0.4)] transition-all disabled:opacity-50 min-h-[44px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Confirm Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
