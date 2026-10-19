import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url || "https://manishkumar.dev";
  const now = new Date();

  const publicRoutes: {
    path: string;
    changeFrequency: "weekly" | "monthly";
    priority: number;
  }[] = [
    { path: "", changeFrequency: "weekly", priority: 1.0 },
    { path: "/about", changeFrequency: "monthly", priority: 0.9 },
    { path: "/skills", changeFrequency: "weekly", priority: 0.9 },
    { path: "/projects", changeFrequency: "weekly", priority: 0.95 },
    { path: "/certificates", changeFrequency: "monthly", priority: 0.85 },
    { path: "/education", changeFrequency: "monthly", priority: 0.8 },
    { path: "/experience", changeFrequency: "monthly", priority: 0.85 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.75 },
  ];

  return publicRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
