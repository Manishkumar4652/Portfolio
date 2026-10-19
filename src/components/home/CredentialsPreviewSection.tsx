import React from "react";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Badge } from "@/components/ui/Badge";
import {
  GraduationCap,
  Award,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  GitBranch,
} from "lucide-react";

export function CredentialsPreviewSection() {
  const sections = [
    {
      title: "Education & Coursework",
      description:
        "Pursuing B.Tech in Computer Science and Engineering at The ICFAI University, Jaipur (CGPA 8.0) with core focus on software development and practical skills.",
      href: "/education",
      icon: GraduationCap,
      badge: "ICFAI Jaipur (8.0 CGPA)",
      statusIcon: BookOpen,
      statusText: "B.Tech CSE • 2024–2028",
    },
    {
      title: "Certificates & Accreditations",
      description:
        "Verified credentials including NPTEL Python (Elite Silver Medal), 1M1B × AICTE Internship, CodeHelp DSA (Supreme 4.0), and Apna College Delta Full Stack.",
      href: "/certificates",
      icon: Award,
      badge: "4 Verified Accreditations",
      statusIcon: ShieldCheck,
      statusText: "NPTEL, 1M1B, CodeHelp & Apna College",
    },
    {
      title: "Experience & Contributions",
      description:
        "AI & Emerging Technologies Intern at 1M1B × AICTE (AquaAlert AI), shipping web apps (GPAHub, PixOptimize, Weather Forecast), and 350+ LeetCode solved.",
      href: "/experience",
      icon: Briefcase,
      badge: "AICTE Intern & Builder",
      statusIcon: GitBranch,
      statusText: "Active Full Stack Builder",
    },
  ];

  return (
    <Section
      id="credentials"
      containerSize="lg"
      title="Foundations, Credentials & Journey"
      description="Explore Manish Kumar's formal university education, verified technical accreditations, and engineering milestones."
      className="border-t border-white/[0.08]"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sections.map((item, idx) => {
          const Icon = item.icon;
          const StatusIcon = item.statusIcon;

          return (
            <ScrollReveal key={item.href} delay={idx * 120}>
              <Link
                href={item.href}
                className="p-6 sm:p-7 rounded-2xl glass-card-elevated border border-white/10 hover:border-red-600/35 transition-all duration-300 flex flex-col justify-between h-full group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-red-950/40 border border-red-600/30 flex items-center justify-center text-red-500 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300 shadow-[0_0_15px_rgba(229,9,20,0.2)]">
                      <Icon className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <Badge variant="charcoal">{item.badge}</Badge>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors mb-2">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/[0.06]">
                  {/* Status Indicator */}
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <StatusIcon className="w-3.5 h-3.5 text-red-400" aria-hidden="true" />
                    <span>{item.statusText}</span>
                  </div>

                  {/* Navigation CTA */}
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-red-400 transition-colors">
                    <span>Explore details</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          );
        })}
      </div>
    </Section>
  );
}
