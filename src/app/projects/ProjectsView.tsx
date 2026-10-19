"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import type { ProjectDisplay } from "@/lib/mongodb/types";
import { mapLocalProjectsToDisplay } from "@/lib/mongodb/shared";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { GithubIcon } from "@/components/ui/Icons";
import { ArrowLeft, ExternalLink, Sparkles, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectsViewProps {
  initialProjects?: ProjectDisplay[];
}

export function ProjectsView({ initialProjects }: ProjectsViewProps) {
  const projects = useMemo(() => {
    if (initialProjects && initialProjects.length > 0) {
      return initialProjects;
    }
    return mapLocalProjectsToDisplay();
  }, [initialProjects]);

  const hasProjects = projects.length > 0;

  // Extract all categories
  const categories = useMemo(() => {
    if (!hasProjects) return [];
    const cats = Array.from(new Set(projects.map((p) => p.category)));
    return ["All", ...cats];
  }, [hasProjects, projects]);

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredProjects = useMemo(() => {
    if (!hasProjects) return [];
    let list = projects;

    if (activeCategory !== "All") {
      list = list.filter((p) => p.category === activeCategory);
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.technologies.some((t) => t.toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => a.displayOrder - b.displayOrder);
  }, [hasProjects, projects, activeCategory, searchQuery]);

  return (
    <Section
      id="projects-list"
      titleAs="h1"
      containerSize="lg"
      title="All Engineering Projects"
      description="Production web applications, client-side tools, full-stack architectures, and IoT hardware experiments built by Manish Kumar."
    >
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-red-400 transition-colors p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Back to Homepage</span>
        </Link>
      </div>

      {hasProjects ? (
        <div>
          {/* Search Bar & Category Controls */}
          <div className="space-y-4 mb-8">
            <div className="relative max-w-md">
              <label htmlFor="projects-search" className="sr-only">
                Search projects by title, technology, or keywords
              </label>
              <div className="relative">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="projects-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects (e.g. Next.js, React, Python)..."
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

            {/* Category Filter Tabs */}
            {categories.length > 1 && (
              <div
                role="tablist"
                aria-label="Filter projects by category"
                className="flex flex-wrap items-center gap-2 pt-2"
              >
                {categories.map((cat) => {
                  const isActive = activeCategory === cat;
                  const count =
                    cat === "All"
                      ? projects.length
                      : projects.filter((p) => p.category === cat).length;

                  return (
                    <button
                      key={cat}
                      role="tab"
                      aria-selected={isActive}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={cn(
                        "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 cursor-pointer min-h-[44px] min-w-[44px]",
                        isActive
                          ? "bg-red-600 text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]"
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
              </div>
            )}
          </div>

          {/* All Projects Grid */}
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((proj: ProjectDisplay) => {
                const statusKey = (proj.status || "").toLowerCase();
                const isCompleted = statusKey === "completed";
                const isInDev = statusKey.includes("dev");
                const statusStyles = isCompleted
                  ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/40"
                  : isInDev
                  ? "bg-red-950/40 text-red-400 border-red-800/40"
                  : "bg-[#16191f] text-slate-400 border-white/10";
                const statusLabel = isCompleted
                  ? "Completed"
                  : isInDev
                  ? "In Development"
                  : "Planned";

                return (
                  <div
                    key={proj.id}
                    className="p-6 rounded-2xl glass-card-elevated border border-white/10 hover:border-red-600/35 transition-all duration-300 flex flex-col justify-between h-full group overflow-hidden"
                  >
                    <div>
                      {/* Thumbnail Image if uploaded */}
                      {proj.thumbnailUrl && (
                        <div className="relative w-[calc(100%+3rem)] -mt-6 -mx-6 mb-5 aspect-[16/10] bg-[#07080a] border-b border-white/[0.08] overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={proj.thumbnailUrl}
                            alt={`Preview for ${proj.title}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      )}

                      {/* Header: Category & Status */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <Badge variant="crimson">{proj.category}</Badge>
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[11px] font-medium border capitalize",
                            statusStyles
                          )}
                        >
                          {statusLabel}
                        </span>
                      </div>

                      <h2 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors mb-2">
                        {proj.title}
                      </h2>

                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                        {proj.shortDescription}
                      </p>

                      {/* Tech Stack Pills */}
                      {proj.technologies && proj.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-6">
                          {proj.technologies.map((tech, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-1 rounded bg-[#0a0b0d] border border-white/[0.08] text-[11px] font-mono text-slate-300"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions & Verification Badges */}
                    <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-3">
                      {proj.githubUrl ? (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors min-h-[44px] min-w-[44px] px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded"
                          aria-label={`View ${proj.title} source code on GitHub`}
                        >
                          <GithubIcon className="w-4 h-4" aria-hidden="true" />
                          <span>GitHub Source</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-mono">
                          {isInDev ? "Monorepo in development" : "Embedded hardware build"}
                        </span>
                      )}

                      {proj.liveDemoUrl ? (
                        <a
                          href={proj.liveDemoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors min-h-[44px] min-w-[44px] px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded"
                          aria-label={`Visit live deployment of ${proj.title}`}
                        >
                          <span>Live Demo</span>
                          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                        </a>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 sm:p-12 rounded-2xl glass-card text-center text-slate-400 text-xs sm:text-sm">
              <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <span>No projects match your search query &apos;{searchQuery}&apos;.</span>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 sm:p-12 rounded-2xl glass-card-elevated text-center max-w-2xl mx-auto border border-white/10">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-950/40 border border-red-600/30 flex items-center justify-center text-red-500 mb-4 shadow-[0_0_20px_rgba(229,9,20,0.2)]">
            <Sparkles className="w-7 h-7" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Projects in Preparation</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Real projects will be populated here without any fabricated repositories.
          </p>
        </div>
      )}
    </Section>
  );
}
