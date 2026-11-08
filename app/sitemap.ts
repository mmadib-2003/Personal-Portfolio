import type { MetadataRoute } from "next";

import { getProjects, getWriteupSummaries } from "@/lib/queries";

const BASE = "https://personalportfolio-rust-nu.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ data: projects }, { data: writeups }] = await Promise.all([
    getProjects(),
    getWriteupSummaries(),
  ]);

  const now = new Date();

  return [
    { url: BASE, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE}/projects`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/writeups`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...projects.map((project) => ({
      url: `${BASE}/projects/${project.slug}`,
      lastModified: new Date(project.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...writeups.map((writeup) => ({
      url: `${BASE}/writeups/${writeup.slug}`,
      lastModified: new Date(writeup.published_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
