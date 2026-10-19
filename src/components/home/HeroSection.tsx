import React from "react";
import Image from "next/image";
import { personalData } from "@/data/personal";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ArrowRight, ChevronDown, FileText, Eye, MapPin, Code2 } from "lucide-react";
import type { HeroContent } from "@/lib/mongodb/types";

interface HeroSectionProps {
  initialHero?: HeroContent;
  hasResume?: boolean;
}

export function HeroSection({ initialHero, hasResume }: HeroSectionProps) {
  const heading = initialHero?.heading || "Aspiring";
  const highlightText = initialHero?.highlightText || "Full Stack Web Developer";
  const subtitle =
    initialHero?.subtitle ||
    `Hello, I'm ${personalData.identity.preferredName} (${personalData.identity.fullName}). ${personalData.identity.shortBio}`;

  const primaryCtaLabel = initialHero?.primaryCtaLabel || "Explore Projects";
  const primaryCtaUrl = initialHero?.primaryCtaUrl || "#featured-projects";
  const secondaryCtaLabel = initialHero?.secondaryCtaLabel === "Watch Intro Slot" ? "" : (initialHero?.secondaryCtaLabel || "");
  const secondaryCtaUrl = initialHero?.secondaryCtaUrl === "#intro-video" ? "" : (initialHero?.secondaryCtaUrl || "");
  const tertiaryCtaLabel = initialHero?.tertiaryCtaLabel || "Get in Touch";
  const tertiaryCtaUrl = initialHero?.tertiaryCtaUrl || "/contact";

  return (
    <section
      id="hero"
      aria-label="Introduction and Overview"
      className="relative flex flex-col justify-start pt-4 sm:pt-6 pb-12 sm:pb-16 overflow-hidden"
    >
      {/* Cinematic Ambient Backdrop Layers */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[500px] ambient-glow-top -z-10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 cinematic-grid -z-20 opacity-20"
        aria-hidden="true"
      />

      <Container size="lg" className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Semantic Details, Heading, Bio & Actions */}
          <div className="order-2 lg:order-1 lg:col-span-7 flex flex-col items-start">

            {/* Primary Semantic H1 */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15] break-words w-full">
              <span className="block text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-200 mb-2 sm:mb-3">
                Hi, I&apos;m <span className="text-white">Manish Kumar Prajapat</span>
              </span>
              <span className="block">
                Aspiring{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-rose-400">
                  Full Stack Web Developer
                </span>
              </span>
            </h1>

            {/* Subheading & Bio */}
            <p className="mt-5 text-base sm:text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl font-normal whitespace-pre-line">
              {subtitle.replace(/^Hello,\s*I'm\s+[^.]*\.\s*/i, "")}
            </p>

            {/* Action CTAs - Responsive full-width on mobile */}
            <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto">
              {primaryCtaLabel && (
                <Button
                  href={primaryCtaUrl}
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto shadow-[0_0_25px_-5px_rgba(229,9,20,0.5)]"
                >
                  <span>{primaryCtaLabel}</span>
                  <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
                </Button>
              )}

              {secondaryCtaLabel && secondaryCtaUrl && (
                <Button
                  href={secondaryCtaUrl}
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <span>{secondaryCtaLabel}</span>
                </Button>
              )}

              {tertiaryCtaLabel && (
                <Button
                  href={tertiaryCtaUrl}
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <span>{tertiaryCtaLabel}</span>
                </Button>
              )}

              {hasResume && (
                <>
                  <Button
                    href="/api/resume/preview"
                    external
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto text-slate-300 hover:text-white"
                    aria-label="Preview resume in new tab"
                  >
                    <Eye className="w-4 h-4 text-red-400 mr-1" aria-hidden="true" />
                    <span>View CV</span>
                  </Button>

                  <Button
                    href="/api/resume/download"
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto text-slate-300 hover:text-white"
                    aria-label="Download verified resume PDF"
                  >
                    <FileText className="w-4 h-4 text-red-500 mr-1" aria-hidden="true" />
                    <span>Download CV</span>
                  </Button>
                </>
              )}
            </div>

            {/* Quick Highlights / Stats pills */}
            <div className="mt-8 pt-6 border-t border-white/[0.08] flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-red-500" aria-hidden="true" />
                <span>Jaipur, Rajasthan</span>
              </div>
              <div className="flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-red-400" aria-hidden="true" />
                <span>350+ LeetCode Solved</span>
              </div>
            </div>
          </div>

          {/* Right Column: Full Transparent Portrait (No Frame, No Crop) */}
          <div className="order-1 lg:order-2 lg:col-span-5 flex justify-center lg:justify-end items-center mt-2 lg:mt-0">
            <div className="relative flex justify-center items-center">
              {/* Soft ambient crimson glow behind the figure */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-red-600/15 via-rose-500/10 to-transparent blur-3xl pointer-events-none -z-10"
                aria-hidden="true"
              />

              <Image
                src="/nobg.png"
                alt={`${personalData.identity.preferredName} (${personalData.identity.fullName}) - ${personalData.identity.headline}`}
                width={1536}
                height={2752}
                priority
                className="w-auto h-auto max-h-[360px] sm:max-h-[480px] lg:max-h-[620px] xl:max-h-[660px] max-w-full object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.8)]"
              />
            </div>
          </div>
        </div>
      </Container>

      {/* Down indicator */}
      <div className="hidden sm:flex justify-center mt-10">
        <a
          href="#about"
          className="text-slate-400 hover:text-white transition-colors p-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
          aria-label="Scroll down to About section"
        >
          <ChevronDown className="w-5 h-5 animate-bounce" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
