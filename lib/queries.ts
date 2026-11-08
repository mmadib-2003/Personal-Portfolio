import "server-only";

import { createPublicServerClient } from "@/lib/supabase/server";
import {
  FALLBACK_PROFILE,
  FALLBACK_PROFILE_FACTS,
  FALLBACK_PROJECTS,
  FALLBACK_SKILLS,
  FALLBACK_WRITEUP_SUMMARIES,
  FALLBACK_WRITEUPS,
  buildRadarAxes,
} from "@/lib/fallback-data";
import { CV_PATH } from "@/lib/site";
import type {
  PortfolioProfile,
  ProfileFact,
  Project,
  RadarAxis,
  Skill,
  Writeup,
  WriteupSummary,
} from "@/lib/types";

/**
 * Data-access layer.
 *
 * Every reader is a server-side function that talks to Supabase through the
 * anon key (RLS enforced) and transparently degrades to the curated fallback
 * snapshot when the database is not configured or a query fails.
 */

type DataSource = "supabase" | "fallback";

export interface QueryResult<T> {
  data: T;
  source: DataSource;
}

const PROJECT_COLUMNS =
  "id, slug, title, description, long_description, tech_stack, github_url, write_up_url, category, status, featured, sort_order, created_at";

const WRITEUP_SUMMARY_COLUMNS =
  "slug, title, summary, category, read_minutes, tags, published_at";

function factsToProfile(facts: ProfileFact[]): PortfolioProfile {
  const get = (key: string, fallback: string) =>
    facts.find((f) => f.key === key)?.value ?? fallback;

  const focusRaw = get(
    "focus_areas",
    FALLBACK_PROFILE.focusAreas.join(", "),
  );

  return {
    name: get("name", FALLBACK_PROFILE.name),
    role: get("role", FALLBACK_PROFILE.role),
    bioShort: get("bio_short", FALLBACK_PROFILE.bioShort),
    bioLong: get("bio_long", FALLBACK_PROFILE.bioLong),
    focusAreas: focusRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    location: get("location", FALLBACK_PROFILE.location),
    email: get("email", FALLBACK_PROFILE.email),
    phone: get("phone", FALLBACK_PROFILE.phone),
    whatsapp: get("whatsapp", FALLBACK_PROFILE.whatsapp),
    githubUrl: get("github_url", FALLBACK_PROFILE.githubUrl),
    linkedinUrl: get("linkedin_url", FALLBACK_PROFILE.linkedinUrl),
    resumeUrl: get("resume_url", CV_PATH),
    university: get("university", FALLBACK_PROFILE.university),
    degree: get("degree", FALLBACK_PROFILE.degree),
    availability: get("availability", FALLBACK_PROFILE.availability),
    githubUsername: FALLBACK_PROFILE.githubUsername,
  };
}

export async function getProfile(): Promise<QueryResult<PortfolioProfile>> {
  const supabase = createPublicServerClient();
  if (!supabase) {
    return { data: factsToProfile(FALLBACK_PROFILE_FACTS), source: "fallback" };
  }

  const { data, error } = await supabase
    .from("profile")
    .select("key, value, label")
    .order("key", { ascending: true });

  if (error || !data || data.length === 0) {
    return { data: factsToProfile(FALLBACK_PROFILE_FACTS), source: "fallback" };
  }

  return { data: factsToProfile(data as ProfileFact[]), source: "supabase" };
}

export async function getProjects(): Promise<QueryResult<Project[]>> {
  const supabase = createPublicServerClient();
  const ordered = (rows: Project[]) =>
    [...rows].sort((a, b) => {
      if (a.sort_order !== b.sort_order) return b.sort_order - a.sort_order;
      return b.created_at.localeCompare(a.created_at);
    });

  if (!supabase) {
    return { data: ordered(FALLBACK_PROJECTS), source: "fallback" };
  }

  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_COLUMNS)
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return { data: ordered(FALLBACK_PROJECTS), source: "fallback" };
  }

  return { data: data as Project[], source: "supabase" };
}

export async function getProjectBySlug(
  slug: string,
): Promise<QueryResult<Project | null>> {
  const supabase = createPublicServerClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("projects")
      .select(PROJECT_COLUMNS)
      .eq("slug", slug)
      .maybeSingle();

    if (!error && data) return { data: data as Project, source: "supabase" };
  }

  const fallback = FALLBACK_PROJECTS.find((p) => p.slug === slug) ?? null;
  return { data: fallback, source: "fallback" };
}

export async function getSkills(): Promise<QueryResult<Skill[]>> {
  const supabase = createPublicServerClient();

  if (!supabase) return { data: FALLBACK_SKILLS, source: "fallback" };

  const { data, error } = await supabase
    .from("skills")
    .select("id, name, category, proficiency, notes, sort_order")
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) {
    return { data: FALLBACK_SKILLS, source: "fallback" };
  }

  return { data: data as Skill[], source: "supabase" };
}

export async function getRadarAxes(): Promise<QueryResult<RadarAxis[]>> {
  const { data, source } = await getSkills();
  return { data: buildRadarAxes(data), source };
}

export async function getWriteupSummaries(): Promise<
  QueryResult<WriteupSummary[]>
> {
  const supabase = createPublicServerClient();

  if (!supabase) {
    return { data: FALLBACK_WRITEUP_SUMMARIES, source: "fallback" };
  }

  const { data, error } = await supabase
    .from("writeups")
    .select(WRITEUP_SUMMARY_COLUMNS)
    .order("published_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return { data: FALLBACK_WRITEUP_SUMMARIES, source: "fallback" };
  }

  return { data: data as WriteupSummary[], source: "supabase" };
}

export async function getWriteupBySlug(
  slug: string,
): Promise<QueryResult<Writeup | null>> {
  const supabase = createPublicServerClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("writeups")
      .select(`${WRITEUP_SUMMARY_COLUMNS}, body_md`)
      .eq("slug", slug)
      .maybeSingle();

    if (!error && data) return { data: data as Writeup, source: "supabase" };
  }

  const fallback = FALLBACK_WRITEUPS.find((w) => w.slug === slug) ?? null;
  return { data: fallback, source: "fallback" };
}

/**
 * Compact snapshot used to ground the AI agent when its Supabase tools are
 * unavailable.
 */
export async function getAgentSnapshot() {
  const [{ data: profile }, { data: projects }, { data: skills }] =
    await Promise.all([getProfile(), getProjects(), getSkills()]);

  return { profile, projects, skills };
}
