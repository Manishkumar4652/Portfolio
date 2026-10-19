import type { Metadata } from "next";
import { ProjectsView } from "./ProjectsView";
import { siteConfig } from "@/config/site";
import { getProjects } from "@/lib/mongodb/projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Curated web applications, tools, and AI systems built by Manish Kumar, including GPAHub, PixOptimize, and PitStop.",
  alternates: {
    canonical: "/projects",
  },
  openGraph: {
    title: `Projects | ${siteConfig.author}`,
    description:
      "Curated web applications, tools, and AI systems built by Manish Kumar, including GPAHub, PixOptimize, and PitStop.",
    url: `${siteConfig.url}/projects`,
    type: "website",
  },
};

import { connection } from "next/server";

export const instant = false;

export default async function ProjectsPage() {
  await connection();
  const projects = await getProjects();

  return (
    <div className="pb-8 sm:pb-12">
      <ProjectsView initialProjects={projects} />
    </div>
  );
}
