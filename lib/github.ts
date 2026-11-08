import "server-only";

import { GITHUB_OWNER, serverEnv } from "@/lib/env";

export interface GithubRepo {
  name: string;
  description: string | null;
  language: string | null;
  url: string;
  topics: string[];
  stars: number;
  forks: number;
  updatedAt: string;
  isFork: boolean;
  archived: boolean;
}

export interface GithubRepoSummary {
  owner: string;
  count: number;
  languages: { language: string; repos: number }[];
  repos: GithubRepo[];
  source: "github-api" | "unavailable";
  note?: string;
}

interface RawRepo {
  name?: unknown;
  description?: unknown;
  language?: unknown;
  html_url?: unknown;
  topics?: unknown;
  stargazers_count?: unknown;
  forks_count?: unknown;
  pushed_at?: unknown;
  updated_at?: unknown;
  fork?: unknown;
  archived?: unknown;
}

const CACHE_TTL_MS = 10 * 60 * 1000;

let cache: { value: GithubRepoSummary; expires: number } | null = null;

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function normalizeRepo(raw: RawRepo): GithubRepo | null {
  const name = asString(raw.name);
  const url = asString(raw.html_url);
  if (!name || !url) return null;

  return {
    name,
    description: asString(raw.description),
    language: asString(raw.language),
    url,
    topics: Array.isArray(raw.topics)
      ? raw.topics.filter((t): t is string => typeof t === "string").slice(0, 12)
      : [],
    stars: asNumber(raw.stargazers_count),
    forks: asNumber(raw.forks_count),
    updatedAt: asString(raw.pushed_at) ?? asString(raw.updated_at) ?? "",
    isFork: raw.fork === true,
    archived: raw.archived === true,
  };
}

/**
 * Fetches the owner's public repositories.
 *
 * The GitHub token is optional: unauthenticated calls still work against the
 * public API, they just share a much smaller rate-limit budget. Results are
 * memoised in-process for 10 minutes to stay well inside that budget.
 */
export async function fetchGithubRepos(
  owner: string = GITHUB_OWNER,
): Promise<GithubRepoSummary> {
  if (cache && cache.expires > Date.now()) return cache.value;

  const token = serverEnv.githubToken;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "muntasir-adib-portfolio",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const url = `https://api.github.com/users/${encodeURIComponent(
    owner,
  )}/repos?per_page=30&sort=pushed`;

  try {
    const response = await fetch(url, {
      headers,
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return {
        owner,
        count: 0,
        languages: [],
        repos: [],
        source: "unavailable",
        note: `GitHub API responded with ${response.status}.`,
      };
    }

    const json: unknown = await response.json();
    const list = Array.isArray(json) ? json : [];
    const repos = list
      .map((item) => normalizeRepo(item as RawRepo))
      .filter((repo): repo is GithubRepo => repo !== null)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

    const languageCounts = new Map<string, number>();
    for (const repo of repos) {
      if (!repo.language) continue;
      languageCounts.set(repo.language, (languageCounts.get(repo.language) ?? 0) + 1);
    }

    const value: GithubRepoSummary = {
      owner,
      count: repos.length,
      languages: [...languageCounts.entries()]
        .map(([language, count]) => ({ language, repos: count }))
        .sort((a, b) => b.repos - a.repos),
      repos,
      source: "github-api",
    };

    cache = { value, expires: Date.now() + CACHE_TTL_MS };
    return value;
  } catch {
    return {
      owner,
      count: 0,
      languages: [],
      repos: [],
      source: "unavailable",
      note: "GitHub API is unreachable right now.",
    };
  }
}
