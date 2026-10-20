"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import type { SkillItem } from "@/lib/mongodb/types";
import { personalData } from "@/data/personal";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import {
  ArrowLeft,
  Code2,
  Server,
  BrainCircuit,
  Layers,
  Search,
  X,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Check,
  ExternalLink,
  Cpu,
  Terminal,
  Database,
  Grid3X3,
  ListFilter,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SkillsViewProps {
  initialSkills?: SkillItem[];
}

// Project mappings to enrich skills with practical proof
const SKILL_PROJECT_MAP: Record<string, { title: string; href: string }> = {
  "C": { title: "Foundational Programming", href: "/education" },
  "C++": { title: "Ultrasonic Security System", href: "/projects" },
  "Python": { title: "NPTEL Certified Coursework", href: "/certificates" },
  "Data Structures and Algorithms": { title: "350+ LeetCode Solved", href: "https://leetcode.com/u/Manish_kumar4774" },
  "Problem Solving": { title: "Algorithmic Challenges", href: "https://leetcode.com/u/Manish_kumar4774" },
  "Decision Making": { title: "Software Architecture", href: "/about" },
  "HTML": { title: "GPAHub & PixOptimize", href: "/projects" },
  "CSS": { title: "Responsive Web Design", href: "/projects" },
  "Javascript": { title: "AquaAlert AI & Web Apps", href: "/projects#aquaalert-ai" },
  "Bootstrap": { title: "Responsive Layouts", href: "/projects" },
  "Node.js": { title: "PitStop Backend", href: "/projects" },
  "Git": { title: "Version Control Workflow", href: "https://github.com/Manishkumar4652" },
  "GitHub": { title: "Open-Source Repositories", href: "https://github.com/Manishkumar4652" },
  "VS code": { title: "Primary Code Editor", href: "/about" },
  "Antigravity": { title: "Advanced Agentic IDE", href: "/about" },
  "React": { title: "GPAHub", href: "/projects#gpahub" },
  "Next.js": { title: "PixOptimize & PitStop", href: "/projects" },
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "Programming Languages": Terminal,
  "Core Concepts": BrainCircuit,
  "Web Technologies": Layers,
  "Tools & Platforms": Server,
  "Languages & Core": Terminal,
  "Frontend Engineering": Layers,
  "Backend & Databases": Database,
  "AI & APIs Exploration": BrainCircuit,
  "General": Code2,
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "Programming Languages":
    "Core programming languages (C, C++, Python) for systems programming, data structures, and algorithmic computational logic.",
  "Core Concepts":
    "Theoretical and practical foundations of Computer Science, algorithms, problem-solving paradigms, and architectural decision-making.",
  "Web Technologies":
    "Modern web development stack including HTML, CSS, Javascript, Bootstrap, and Node.js for client-side and server-side applications.",
  "Tools & Platforms":
    "Essential developer tooling, distributed version control, code editors, and agentic workflows (Git, GitHub, VS code, Antigravity).",
  "Languages & Core":
    "Foundational computer science, algorithmic efficiency, structured typing, and clean code paradigms.",
  "Frontend Engineering":
    "Modern reactive component architectures, state management, client-side graphic optimization, and responsive design systems.",
  "Backend & Databases":
    "Scalable REST APIs, schema design, document stores, version control workflows, and server-side runtimes.",
  "AI & APIs Exploration":
    "Applied large language model integrations, prompt engineering techniques, and intelligent automation services.",
};

export function SkillsView({ initialSkills }: SkillsViewProps) {
  // Build unified skills array from MongoDB or fallback to personalData
  const skills: SkillItem[] = useMemo(() => {
    if (initialSkills && initialSkills.length > 0) {
      return initialSkills;
    }

    const fallback: SkillItem[] = [];
    let counter = 1;
    for (const cat of personalData.skills) {
      for (const s of cat.skills) {
        fallback.push({
          id: `fallback-${counter}`,
          name: s,
          category: cat.title,
          proficiency: s.includes("LeetCode") || s === "Data Structures & Algorithms" || s === "Next.js" || s === "React"
            ? "Advanced"
            : "Proficient",
          featured: true,
          displayOrder: counter++,
        });
      }
    }
    return fallback;
  }, [initialSkills]);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeProficiency, setActiveProficiency] = useState("All");
  const [viewMode, setViewMode] = useState<"grouped" | "matrix">("grouped");

  // Dynamic category list
  const categories = useMemo(() => {
    const set = new Set(skills.map((s) => s.category || "General"));
    return ["All", ...Array.from(set)];
  }, [skills]);

  // Filtered skills
  const filteredSkills = useMemo(() => {
    return skills.filter((skill) => {
      // Category filter
      if (activeCategory !== "All" && (skill.category || "General") !== activeCategory) {
        return false;
      }
      // Proficiency filter
      if (activeProficiency !== "All") {
        const p = skill.proficiency || "Proficient";
        if (p.toLowerCase() !== activeProficiency.toLowerCase()) {
          return false;
        }
      }
      // Search query filter
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = skill.name.toLowerCase().includes(q);
        const matchesCategory = (skill.category || "").toLowerCase().includes(q);
        const matchesProficiency = (skill.proficiency || "").toLowerCase().includes(q);
        return matchesName || matchesCategory || matchesProficiency;
      }
      return true;
    });
  }, [skills, activeCategory, activeProficiency, searchQuery]);

  // Grouped skills for the categorized view
  const groupedSkills = useMemo(() => {
    const map = new Map<string, SkillItem[]>();
    for (const skill of filteredSkills) {
      const cat = skill.category || "General";
      if (!map.has(cat)) {
        map.set(cat, []);
      }
      map.get(cat)!.push(skill);
    }
    return Array.from(map.entries()).map(([title, items]) => ({
      title,
      items,
    }));
  }, [filteredSkills]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setActiveCategory("All");
    setActiveProficiency("All");
  };

  const isFiltering = searchQuery.trim() !== "" || activeCategory !== "All" || activeProficiency !== "All";

  return (
    <Section
      id="skills-directory"
      titleAs="h1"
      containerSize="lg"
      title="Engineering Capabilities & Skills"
      description="Comprehensive index of programming languages, frameworks, databases, and AI tooling actively applied across Manish Kumar's engineering workflow."
    >
      {/* Top Navigation & Quick Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-white/[0.08]">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-red-400 transition-colors p-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Back to Homepage</span>
        </Link>

        {/* Highlight Metrics */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#101216] border border-white/10 text-slate-200 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
            <span>{skills.length} Technical Competencies</span>
          </span>

          <a
            href="https://leetcode.com/u/Manish_kumar4774"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-950/40 border border-amber-600/30 text-amber-300 font-medium hover:border-amber-500 transition-colors"
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
            <span>350+ LeetCode Solved</span>
          </a>

          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#101216] border border-white/10 text-slate-400 font-mono text-[11px]">
            <Cpu className="w-3 h-3 text-red-500" aria-hidden="true" />
            <span>{categories.length > 1 ? categories.length - 1 : 4} Engineering Domains</span>
          </span>
        </div>
      </div>

      {/* Featured Core Specialization Strip */}
      <div className="mb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl glass-card-elevated border border-white/10 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-950/40 border border-red-600/30 flex items-center justify-center text-red-500 shrink-0">
            <Terminal className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Programming Languages</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              C, C++, Python for low-level systems, algorithms, and computational logic.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-card-elevated border border-white/10 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-950/40 border border-red-600/30 flex items-center justify-center text-red-500 shrink-0">
            <BrainCircuit className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Core Concepts</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Data Structures and Algorithms, analytical Problem Solving, Decision Making.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-card-elevated border border-white/10 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-950/40 border border-red-600/30 flex items-center justify-center text-red-500 shrink-0">
            <Layers className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Web Technologies</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              HTML, CSS, Javascript, Bootstrap, Node.js for modern web applications.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-card-elevated border border-white/10 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-950/40 border border-red-600/30 flex items-center justify-center text-red-500 shrink-0">
            <Server className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Tools & Platforms</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Git, GitHub, VS code, Antigravity for seamless agentic developer workflows.
            </p>
          </div>
        </div>
      </div>

      {/* Search, Filter & Layout Controls */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <label htmlFor="skill-search" className="sr-only">
              Search skills by name, domain, or proficiency
            </label>
            <div className="relative">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="skill-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search skills (e.g. Next.js, Python, MongoDB, AI)..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded min-w-[32px] min-h-[32px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 cursor-pointer"
                  aria-label="Clear search query"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {/* View Mode & Filter Controls */}
          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-[#0a0b0d] border border-white/10">
              <button
                type="button"
                onClick={() => setViewMode("grouped")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer min-h-[36px]",
                  viewMode === "grouped"
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                )}
                aria-label="Grouped category cards view"
              >
                <Grid3X3 className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Categorized</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("matrix")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer min-h-[36px]",
                  viewMode === "matrix"
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                )}
                aria-label="All skills matrix view"
              >
                <ListFilter className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">All Skills Matrix</span>
              </button>
            </div>

            {/* Results counter */}
            <div className="text-xs text-slate-400 font-mono hidden md:block">
              <span className="text-white font-semibold">{filteredSkills.length}</span> of{" "}
              <span>{skills.length}</span> skills
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2" role="tablist" aria-label="Filter skills by domain">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            const count =
              cat === "All"
                ? skills.length
                : skills.filter((s) => (s.category || "General") === cat).length;

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

          {/* Reset Filters Quick Button */}
          {isFiltering && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/20 border border-red-800/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 cursor-pointer min-h-[44px]"
              aria-label="Reset all search queries and category filters"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {filteredSkills.length > 0 ? (
        viewMode === "grouped" ? (
          /* ======================================================== */
          /* GROUPED CARDS VIEW (Categorized Domains)                 */
          /* ======================================================== */
          <div className="space-y-8">
            {groupedSkills.map((group) => {
              const IconComp = CATEGORY_ICONS[group.title] || Code2;
              const desc = CATEGORY_DESCRIPTIONS[group.title] || "Core engineering technologies and workflows.";

              return (
                <div
                  key={group.title}
                  className="p-6 sm:p-8 rounded-2xl glass-card-elevated border border-white/10 relative overflow-hidden group"
                >
                  {/* Subtle crimson accent glow */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-3xl pointer-events-none group-hover:bg-red-600/10 transition-colors" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-white/[0.08]">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-red-950/40 border border-red-600/30 flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(229,9,20,0.2)]">
                        <IconComp className="w-6 h-6" aria-hidden="true" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                          <span>{group.title}</span>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 font-mono">
                            {group.items.length}
                          </span>
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                          {desc}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Skills Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                    {group.items.map((skill, sIdx) => {
                      const projectLink = SKILL_PROJECT_MAP[skill.name];
                      const proficiency = skill.proficiency || "Proficient";

                      return (
                        <div
                          key={`${skill.id}-${group.title}-${skill.name}-${sIdx}`}
                          className="p-3.5 rounded-xl bg-[#08090b] border border-white/[0.08] hover:border-red-600/40 transition-all flex flex-col justify-between group/item"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="text-xs font-semibold text-white group-hover/item:text-red-400 transition-colors flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-red-500 shrink-0" aria-hidden="true" />
                                <span>{skill.name}</span>
                              </span>
                              <span
                                className={cn(
                                  "text-[10px] px-1.5 py-0.5 rounded font-mono font-medium",
                                  proficiency.toLowerCase() === "advanced"
                                    ? "bg-red-950/60 border border-red-600/40 text-red-300"
                                    : "bg-white/5 border border-white/10 text-slate-400"
                                )}
                              >
                                {proficiency}
                              </span>
                            </div>

                            {projectLink && (
                              <div className="mt-2 pt-2 border-t border-white/[0.04]">
                                {projectLink.href.startsWith("http") ? (
                                  <a
                                    href={projectLink.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[11px] text-slate-400 hover:text-white inline-flex items-center gap-1 transition-colors"
                                  >
                                    <span>{projectLink.title}</span>
                                    <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                                  </a>
                                ) : (
                                  <Link
                                    href={projectLink.href}
                                    className="text-[11px] text-slate-400 hover:text-red-300 inline-flex items-center gap-1 transition-colors"
                                  >
                                    <span>{projectLink.title}</span>
                                    <span className="text-red-500">→</span>
                                  </Link>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ======================================================== */
          /* ALL SKILLS MATRIX VIEW (Dense Searchable Grid)           */
          /* ======================================================== */
          <div className="p-6 sm:p-8 rounded-2xl glass-card-elevated border border-white/10">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredSkills.map((skill, mIdx) => {
                const projectLink = SKILL_PROJECT_MAP[skill.name];
                const proficiency = skill.proficiency || "Proficient";
                const IconComp = CATEGORY_ICONS[skill.category] || Code2;

                return (
                  <div
                    key={`${skill.id}-${skill.category}-${skill.name}-${mIdx}`}
                    className="p-4 rounded-xl bg-[#0a0b0d] border border-white/[0.08] hover:border-red-600/40 transition-all flex flex-col justify-between group/matrix"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-red-950/30 border border-red-600/20 flex items-center justify-center text-red-500">
                          <IconComp className="w-4 h-4" aria-hidden="true" />
                        </div>
                        <Badge variant="charcoal" className="text-[10px]">
                          {skill.category}
                        </Badge>
                      </div>

                      <h3 className="text-sm font-bold text-white group-hover/matrix:text-red-400 transition-colors mt-2">
                        {skill.name}
                      </h3>

                      <div className="mt-1 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="text-xs text-slate-400">{proficiency}</span>
                      </div>
                    </div>

                    {projectLink && (
                      <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] text-slate-400 flex items-center justify-between">
                        <span>Applied in:</span>
                        {projectLink.href.startsWith("http") ? (
                          <a
                            href={projectLink.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-400 hover:underline inline-flex items-center gap-1"
                          >
                            <span>{projectLink.title}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : (
                          <Link href={projectLink.href} className="text-red-400 hover:underline">
                            {projectLink.title}
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )
      ) : (
        /* Empty State */
        <div className="p-8 sm:p-12 rounded-2xl glass-card-elevated border border-white/10 text-center max-w-xl mx-auto my-6">
          <div className="w-12 h-12 mx-auto rounded-full bg-red-950/40 border border-red-600/30 flex items-center justify-center text-red-500 mb-4 shadow-[0_0_15px_rgba(229,9,20,0.2)]">
            <Search className="w-6 h-6" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No Matching Skills Found</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
            No technical skills match &ldquo;<span className="text-white font-medium">{searchQuery}</span>&rdquo;
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

      {/* Practical Verification Footer Cards */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl glass-card-elevated border border-white/10 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-red-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Proof of Work</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">
              Explore Shipped Projects
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Every skill listed above is backed by production code in live projects such as GPAHub, PixOptimize, and AquaAlert AI.
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-white/[0.08]">
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
            >
              <span>View Projects Showcase</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        <div className="p-6 rounded-2xl glass-card-elevated border border-white/10 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-red-400 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              <span>Accreditation Records</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">
              Verified Certifications
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Accredited coursework from NPTEL / SWAYAM (Python), ExcelR (DSA), and Google (Prompt Engineering).
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-white/[0.08]">
            <Link
              href="/certificates"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
            >
              <span>View Verified Certificates</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}
