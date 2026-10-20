import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { siteConfig } from "@/config/site";
import { ArrowLeft, Briefcase, Calendar, CheckCircle2, MapPin } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { getPortfolioContent } from "@/lib/mongodb/content";

export const metadata: Metadata = {
  title: "Experience",
  description: "Practical development experience, software engineering projects, and milestones of Manish Kumar.",
  alternates: {
    canonical: "/experience",
  },
  openGraph: {
    title: `Experience | ${siteConfig.author}`,
    description: "Practical development experience, software engineering projects, and milestones of Manish Kumar.",
    url: `${siteConfig.url}/experience`,
    type: "website",
  },
};

export const instant = false;

export default async function ExperiencePage() {
  await connection();
  const content = await getPortfolioContent();
  const experiences = content.experiences || [];
  const hasExperience = experiences.length > 0;

  return (
    <div className="pb-8 sm:pb-12">
      <Section
        id="experience-timeline"
        titleAs="h1"
        containerSize="lg"
        title="Development Experience & Projects"
        description="Hands-on software development, open-source architectures, and independent product engineering."
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

        {hasExperience ? (
          <div className="space-y-6 max-w-4xl">
            {experiences.map((exp) => (
              <div
                key={exp.id}
                className="p-6 sm:p-8 rounded-2xl glass-card-elevated border border-white/10 hover:border-red-600/30 transition-all duration-300"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="crimson">
                      {exp.startDate} – {exp.endDate}
                    </Badge>
                    <span className="px-2 py-0.5 rounded-full bg-red-950/40 border border-red-800/40 text-[10px] text-red-400 font-semibold">
                      {exp.employmentType}
                    </span>
                    {exp.currentRole && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-[10px] text-emerald-400 font-semibold">
                        Current Position
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-red-500" aria-hidden="true" />
                    <span>Project & Engineering Milestone</span>
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                  {exp.role}
                </h2>

                <div className="text-sm text-red-400 font-medium mb-4 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                    <span>{exp.organization}</span>
                  </div>
                  {exp.location && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" aria-hidden="true" />
                      <span>{exp.location}</span>
                    </div>
                  )}
                </div>

                {exp.description && exp.description.length > 0 && (
                  <div className="pt-4 border-t border-white/[0.08] space-y-2.5">
                    {exp.description.map((item, dIdx) => (
                      <div key={dIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                        <CheckCircle2 className="w-3.5 h-3.5 text-red-500 mt-1 shrink-0" aria-hidden="true" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}

                {exp.skills && exp.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-3 mt-4 border-t border-white/[0.06]">
                    {exp.skills.map((s, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded bg-[#0a0b0d] border border-white/[0.08] text-[11px] font-mono text-slate-400"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 sm:p-12 rounded-2xl glass-card-elevated text-center max-w-2xl mx-auto border border-white/10">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-950/40 border border-red-600/30 flex items-center justify-center text-red-500 mb-4 shadow-[0_0_20px_rgba(229,9,20,0.2)]">
              <Briefcase className="w-7 h-7" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Experience Timeline</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Experience entries populated from verified record.
            </p>
          </div>
        )}
      </Section>
    </div>
  );
}
