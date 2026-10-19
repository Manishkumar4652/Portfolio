import type { Metadata } from "next";
import { SkillsView } from "./SkillsView";
import { getPortfolioContent } from "@/lib/mongodb/content";
import { siteConfig } from "@/config/site";
import { connection } from "next/server";

export const metadata: Metadata = {
  title: "Skills & Technical Capabilities",
  description:
    "Engineering capabilities, programming languages, modern frameworks, databases, and AI tooling of Manish Kumar.",
  alternates: {
    canonical: "/skills",
  },
  openGraph: {
    title: `Skills | ${siteConfig.author}`,
    description:
      "Engineering capabilities, programming languages, modern frameworks, databases, and AI tooling of Manish Kumar.",
    url: `${siteConfig.url}/skills`,
    type: "website",
  },
};

export const instant = false;

export default async function SkillsPage() {
  await connection();
  const content = await getPortfolioContent();

  return (
    <div className="pb-8 sm:pb-12">
      <SkillsView initialSkills={content.skills} />
    </div>
  );
}
