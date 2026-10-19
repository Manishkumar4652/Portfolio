import type { Metadata } from "next";
import React from "react";
import { siteConfig } from "@/config/site";
import { HeroSection } from "@/components/home/HeroSection";
import { AboutPreviewSection } from "@/components/home/AboutPreviewSection";
import { SkillsSection } from "@/components/home/SkillsSection";
import { FeaturedProjectsSection } from "@/components/home/FeaturedProjectsSection";
import { CredentialsPreviewSection } from "@/components/home/CredentialsPreviewSection";
import { ContactCtaSection } from "@/components/home/ContactCtaSection";
import { IntroSplash } from "@/components/common/IntroSplash";
import { getProjects } from "@/lib/mongodb/projects";
import { getPortfolioContent } from "@/lib/mongodb/content";
import { getActiveResume } from "@/lib/mongodb/resume";

export const metadata: Metadata = {
  title: `${siteConfig.author} | Aspiring Full Stack Web Developer`,
  description:
    "Personal developer portfolio of Manish Kumar. Aspiring Full Stack Web Developer crafting responsive, user-friendly, and scalable web solutions.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${siteConfig.author} | Aspiring Full Stack Web Developer`,
    description:
      "Personal developer portfolio of Manish Kumar. Aspiring Full Stack Web Developer crafting responsive, user-friendly, and scalable web solutions.",
    url: siteConfig.url,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.author} | Aspiring Full Stack Web Developer`,
    description:
      "Personal developer portfolio of Manish Kumar. Aspiring Full Stack Web Developer crafting responsive, user-friendly, and scalable web solutions.",
  },
};

import { connection } from "next/server";

export const instant = false;

export default async function HomePage() {
  await connection();
  const [featuredProjects, content, resume] = await Promise.all([
    getProjects({ featuredOnly: true }),
    getPortfolioContent(),
    getActiveResume(),
  ]);

  return (
    <div className="relative w-full overflow-hidden">
      <IntroSplash />
      {/* 1. Hero and Introductory Experience */}
      <HeroSection initialHero={content.hero} hasResume={!!resume} />

      {/* 2. Introduction & About Preview */}
      <AboutPreviewSection initialAbout={content.about} />

      {/* 3. Technical Capabilities & Skills */}
      <SkillsSection initialSkills={content.skills} />

      {/* 4. Featured Projects Showcase */}
      <FeaturedProjectsSection initialProjects={featuredProjects} />

      {/* 5. Education, Credentials & Milestones Preview */}
      <CredentialsPreviewSection />

      {/* 6. Contact CTA */}
      <ContactCtaSection />
    </div>
  );
}
