"use client";

import React, { useState, useTransition } from "react";
import type {
  PortfolioContentDisplay,
  SkillItem,
  ExperienceItem,
  EmploymentType,
} from "@/lib/mongodb/types";
import {
  saveHeroContentAction,
  saveAboutContentAction,
  createSkillAction,
  updateSkillAction,
  deleteSkillAction,
  createExperienceAction,
  updateExperienceAction,
  deleteExperienceAction,
} from "./actions";
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  X,
  Briefcase,
  Code2,
  User,
  Home,
  Save,
} from "lucide-react";

interface ContentManagerProps {
  initialContent: PortfolioContentDisplay;
  isConfigured: boolean;
}

export function ContentManager({
  initialContent,
  isConfigured,
}: ContentManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<
    "hero" | "about" | "skills" | "experience"
  >("hero");
  const [isPending, startTransition] = useTransition();

  // Notification states
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Skill states
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillItem | null>(null);
  const [skillToDelete, setSkillToDelete] = useState<SkillItem | null>(null);
  const [skillModalError, setSkillModalError] = useState<string | null>(null);

  // Experience states
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<ExperienceItem | null>(null);
  const [expToDelete, setExpToDelete] = useState<ExperienceItem | null>(null);
  const [expModalError, setExpModalError] = useState<string | null>(null);

  // Filter skills by category
  const [skillCategoryFilter, setSkillCategoryFilter] = useState<string>("All");

  const skillCategories = [
    "Languages & Core",
    "Frontend Engineering",
    "Backend & Databases",
    "AI & APIs Exploration",
    "Systems & Tools",
    "Mobile & Others",
  ];

  const employmentTypes: EmploymentType[] = [
    "Internship",
    "Independent",
    "Full-time",
    "Part-time",
    "Contract",
  ];

  // =========================================================================
  // Handlers
  // =========================================================================

  const handleSaveHero = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await saveHeroContentAction(null, formData);
      if (res.success) {
        setFeedback({
          type: "success",
          message: "Homepage Hero content successfully updated and published!",
        });
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Failed to update hero content.",
        });
      }
    });
  };

  const handleSaveAbout = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await saveAboutContentAction(null, formData);
      if (res.success) {
        setFeedback({
          type: "success",
          message: "About page biography & profile successfully updated!",
        });
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Failed to update about page content.",
        });
      }
    });
  };

  const handleSaveSkill = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSkillModalError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      let res;
      if (editingSkill) {
        res = await updateSkillAction(editingSkill.id, null, formData);
      } else {
        res = await createSkillAction(null, formData);
      }

      if (res.success) {
        setIsSkillModalOpen(false);
        setEditingSkill(null);
        setFeedback({
          type: "success",
          message: editingSkill
            ? "Skill updated successfully."
            : "New skill added successfully.",
        });
      } else {
        setSkillModalError(res.error || "Failed to save skill.");
      }
    });
  };

  const handleDeleteSkill = () => {
    if (!skillToDelete) return;
    startTransition(async () => {
      const res = await deleteSkillAction(skillToDelete.id);
      if (res.success) {
        setSkillToDelete(null);
        setFeedback({
          type: "success",
          message: `Skill "${skillToDelete.name}" deleted.`,
        });
      } else {
        alert(res.error || "Failed to delete skill.");
      }
    });
  };

  const handleSaveExperience = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setExpModalError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      let res;
      if (editingExp) {
        res = await updateExperienceAction(editingExp.id, null, formData);
      } else {
        res = await createExperienceAction(null, formData);
      }

      if (res.success) {
        setIsExpModalOpen(false);
        setEditingExp(null);
        setFeedback({
          type: "success",
          message: editingExp
            ? "Experience entry updated successfully."
            : "New experience entry created successfully.",
        });
      } else {
        setExpModalError(res.error || "Failed to save experience entry.");
      }
    });
  };

  const handleDeleteExperience = () => {
    if (!expToDelete) return;
    startTransition(async () => {
      const res = await deleteExperienceAction(expToDelete.id);
      if (res.success) {
        setExpToDelete(null);
        setFeedback({
          type: "success",
          message: `Experience record "${expToDelete.role}" deleted.`,
        });
      } else {
        alert(res.error || "Failed to delete experience record.");
      }
    });
  };

  const filteredSkills = initialContent.skills.filter((s) => {
    if (skillCategoryFilter === "All") return true;
    return s.category === skillCategoryFilter;
  });

  return (
    <div className="space-y-6">
      {/* Fallback Warning if MongoDB not configured */}
      {!isConfigured && (
        <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-600/30 text-amber-200 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
          <span>
            Local Data Mode: Content updates will not persist to MongoDB Atlas without configured credentials.
          </span>
        </div>
      )}

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs sm:text-sm flex items-center justify-between gap-3 ${
            feedback.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
              : "bg-red-950/40 border-red-500/40 text-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Content Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.08] pb-3">
        <button
          type="button"
          onClick={() => {
            setActiveSubTab("hero");
            setFeedback(null);
          }}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all min-h-[40px] cursor-pointer ${
            activeSubTab === "hero"
              ? "bg-red-600 text-white shadow-[0_0_15px_rgba(229,9,20,0.35)]"
              : "bg-[#0a0b0d] text-slate-400 hover:text-white border border-white/10"
          }`}
        >
          <Home className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Homepage Hero</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveSubTab("about");
            setFeedback(null);
          }}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all min-h-[40px] cursor-pointer ${
            activeSubTab === "about"
              ? "bg-red-600 text-white shadow-[0_0_15px_rgba(229,9,20,0.35)]"
              : "bg-[#0a0b0d] text-slate-400 hover:text-white border border-white/10"
          }`}
        >
          <User className="w-3.5 h-3.5" aria-hidden="true" />
          <span>About Page</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveSubTab("skills");
            setFeedback(null);
          }}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all min-h-[40px] cursor-pointer ${
            activeSubTab === "skills"
              ? "bg-red-600 text-white shadow-[0_0_15px_rgba(229,9,20,0.35)]"
              : "bg-[#0a0b0d] text-slate-400 hover:text-white border border-white/10"
          }`}
        >
          <Code2 className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Technical Skills</span>
          <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-[10px] font-mono">
            {initialContent.skills.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveSubTab("experience");
            setFeedback(null);
          }}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all min-h-[40px] cursor-pointer ${
            activeSubTab === "experience"
              ? "bg-red-600 text-white shadow-[0_0_15px_rgba(229,9,20,0.35)]"
              : "bg-[#0a0b0d] text-slate-400 hover:text-white border border-white/10"
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Experience & Internships</span>
          <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-[10px] font-mono">
            {initialContent.experiences.length}
          </span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* SUB-TAB 1: HOMEPAGE HERO                                              */}
      {/* ===================================================================== */}
      {activeSubTab === "hero" && (
        <form onSubmit={handleSaveHero} className="space-y-6 max-w-4xl">
          <div className="p-6 rounded-2xl glass-card-elevated border border-white/10 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-red-500" />
                <span>Homepage Hero Configuration</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Configure primary semantic heading, ambient status badge, and call-to-action destinations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Eyebrow Badge Text
                </label>
                <input
                  name="eyebrow"
                  type="text"
                  defaultValue={initialContent.hero.eyebrow}
                  placeholder="e.g. Phase 3A • Verified Portfolio"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Highlight Text (Crimson Gradient)
                </label>
                <input
                  name="highlightText"
                  type="text"
                  defaultValue={initialContent.hero.highlightText}
                  placeholder="e.g. Full Stack Web Developer"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Primary Heading Line *
              </label>
              <input
                name="heading"
                type="text"
                required
                defaultValue={initialContent.hero.heading}
                placeholder="e.g. Aspiring"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Subtitle & Developer Introduction *
              </label>
              <textarea
                name="subtitle"
                required
                rows={3}
                defaultValue={initialContent.hero.subtitle}
                placeholder="Hello, I'm Manish Kumar..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 resize-y"
              />
            </div>

            {/* CTAs */}
            <div className="pt-4 border-t border-white/[0.08] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Call-to-Action Buttons
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Primary CTA Label
                  </label>
                  <input
                    name="primaryCtaLabel"
                    type="text"
                    defaultValue={initialContent.hero.primaryCtaLabel}
                    placeholder="Explore Projects"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Primary CTA Destination
                  </label>
                  <input
                    name="primaryCtaUrl"
                    type="text"
                    defaultValue={initialContent.hero.primaryCtaUrl}
                    placeholder="#featured-projects or /projects"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Secondary CTA Label
                  </label>
                  <input
                    name="secondaryCtaLabel"
                    type="text"
                    defaultValue={initialContent.hero.secondaryCtaLabel}
                    placeholder="e.g. About Me (optional)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Secondary CTA Destination
                  </label>
                  <input
                    name="secondaryCtaUrl"
                    type="text"
                    defaultValue={initialContent.hero.secondaryCtaUrl}
                    placeholder="e.g. #about or /about"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Tertiary CTA Label
                  </label>
                  <input
                    name="tertiaryCtaLabel"
                    type="text"
                    defaultValue={initialContent.hero.tertiaryCtaLabel}
                    placeholder="Get in Touch"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Tertiary CTA Destination
                  </label>
                  <input
                    name="tertiaryCtaUrl"
                    type="text"
                    defaultValue={initialContent.hero.tertiaryCtaUrl}
                    placeholder="/contact"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end">
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold transition-colors min-h-[44px] cursor-pointer shadow-[0_0_20px_rgba(229,9,20,0.35)]"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Hero Content</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ===================================================================== */}
      {/* SUB-TAB 2: ABOUT PAGE                                                 */}
      {/* ===================================================================== */}
      {activeSubTab === "about" && (
        <form onSubmit={handleSaveAbout} className="space-y-6 max-w-4xl">
          <div className="p-6 rounded-2xl glass-card-elevated border border-white/10 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-red-500" />
                <span>About Page Profile & Narrative</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Manage the developer biography, academic highlights, and career objective.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Introduction Summary *
              </label>
              <textarea
                name="introduction"
                required
                rows={2}
                defaultValue={initialContent.about.introduction}
                placeholder="Computer Science student passionate about data structures..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 resize-y"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Detailed Biography Narrative *
              </label>
              <textarea
                name="biography"
                required
                rows={6}
                defaultValue={initialContent.about.biography}
                placeholder="Detailed narrative describing university education, projects, and LeetCode..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 resize-y"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Career Objective & Current Target Roles
              </label>
              <input
                name="careerObjective"
                type="text"
                defaultValue={initialContent.about.careerObjective}
                placeholder="e.g. Actively seeking Summer 2025/2026 Software Engineer Internships..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Location
                </label>
                <input
                  name="location"
                  type="text"
                  defaultValue={initialContent.about.location || ""}
                  placeholder="Jaipur, Rajasthan, India"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Academics Indicator
                </label>
                <input
                  name="academicsText"
                  type="text"
                  defaultValue={initialContent.about.academicsText || ""}
                  placeholder="B.Tech CSE (7.8 CGPA)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Problem Solving Indicator
                </label>
                <input
                  name="problemSolvingText"
                  type="text"
                  defaultValue={initialContent.about.problemSolvingText || ""}
                  placeholder="350+ LeetCode Solved"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end">
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold transition-colors min-h-[44px] cursor-pointer shadow-[0_0_20px_rgba(229,9,20,0.35)]"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save About Content</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ===================================================================== */}
      {/* SUB-TAB 3: TECHNICAL SKILLS                                           */}
      {/* ===================================================================== */}
      {activeSubTab === "skills" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSkillCategoryFilter("All")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  skillCategoryFilter === "All"
                    ? "bg-red-600 text-white"
                    : "bg-[#0a0b0d] text-slate-400 hover:text-white border border-white/10"
                }`}
              >
                All ({initialContent.skills.length})
              </button>
              {skillCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSkillCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    skillCategoryFilter === cat
                      ? "bg-red-600 text-white"
                      : "bg-[#0a0b0d] text-slate-400 hover:text-white border border-white/10"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingSkill(null);
                setSkillModalError(null);
                setIsSkillModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-all shadow-[0_0_15px_rgba(229,9,20,0.35)] min-h-[44px] cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Add Skill</span>
            </button>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSkills.map((skill) => (
              <div
                key={skill.id}
                className="p-4 rounded-xl glass-card-elevated border border-white/10 flex items-center justify-between gap-3 group hover:border-red-600/35 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{skill.name}</span>
                    {skill.featured && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-950/40 border border-amber-600/40 text-[9px] text-amber-300 font-mono">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono">
                    <span className="text-red-400">{skill.category}</span>
                    <span>•</span>
                    <span>Order: {skill.displayOrder}</span>
                    {skill.proficiency && (
                      <>
                        <span>•</span>
                        <span className="text-slate-500">{skill.proficiency}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSkill(skill);
                      setSkillModalError(null);
                      setIsSkillModalOpen(true);
                    }}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                    aria-label={`Edit ${skill.name}`}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSkillToDelete(skill)}
                    className="p-2 rounded-lg bg-red-950/30 hover:bg-red-900/40 text-red-400 hover:text-red-300 transition-colors"
                    aria-label={`Delete ${skill.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredSkills.length === 0 && (
            <div className="p-8 text-center rounded-2xl border border-white/10 text-slate-400 text-xs">
              No skills found in this category. Click &quot;Add Skill&quot; to create one.
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-TAB 4: EXPERIENCE & INTERNSHIPS                                   */}
      {/* ===================================================================== */}
      {activeSubTab === "experience" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                Experience Timeline Records
              </h2>
              <p className="text-xs text-slate-400">
                Manage internships, independent engineering development, and software positions.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingExp(null);
                setExpModalError(null);
                setIsExpModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-all shadow-[0_0_15px_rgba(229,9,20,0.35)] min-h-[44px] cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Add Experience</span>
            </button>
          </div>

          <div className="space-y-4">
            {initialContent.experiences.map((exp) => (
              <div
                key={exp.id}
                className="p-6 rounded-2xl glass-card-elevated border border-white/10 space-y-4 hover:border-red-600/35 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-white">{exp.role}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-red-950/40 border border-red-800/40 text-[10px] text-red-400 font-semibold">
                        {exp.employmentType}
                      </span>
                      {exp.currentRole && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-[10px] text-emerald-400 font-semibold">
                          Current Role
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-red-400/90 font-medium mt-0.5">
                      {exp.organization}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-mono">
                      {exp.startDate} – {exp.endDate}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingExp(exp);
                          setExpModalError(null);
                          setIsExpModalOpen(true);
                        }}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                        aria-label={`Edit ${exp.role}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpToDelete(exp)}
                        className="p-2 rounded-lg bg-red-950/30 hover:bg-red-900/40 text-red-400 hover:text-red-300 transition-colors"
                        aria-label={`Delete ${exp.role}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bullet Points */}
                {exp.description && exp.description.length > 0 && (
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {exp.description.map((b, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Skills tags */}
                {exp.skills && exp.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/[0.08]">
                    {exp.skills.map((s, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded bg-[#0a0b0d] border border-white/[0.08] text-[10px] font-mono text-slate-400"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {initialContent.experiences.length === 0 && (
              <div className="p-8 text-center rounded-2xl border border-white/10 text-slate-400 text-xs">
                No experience entries recorded yet. Click &quot;Add Experience&quot; to begin.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: CREATE / EDIT SKILL                                            */}
      {/* ===================================================================== */}
      {isSkillModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div className="relative max-w-md w-full bg-[#101216] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">
                {editingSkill ? "Edit Technical Skill" : "Add Technical Skill"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsSkillModalOpen(false);
                  setEditingSkill(null);
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {skillModalError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs">
                {skillModalError}
              </div>
            )}

            <form onSubmit={handleSaveSkill} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Skill Name *
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={editingSkill?.name || ""}
                  placeholder="e.g. Next.js, Python, Docker"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Category *
                </label>
                <select
                  name="category"
                  required
                  defaultValue={editingSkill?.category || skillCategories[0]}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
                >
                  {skillCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Proficiency
                  </label>
                  <input
                    name="proficiency"
                    type="text"
                    defaultValue={editingSkill?.proficiency || "Proficient"}
                    placeholder="e.g. Advanced"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Display Order
                  </label>
                  <input
                    name="displayOrder"
                    type="number"
                    min={1}
                    defaultValue={editingSkill?.displayOrder || 1}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
                  />
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    name="featured"
                    type="checkbox"
                    defaultChecked={editingSkill?.featured ?? true}
                    className="rounded border-white/20 bg-[#0a0b0d] text-red-600 focus:ring-red-600 w-4 h-4"
                  />
                  <span>Feature on public highlight cards</span>
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSkillModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold transition-colors min-h-[44px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors min-h-[44px] cursor-pointer"
                >
                  {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{editingSkill ? "Update Skill" : "Add Skill"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: DELETE SKILL CONFIRMATION                                      */}
      {/* ===================================================================== */}
      {skillToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div className="relative max-w-sm w-full bg-[#101216] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-950/40 border border-red-600/30 flex items-center justify-center text-red-500">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Delete Skill?</h3>
              <p className="mt-1 text-xs text-slate-400">
                Are you sure you want to remove &quot;{skillToDelete.name}&quot; from your skillset?
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSkillToDelete(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSkill}
                disabled={isPending}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: CREATE / EDIT EXPERIENCE                                       */}
      {/* ===================================================================== */}
      {isExpModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
        >
          <div className="relative max-w-xl w-full bg-[#101216] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">
                {editingExp ? "Edit Experience Entry" : "Add Experience Entry"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsExpModalOpen(false);
                  setEditingExp(null);
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {expModalError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs">
                {expModalError}
              </div>
            )}

            <form onSubmit={handleSaveExperience} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Role Title *
                  </label>
                  <input
                    name="role"
                    type="text"
                    required
                    defaultValue={editingExp?.role || ""}
                    placeholder="e.g. Software Engineer Intern"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Organization / Company *
                  </label>
                  <input
                    name="organization"
                    type="text"
                    required
                    defaultValue={editingExp?.organization || ""}
                    placeholder="e.g. AICTE / IBM SkillsBuild"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Employment Type
                  </label>
                  <select
                    name="employmentType"
                    defaultValue={editingExp?.employmentType || "Independent"}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
                  >
                    {employmentTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Start Date / Period
                  </label>
                  <input
                    name="startDate"
                    type="text"
                    defaultValue={editingExp?.startDate || "2024"}
                    placeholder="e.g. 08/2024"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    End Date / Status
                  </label>
                  <input
                    name="endDate"
                    type="text"
                    defaultValue={editingExp?.endDate || "Present"}
                    placeholder="e.g. Present"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Location (optional)
                </label>
                <input
                  name="location"
                  type="text"
                  defaultValue={editingExp?.location || ""}
                  placeholder="e.g. Remote India or Jaipur, Rajasthan"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    name="currentRole"
                    type="checkbox"
                    defaultChecked={editingExp?.currentRole ?? true}
                    className="rounded border-white/20 bg-[#0a0b0d] text-red-600 focus:ring-red-600 w-4 h-4"
                  />
                  <span>Currently Active Position</span>
                </label>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Display Order:</span>
                  <input
                    name="displayOrder"
                    type="number"
                    min={1}
                    defaultValue={editingExp?.displayOrder || 1}
                    className="w-16 px-2 py-1 rounded-lg bg-[#0a0b0d] border border-white/10 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Contributions & Description (One bullet per line)
                </label>
                <textarea
                  name="description"
                  rows={4}
                  defaultValue={editingExp?.description?.join("\n") || ""}
                  placeholder="Architected and deployed GPAHub...\nCo-developed AquaAlert AI prototype..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Applied Skills (Comma-separated)
                </label>
                <input
                  name="skills"
                  type="text"
                  defaultValue={editingExp?.skills?.join(", ") || ""}
                  placeholder="Next.js, MongoDB Atlas, TypeScript, Tailwind CSS"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0d] border border-white/10 text-white text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 min-h-[44px]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsExpModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold min-h-[44px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors min-h-[44px] cursor-pointer"
                >
                  {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{editingExp ? "Update Entry" : "Create Entry"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: DELETE EXPERIENCE CONFIRMATION                                 */}
      {/* ===================================================================== */}
      {expToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div className="relative max-w-sm w-full bg-[#101216] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-950/40 border border-red-600/30 flex items-center justify-center text-red-500">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Delete Experience?</h3>
              <p className="mt-1 text-xs text-slate-400">
                Are you sure you want to remove &quot;{expToDelete.role}&quot; at {expToDelete.organization}?
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setExpToDelete(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteExperience}
                disabled={isPending}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
