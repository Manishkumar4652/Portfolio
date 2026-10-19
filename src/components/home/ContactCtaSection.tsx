import React from "react";
import { siteConfig } from "@/config/site";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { GithubIcon, LinkedinIcon } from "@/components/ui/Icons";
import { Mail, ArrowRight, ArrowUpRight } from "lucide-react";

export function ContactCtaSection() {
  return (
    <Section
      id="contact-cta"
      containerSize="lg"
      className="py-10 sm:py-12 md:py-14 border-t border-white/[0.08] relative overflow-hidden"
    >
      {/* Background Ambient Crimson Glow */}
      <div
        className="pointer-events-none absolute inset-0 ambient-glow-crimson -z-10 opacity-70"
        aria-hidden="true"
      />

      <ScrollReveal>
        <div className="relative rounded-2xl p-6 sm:p-10 md:p-12 glass-card-elevated border border-white/10 overflow-hidden shadow-[0_0_50px_-15px_rgba(229,9,20,0.25)]">
          {/* Subtle Top Red Accent Line */}
          <div
            className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent"
            aria-hidden="true"
          />

          <div className="max-w-3xl mx-auto text-center space-y-6">

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Let&apos;s build something{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600">
                remarkable together
              </span>
            </h2>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              I am actively seeking student developer internships, modern web engineering collaborations, and AI/ML exploratory projects. Have an idea or an open role? Let&apos;s connect.
            </p>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Button href="/contact" variant="primary" size="lg" className="min-w-[180px]">
                <span>Contact Manish</span>
                <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
              </Button>

              <Button
                href={`mailto:${siteConfig.links.email}`}
                variant="secondary"
                size="lg"
                className="min-w-[180px]"
              >
                <Mail className="w-4 h-4 mr-1 text-red-400" aria-hidden="true" />
                <span>Direct Email</span>
              </Button>
            </div>

            {/* Quick Links Row */}
            <div className="pt-8 border-t border-white/[0.08] flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <span className="text-slate-400 font-mono">External Profiles:</span>

              <a
                href={siteConfig.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-white transition-colors p-1"
                aria-label="Manish Kumar's GitHub Profile"
              >
                <GithubIcon className="w-4 h-4" aria-hidden="true" />
                <span>GitHub</span>
                <ArrowUpRight className="w-3 h-3 text-slate-500" aria-hidden="true" />
              </a>

              <a
                href={siteConfig.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-white transition-colors p-1"
                aria-label="Manish Kumar's LinkedIn Profile"
              >
                <LinkedinIcon className="w-4 h-4" aria-hidden="true" />
                <span>LinkedIn</span>
                <ArrowUpRight className="w-3 h-3 text-slate-500" aria-hidden="true" />
              </a>

              {siteConfig.links.leetcode && (
                <a
                  href={siteConfig.links.leetcode}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-white transition-colors p-1"
                  aria-label="Manish Kumar's LeetCode Profile"
                >
                  <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center text-xs font-bold">LC</span>
                  <span>LeetCode (350+)</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-500" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        </div>
      </ScrollReveal>
    </Section>
  );
}
