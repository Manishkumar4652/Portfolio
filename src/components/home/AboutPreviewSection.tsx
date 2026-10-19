import React from "react";
import Link from "next/link";
import { personalData } from "@/data/personal";
import { Section } from "@/components/ui/Section";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ArrowRight, CheckCircle2, User, Sparkles, Terminal } from "lucide-react";
import type { AboutContent } from "@/lib/mongodb/types";

interface AboutPreviewSectionProps {
  initialAbout?: AboutContent;
}

export function AboutPreviewSection({ initialAbout }: AboutPreviewSectionProps) {
  const principles = [
    {
      title: "User-Centric Performance",
      description:
        "Fast load times, minimal JavaScript footprint, and fluid interactions across all viewports.",
    },
    {
      title: "Accessible Architecture",
      description:
        "Semantic HTML, full keyboard navigation, high contrast ratios, and screen-reader readiness.",
    },
    {
      title: "Continuous AI Exploration",
      description:
        "Active experiments with machine learning models, prompt engineering, and intelligent web interfaces.",
    },
  ];

  return (
    <Section
      id="about"
      containerSize="lg"
      title="Merging Frontend Craft with Modern Architectures"
      description="Driven by clean code, accessible design, and continuous exploration of artificial intelligence and machine learning."
      className="border-t border-white/[0.08]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Narrative & Principles */}
        <div className="lg:col-span-7 space-y-6">
          <ScrollReveal>
            <div className="p-6 sm:p-8 rounded-2xl glass-card-elevated border border-white/10 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-red-400">
                <User className="w-4 h-4" aria-hidden="true" />
                <span>Developer Background</span>
              </div>

              {initialAbout?.introduction ? (
                <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                  {initialAbout.introduction}
                </p>
              ) : (
                <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                  I am a Computer Science undergraduate student at <strong className="text-white">The ICFAI University, Jaipur</strong>, combining rigorous algorithmic problem solving (350+ LeetCode problems solved) with modern full-stack web development.
                </p>
              )}

              {initialAbout?.biography ? (
                <p className="text-slate-400 text-sm sm:text-base leading-relaxed line-clamp-3">
                  {initialAbout.biography.split("\n")[0]}
                </p>
              ) : (
                <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                  I have hands-on experience designing and shipping real web platforms like <strong className="text-white">GPAHub</strong> and <strong className="text-white">PixOptimize</strong>, prioritizing zero-overhead performance, accessibility, and client-side privacy.
                </p>
              )}

              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-red-400 hover:text-red-300 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded-lg p-1"
                >
                  <span>Read full developer story & philosophy</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </ScrollReveal>

          {/* Principles Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {principles.map((p, idx) => (
              <ScrollReveal key={idx} delay={idx * 100}>
                <div className="p-5 rounded-xl bg-[#0a0b0d] border border-white/[0.08] hover:border-red-600/30 transition-colors h-full flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-red-950/40 border border-red-600/30 flex items-center justify-center text-red-500 mb-3">
                      <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1.5">
                      {p.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {p.description}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Right Column: Focus Areas Panel */}
        <div className="lg:col-span-5">
          <ScrollReveal delay={150}>
            <div className="p-6 sm:p-8 rounded-2xl glass-card-elevated border border-white/10 space-y-5">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <Terminal className="w-4 h-4 text-red-500" aria-hidden="true" />
                  <span>Active Focus Areas</span>
                </div>
                <span className="text-xs font-mono text-red-400 bg-red-950/30 px-2.5 py-0.5 rounded-lg border border-red-800/30">
                  {personalData.identity.focusAreas.length} Domains
                </span>
              </div>

              <div className="space-y-3">
                {personalData.identity.focusAreas.map((area, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#0a0b0d] border border-white/[0.06] hover:border-red-600/30 transition-all flex items-start gap-3 group"
                  >
                    <div className="w-6 h-6 rounded-lg bg-red-950/50 border border-red-600/30 flex items-center justify-center text-red-400 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                        {area}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-xs text-slate-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Actively developing and iterating coursework projects</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </Section>
  );
}
