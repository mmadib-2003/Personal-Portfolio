/**
 * Shared domain types. These mirror the Supabase schema in
 * `supabase/migrations/0001_init.sql` — keep them in sync.
 */

export const PROJECT_CATEGORIES = [
  "SOC",
  "Networking",
  "Scripting",
  "Web Security",
  "Systems",
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export const SKILL_CATEGORIES = [
  "Linux",
  "Networking",
  "Python",
  "Web Security",
  "SOC Operations",
  "Tooling",
] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export const WRITEUP_CATEGORIES = [
  "Triage",
  "Detection",
  "Networking",
  "Web Security",
  "Lab Notes",
] as const;

export type WriteupCategory = (typeof WRITEUP_CATEGORIES)[number];

export type ProjectStatus = "shipped" | "in-progress" | "archived";

export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  long_description: string | null;
  tech_stack: string[];
  github_url: string | null;
  write_up_url: string | null;
  category: ProjectCategory;
  status: ProjectStatus;
  featured: boolean;
  sort_order: number;
  created_at: string;
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  proficiency: number;
  notes: string | null;
  sort_order: number;
}

export interface ProfileFact {
  key: string;
  value: string;
  label: string | null;
}

export interface WriteupSummary {
  slug: string;
  title: string;
  summary: string;
  category: WriteupCategory;
  read_minutes: number;
  tags: string[];
  published_at: string;
}

export interface Writeup extends WriteupSummary {
  body_md: string;
}

/** Aggregated profile used across the UI and the AI agent. */
export interface PortfolioProfile {
  name: string;
  role: string;
  bioShort: string;
  bioLong: string;
  focusAreas: string[];
  location: string;
  email: string;
  phone: string;
  whatsapp: string;
  githubUrl: string;
  linkedinUrl: string;
  resumeUrl: string;
  university: string;
  degree: string;
  availability: string;
  githubUsername: string | null;
}

export interface RadarAxis {
  category: SkillCategory;
  /** Mean proficiency across the category, 1-5. */
  score: number;
  /** Number of skills backing the score. */
  count: number;
  skills: Skill[];
}

export interface SocScenarioStep {
  order: number;
  title: string;
  detail: string;
  artifact: string;
}

export interface SocScenario {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium";
  signal: string;
  mttr: string;
  summary: string;
  tools: string[];
  steps: SocScenarioStep[];
  verdict: string;
}
