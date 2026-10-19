import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { personalData } from "@/data/personal";
import { siteConfig } from "@/config/site";
import { ArrowLeft, GraduationCap, Calendar, MapPin, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Education",
  description: "Academic education, degrees, and coursework of Manish Kumar.",
  alternates: {
    canonical: "/education",
  },
  openGraph: {
    title: `Education | ${siteConfig.author}`,
    description: "Academic education, degrees, and coursework of Manish Kumar.",
    url: `${siteConfig.url}/education`,
    type: "website",
  },
};

export default function EducationPage() {
  const hasEducation = personalData.education.length > 0;

  return (
    <div className="pb-8 sm:pb-12">
      <Section
        id="education-timeline"
        titleAs="h1"
        containerSize="lg"
        title="Education & Formal Coursework"
        description="Formal computer science education, software engineering principles, and secondary academics."
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

        {hasEducation ? (
          <div className="space-y-6 max-w-4xl">
            {personalData.education.map((edu, idx) => (
              <div
                key={idx}
                className="p-6 sm:p-8 rounded-2xl glass-card-elevated border border-white/10 hover:border-red-600/30 transition-all duration-300"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <Badge variant="crimson">{edu.period}</Badge>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-red-500" aria-hidden="true" />
                    <span>Academic Timeline</span>
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5">
                  {edu.degreeOrCourse}
                </h2>

                <div className="flex items-center gap-2 text-sm text-slate-300 font-medium mb-4">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0" aria-hidden="true" />
                  <span>{edu.institution}</span>
                </div>

                {edu.details && edu.details.length > 0 && (
                  <div className="pt-4 border-t border-white/[0.08] space-y-2">
                    {edu.details.map((detail, dIdx) => (
                      <div key={dIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-red-500 mt-1 shrink-0" aria-hidden="true" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 sm:p-12 rounded-2xl glass-card-elevated text-center max-w-2xl mx-auto border border-white/10">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-950/40 border border-red-600/30 flex items-center justify-center text-red-500 mb-4 shadow-[0_0_20px_rgba(229,9,20,0.2)]">
              <GraduationCap className="w-7 h-7" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Academic Profile Ready
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Academic milestones configured in personal data schema.
            </p>
          </div>
        )}
      </Section>
    </div>
  );
}
