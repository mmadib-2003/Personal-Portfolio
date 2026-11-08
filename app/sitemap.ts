import type { MetadataRoute } from "next";

import { getProjects, getWriteupSummaries } from "@/lib/queries";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ data: projects }, { data: writeups }] = await Promise.all([
    getProjects(),
    getWriteupSummaries(),
  ]);

  const now = new Date();

  return [
    { url: SITE_URL, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/projects`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/writeups`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/cv`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    ...projects.map((project) => ({
      url: `${SITE_URL}/projects/${project.slug}`,
      lastModified: new Date(project.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...writeups.map((writeup) => ({
      url: `${SITE_URL}/writeups/${writeup.slug}`,
      lastModified: new Date(writeup.published_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
