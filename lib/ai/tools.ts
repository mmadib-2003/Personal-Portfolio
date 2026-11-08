import "server-only";

import { tool } from "ai";
import { z } from "zod";

import { createPublicServerClient } from "@/lib/supabase/server";
import { fetchGithubRepos } from "@/lib/github";
import { GITHUB_OWNER } from "@/lib/env";
import {
  FALLBACK_PROJECTS,
  FALLBACK_SKILLS,
  FALLBACK_WRITEUP_SUMMARIES,
} from "@/lib/fallback-data";
import { PROJECT_CATEGORIES, SKILL_CATEGORIES } from "@/lib/types";

/**
 * Read-only tools for the SOC Assistant.
 *
 * Every tool is strictly read-only and bounded: no table writes, no arbitrary
 * SQL, no access to the service-role key. Queries run through the anon client
 * so RLS applies even to the agent.
 */

const MAX_RESULTS = 8;

function sanitizeLikeTerm(term: string): string {
  // PostgREST treats , and ) as filter syntax — strip anything structural.
  return term.replace(/[%_,()*\\"']/g, " ").replace(/\s{2,}/g, " ").trim();
}

export const queryProjects = tool({
  description:
    "Search Muntasir's portfolio projects. Use for questions about what he has built, which projects use a given technology, or work in a specific category.",
  inputSchema: z.object({
    query: z
      .string()
      .max(80)
      .optional()
      .describe("Free-text keyword, e.g. 'python', 'packet', 'siem'. Omit to list everything."),
    category: z
      .enum(PROJECT_CATEGORIES)
      .optional()
      .describe("Optional category filter."),
  }),
  execute: async ({ query, category }) => {
    const term = query ? sanitizeLikeTerm(query) : "";
    const supabase = createPublicServerClient();

    const shape = (rows: typeof FALLBACK_PROJECTS) =>
      rows.slice(0, MAX_RESULTS).map((p) => ({
        slug: p.slug,
        title: p.title,
        category: p.category,
        status: p.status,
        summary: p.description,
        tech: p.tech_stack,
        url: p.github_url,
      }));

    if (supabase) {
      let builder = supabase
        .from("projects")
        .select("slug, title, description, tech_stack, category, status, github_url, sort_order")
        .order("sort_order", { ascending: false })
        .limit(MAX_RESULTS);

      if (category) builder = builder.eq("category", category);
      if (term) {
        builder = builder.or(
          [
            `title.ilike.%${term}%`,
            `description.ilike.%${term}%`,
            `tech_stack.cs.{${term}}`,
          ].join(","),
        );
      }

      const { data, error } = await builder;

      if (!error && data && data.length > 0) {
        return {
          source: "supabase" as const,
          count: data.length,
          projects: data.map((row) => ({
            slug: row.slug as string,
            title: row.title as string,
            category: row.category as string,
            status: row.status as string,
            summary: row.description as string,
            tech: (row.tech_stack as string[]) ?? [],
            url: row.github_url as string | null,
          })),
        };
      }
    }

    const filtered = FALLBACK_PROJECTS.filter((p) => {
      const matchesCategory = category ? p.category === category : true;
      if (!term) return matchesCategory;
      const haystack = `${p.title} ${p.description} ${p.tech_stack.join(" ")}`.toLowerCase();
      return matchesCategory && haystack.includes(term.toLowerCase());
    });

    return {
      source: "seed" as const,
      count: filtered.length,
      projects: shape(filtered),
    };
  },
});

export const querySkills = tool({
  description:
    "Look up Muntasir's skills with proficiency scores (1-5) by category. Use for questions about what he knows, how strong he is in an area, or his toolkit.",
  inputSchema: z.object({
    category: z.enum(SKILL_CATEGORIES).optional(),
    query: z.string().max(80).optional().describe("Optional skill keyword."),
  }),
  execute: async ({ category, query }) => {
    const term = query ? sanitizeLikeTerm(query) : "";
    const supabase = createPublicServerClient();

    if (supabase) {
      let builder = supabase
        .from("skills")
        .select("name, category, proficiency, notes")
        .order("proficiency", { ascending: false })
        .limit(24);

      if (category) builder = builder.eq("category", category);
      if (term) builder = builder.ilike("name", `%${term}%`);

      const { data, error } = await builder;

      if (!error && data && data.length > 0) {
        return { source: "supabase" as const, count: data.length, skills: data };
      }
    }

    const filtered = FALLBACK_SKILLS.filter((s) => {
      const matchesCategory = category ? s.category === category : true;
      const matchesTerm = term
        ? s.name.toLowerCase().includes(term.toLowerCase())
        : true;
      return matchesCategory && matchesTerm;
    })
      .slice(0, 24)
      .map(({ name, category: cat, proficiency, notes }) => ({
        name,
        category: cat,
        proficiency,
        notes,
      }));

    return { source: "seed" as const, count: filtered.length, skills: filtered };
  },
});

export const listGithubRepos = tool({
  description:
    "Fetch Muntasir's live public GitHub repositories with descriptions, primary languages and last-push dates. Use for questions about his real code, open-source activity or GitHub portfolio.",
  inputSchema: z.object({
    language: z
      .string()
      .max(30)
      .optional()
      .describe("Optional language filter, e.g. 'TypeScript' or 'Python'."),
  }),
  execute: async ({ language }) => {
    const summary = await fetchGithubRepos(GITHUB_OWNER);

    const repos = language
      ? summary.repos.filter(
          (repo) => repo.language?.toLowerCase() === language.toLowerCase(),
        )
      : summary.repos;

    return {
      source: summary.source,
      owner: summary.owner,
      count: repos.length,
      languages: summary.languages,
      note: summary.note,
      repos: repos.slice(0, 12).map((repo) => ({
        name: repo.name,
        description: repo.description,
        language: repo.language,
        url: repo.url,
        topics: repo.topics,
        updatedAt: repo.updatedAt,
      })),
    };
  },
});

export const searchWriteups = tool({
  description:
    "Search Muntasir's SOC triage write-ups and lab notes. Use for questions about his incident response thinking, playbooks or documented labs.",
  inputSchema: z.object({
    query: z.string().max(80).optional().describe("Keyword, e.g. 'ransomware', 'dns', 'phishing'."),
    category: z
      .enum(["Triage", "Detection", "Networking", "Web Security", "Lab Notes"])
      .optional(),
  }),
  execute: async ({ query, category }) => {
    const term = query ? sanitizeLikeTerm(query) : "";
    const supabase = createPublicServerClient();

    if (supabase) {
      let builder = supabase
        .from("writeups")
        .select("slug, title, summary, category, read_minutes, tags, published_at")
        .order("published_at", { ascending: false })
        .limit(MAX_RESULTS);

      if (category) builder = builder.eq("category", category);
      if (term) {
        builder = builder.or(
          `title.ilike.%${term}%,summary.ilike.%${term}%,body_md.ilike.%${term}%`,
        );
      }

      const { data, error } = await builder;

      if (!error && data && data.length > 0) {
        return { source: "supabase" as const, count: data.length, writeups: data };
      }
    }

    const filtered = FALLBACK_WRITEUP_SUMMARIES.filter((w) => {
      const matchesCategory = category ? w.category === category : true;
      if (!term) return matchesCategory;
      const haystack = `${w.title} ${w.summary} ${w.tags.join(" ")}`.toLowerCase();
      return matchesCategory && haystack.includes(term.toLowerCase());
    });

    return { source: "seed" as const, count: filtered.length, writeups: filtered };
  },
});

export const portfolioTools = {
  query_projects: queryProjects,
  query_skills: querySkills,
  list_github_repos: listGithubRepos,
  search_writeups: searchWriteups,
};
