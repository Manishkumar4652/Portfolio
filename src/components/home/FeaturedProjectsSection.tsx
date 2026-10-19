"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import type { ProjectDisplay } from "@/lib/mongodb/types";
import { mapLocalProjectsToDisplay } from "@/lib/mongodb/shared";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { GithubIcon } from "@/components/ui/Icons";
import {
  FolderGit2,
  ExternalLink,
  Code,
  ArrowRight,
  Sparkles,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FeaturedProjectsSectionProps {
  initialProjects?: ProjectDisplay[];
}

export function FeaturedProjectsSection({
  initialProjects,
}: FeaturedProjectsSectionProps) {
  const projects = useMemo(() => {
    if (initialProjects && initialProjects.length > 0) {
      return initialProjects;
    }
    return mapLocalProjectsToDisplay();
  }, [initialProjects]);

  const hasProjects = projects.length > 0;

  // Extract unique categories if projects exist
  const categories = useMemo(() => {
    if (!hasProjects) return [];
    const cats = Array.from(new Set(projects.map((p) => p.category)));
    return ["All", ...cats];
  }, [hasProjects, projects]);

  const [activeCategory, setActiveCategory] = useState<string>("All");

  // On the homepage, display up to 3 featured projects sorted by displayOrder
  const displayProjects = useMemo(() => {
    if (!hasProjects) return [];
    if (activeCategory === "All") {
      const featured = projects.filter((p) => p.featured);
      return (featured.length > 0 ? featured : projects)
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .slice(0, 3);
    }
    return projects
      .filter((p) => p.category === activeCategory)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .slice(0, 3);
  }, [hasProjects, projects, activeCategory]);

  return (
    <Section
      id="featured-projects"
      containerSize="lg"
      title="Featured Engineering Projects"
      description="Curated web architectures, API integrations, and practical systems built by Manish Kumar."
      className="border-t border-white/[0.08]"
    >
      {hasProjects ? (
        <div>
          {/* Category Filter Bar (Only if categories exist) */}
          {categories.length > 1 && (
            <div
              role="tablist"
              aria-label="Filter featured projects by category"
              className="flex flex-wrap items-center gap-2 mb-8"
            >
              {categories.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    role="tab"
                    aria-selected={isActive}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 cursor-pointer min-h-[44px] min-w-[44px]",
                      isActive
                        ? "bg-red-600 text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]"
                        : "bg-[#0a0b0d] text-slate-400 hover:text-white hover:bg-white/5 border border-white/10"
                    )}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          )}

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProjects.map((proj: ProjectDisplay, idx: number) => {
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
                <ScrollReveal key={proj.id} delay={idx * 100}>
                  <div className="p-6 rounded-2xl glass-card-elevated border border-white/10 hover:border-red-600/35 transition-all duration-300 flex flex-col justify-between h-full group overflow-hidden">
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

                      {/* Category and Status row */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <Badge variant="crimson">{proj.category}</Badge>
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize",
                            statusStyles
                          )}
                        >
                          {statusLabel}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors mb-2">
                        {proj.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                        {proj.shortDescription}
                      </p>

                      {/* Tech Stack Tags */}
                      {proj.technologies && proj.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-6">
                          {proj.technologies.map((tech, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-1 rounded-lg bg-[#0a0b0d] border border-white/[0.08] text-xs font-mono text-slate-300"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions Row */}
                    <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-3">
                      {proj.githubUrl ? (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors min-h-[44px] min-w-[44px] px-2 py-1"
                          aria-label={`View ${proj.title} source code on GitHub`}
                        >
                          <GithubIcon className="w-4 h-4" aria-hidden="true" />
                          <span>Code</span>
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">
                          {isInDev ? "Repo in dev" : "Internal build"}
                        </span>
                      )}

                      {proj.liveDemoUrl ? (
                        <a
                          href={proj.liveDemoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors min-h-[44px] min-w-[44px] px-2 py-1"
                          aria-label={`View live demo of ${proj.title}`}
                        >
                          <span>Live Demo</span>
                          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                        </a>
                      ) : null}
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>

          {/* Link to view all projects if there are more than 3 */}
          <div className="mt-10 flex justify-center">
            <Button
              href="/projects"
              variant="secondary"
              size="lg"
            >
              <span>Explore All Projects ({projects.length})</span>
              <ArrowRight className="w-4 h-4 ml-1 text-red-500" aria-hidden="true" />
            </Button>
          </div>
        </div>
      ) : (
        /* Standby Showcase State */
        <ScrollReveal>
          <div className="p-8 sm:p-12 rounded-2xl glass-card-elevated border border-white/10 text-center max-w-3xl mx-auto relative overflow-hidden">
            <div
              className="absolute inset-0 bg-radial from-red-600/10 via-transparent to-transparent pointer-events-none"
              aria-hidden="true"
            />

            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-red-950/40 border border-red-600/30 flex items-center justify-center text-red-500 mb-5 shadow-[0_0_25px_rgba(229,9,20,0.25)]">
                <FolderGit2 className="w-8 h-8" aria-hidden="true" />
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/30 border border-red-800/40 text-red-400 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Curated Showcase Pipeline</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                Featured Projects in Active Preparation
              </h3>

              <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl mx-auto mb-6">
                Following strict portfolio integrity rules, no dummy metrics, fabricated user counts, or placeholder repositories are published.
                Manish Kumar&apos;s real full-stack web applications and AI/ML experiments will appear here directly as they are plugged into{" "}
                <code className="text-red-300 font-mono text-xs">src/data/personal.ts</code> or the upcoming CMS.
              </p>

              {/* Schema Structure Demonstration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-2xl mx-auto mb-8 p-4 rounded-xl bg-[#0a0b0d] border border-white/[0.08]">
                <div className="flex items-start gap-2.5">
                  <Layers className="w-4 h-4 text-red-500 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <h4 className="text-xs font-semibold text-white">Web Applications</h4>
                    <p className="text-xs text-slate-400">Next.js & React architectures</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Code className="w-4 h-4 text-red-500 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <h4 className="text-xs font-semibold text-white">Full-Stack APIs</h4>
                    <p className="text-xs text-slate-400">REST, Node.js & DB schemas</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-red-500 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <h4 className="text-xs font-semibold text-white">AI / ML Systems</h4>
                    <p className="text-xs text-slate-400">Machine learning models & tools</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button href="/projects" variant="primary" size="md">
                  <span>View Projects Hub</span>
                  <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
                </Button>
                <Button href="/contact" variant="secondary" size="md">
                  <span>Inquire About Current Codebases</span>
                </Button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      )}
    </Section>
  );
}
