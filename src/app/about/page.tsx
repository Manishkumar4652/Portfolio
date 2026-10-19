import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { personalData } from "@/data/personal";
import { siteConfig } from "@/config/site";
import { ArrowLeft, CheckCircle2, Code2, MapPin, Globe, Sparkles, FileText, Download, Eye } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/Icons";
import Link from "next/link";

import { connection } from "next/server";
import { getPortfolioContent } from "@/lib/mongodb/content";
import { getActiveResume } from "@/lib/mongodb/resume";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn more about Manish Kumar Prajapat, Computer Science student at The ICFAI University Jaipur and software developer.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: `About | ${siteConfig.author}`,
    description:
      "Learn more about Manish Kumar Prajapat, Computer Science student at The ICFAI University Jaipur and software developer.",
    url: `${siteConfig.url}/about`,
    type: "website",
  },
};

export const instant = false;

export default async function AboutPage() {
  await connection();
  const [content, resume] = await Promise.all([
    getPortfolioContent(),
    getActiveResume(),
  ]);
  const { about, skills } = content;

  // Group dynamic skills by category for sidebar toolkit
  const skillCategoriesMap = new Map<string, string[]>();
  for (const s of skills) {
    const cat = s.category || "General";
    if (!skillCategoriesMap.has(cat)) skillCategoriesMap.set(cat, []);
    skillCategoriesMap.get(cat)!.push(s.name);
  }
  const categoryGroups = Array.from(skillCategoriesMap.entries()).map(([title, skillNames]) => ({
    title,
    skills: skillNames,
  }));

  const displayCategories = categoryGroups.length > 0 ? categoryGroups : personalData.skills;

  return (
    <div className="pb-8 sm:pb-12">
      <Section
        id="about-bio"
        titleAs="h1"
        containerSize="lg"
        title={`About ${personalData.identity.preferredName}`}
        description={about.introduction || "Computer Science student passionate about data structures, scalable web applications, and artificial intelligence."}
      >
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-red-400 transition-colors p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Back to Homepage</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Story & Profile */}
          <div className="lg:col-span-2 space-y-6 text-slate-300 leading-relaxed">
            <div className="p-6 sm:p-8 rounded-2xl glass-card-elevated border border-white/10 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
                <h2 className="text-xl font-bold text-white">
                  Developer Profile
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-red-500" aria-hidden="true" />
                  <span>{about.location || personalData.identity.location}</span>
                </div>
              </div>

              {about.biography ? (
                <div className="space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {about.biography}
                </div>
              ) : (
                <>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    I am a Computer Science undergraduate student pursuing my Bachelor of Technology (B.Tech) at{" "}
                    <strong className="text-white">The ICFAI University, Jaipur</strong> (2024–2028).
                    I have a strong foundation in core computer science subjects, algorithmic problem solving, and modern web architectures.
                  </p>

                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    With over <strong className="text-red-400 font-semibold">350+ problems solved on LeetCode</strong>,
                    I focus heavily on data structures and algorithmic efficiency. On the engineering side, I design and build production-ready applications such as{" "}
                    <strong className="text-white">GPAHub</strong> (an Indian university grade conversion platform) and{" "}
                    <strong className="text-white">PixOptimize</strong> (a zero-server client-side image compression tool).
                  </p>
                </>
              )}



              {/* Quick Profile Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                <div className="p-3.5 rounded-xl bg-[#0a0b0d] border border-white/[0.08]">
                  <span className="text-[11px] font-mono text-slate-500 uppercase">Academics</span>
                  <p className="text-sm font-semibold text-white mt-1">
                    {about.academicsText || "B.Tech CSE (8.0 CGPA)"}
                  </p>
                  <p className="text-xs text-slate-400">ICFAI University</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0a0b0d] border border-white/[0.08]">
                  <span className="text-[11px] font-mono text-slate-500 uppercase">Problem Solving</span>
                  <p className="text-sm font-semibold text-white mt-1">
                    {about.problemSolvingText || "350+ LeetCode Solved"}
                  </p>
                  <p className="text-xs text-slate-400">Algorithms & DS</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0a0b0d] border border-white/[0.08]">
                  <span className="text-[11px] font-mono text-slate-500 uppercase">Languages</span>
                  <p className="text-sm font-semibold text-white mt-1">English, Hindi</p>
                  <p className="text-xs text-slate-400">Fluent Communication</p>
                </div>
              </div>
            </div>

            {/* Curriculum Vitae / Resume Integration Card */}
            <div className="p-5 sm:p-7 rounded-2xl glass-card-elevated border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-red-950/40 border border-red-600/30 flex items-center justify-center text-red-500 shrink-0">
                  <FileText className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm sm:text-base font-bold text-white">
                      Curriculum Vitae / Resume
                    </h2>
                    {resume ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Verified PDF
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 border border-white/10 text-slate-400">
                        Unavailable
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {resume
                      ? `${resume.filename} (${resume.fileSizeFormatted}) • Updated ${resume.updatedAt}`
                      : "Official resume document is being updated. Available upon direct request."}
                  </p>
                </div>
              </div>

              {resume ? (
                <div className="flex items-center gap-2.5 w-full sm:w-auto pt-2 sm:pt-0">
                  <a
                    href="/api/resume/preview"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold min-h-[44px] transition-colors border border-white/10"
                    aria-label="Preview resume in new tab"
                  >
                    <Eye className="w-3.5 h-3.5 text-red-400" />
                    <span>Preview</span>
                  </a>
                  <a
                    href="/api/resume/download"
                    download
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold min-h-[44px] shadow-[0_0_15px_rgba(229,9,20,0.4)] transition-all"
                    aria-label="Download verified resume PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </a>
                </div>
              ) : (
                <span className="text-xs text-slate-500 italic">Direct contact: manish2750797@gmail.com</span>
              )}
            </div>

            {/* Engineering Principles */}
            <div className="p-6 sm:p-8 rounded-2xl glass-card-elevated border border-white/10 space-y-4">
              <h2 className="text-xl font-bold text-white">
                Engineering Approach
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#0a0b0d] border border-white/[0.06]">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-red-500" aria-hidden="true" />
                    <span>Client-Side Privacy & Speed</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Prioritizing client-side processing where possible (e.g. GPAHub and PixOptimize) so user data never leaves their local device unnecessarily.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0a0b0d] border border-white/[0.06]">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-red-500" aria-hidden="true" />
                    <span>Algorithmic Rigor</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Applying proven data structures, clean modular boundaries, and strict type safety across all React, TypeScript, and Node.js solutions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar: Skills & Profile Links */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl glass-card-elevated border border-white/10">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-red-500" aria-hidden="true" />
                <span>Technical Toolkit</span>
              </h2>
              <div className="space-y-5">
                {displayCategories.map((cat, idx) => (
                  <div key={idx}>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      {cat.title}
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.skills.map((skill, sIdx) => (
                        <Badge key={sIdx} variant="charcoal">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Profiles Box */}
            <div className="p-6 rounded-2xl glass-card-elevated border border-white/10 space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                Verified Profiles
              </h2>
              <div className="space-y-2 text-xs">
                <a
                  href={siteConfig.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#0a0b0d] border border-white/[0.06] hover:border-red-600/40 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <GithubIcon className="w-4 h-4" aria-hidden="true" />
                    <span>GitHub: Manishkumar4652</span>
                  </span>
                  <Globe className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                </a>

                <a
                  href={siteConfig.links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#0a0b0d] border border-white/[0.06] hover:border-red-600/40 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <LinkedinIcon className="w-4 h-4" aria-hidden="true" />
                    <span>LinkedIn Profile</span>
                  </span>
                  <Globe className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                </a>

                {siteConfig.links.leetcode && (
                  <a
                    href={siteConfig.links.leetcode}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#0a0b0d] border border-white/[0.06] hover:border-red-600/40 hover:text-white transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" aria-hidden="true" />
                      <span>LeetCode: Manish_kumar4774</span>
                    </span>
                    <Globe className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
