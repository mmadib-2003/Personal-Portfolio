import type { Metadata } from "next";
import Link from "next/link";
import { GithubIcon } from "@/components/icons/brand";

import { ProjectGrid } from "@/components/projects/project-grid";
import { StatusTicker } from "@/components/hud/telemetry";
import { Container, Section } from "@/components/ui/section";
import { getProfile, getProjects } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "SOC tooling, packet analysis labs and web security work by Muntasir Adib — each with the defensive angle documented.",
};

export default async function ProjectsPage() {
  const [{ data: projects }, { data: profile }] = await Promise.all([
    getProjects(),
    getProfile(),
  ]);

  const shipped = projects.filter((p) => p.status === "shipped").length;

  return (
    <>
      <section className="relative overflow-hidden border-b border-border pt-32 pb-12">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 hud-grid opacity-60" />
          <div className="absolute -top-32 left-1/3 h-72 w-[600px] rounded-full bg-primary/8 blur-[100px]" />
        </div>
        <Container>
          <p className="label-mono mb-3">archive · {projects.length} entries</p>
          <h1 className="font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Project <span className="text-primary">archive</span>
          </h1>
          <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground">
            {shipped} shipped, {projects.length - shipped} in progress. Filter by
            discipline or grep the stack — each entry links to the source and a
            written defence of what it demonstrates.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href={profile.githubUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 font-mono text-[0.65rem] tracking-[0.1em] text-muted-foreground uppercase transition-colors hover:border-primary/40 hover:text-primary"
            >
              <GithubIcon className="size-3" />
              raw source on github
            </a>
            <Link
              href="/writeups"
              className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 font-mono text-[0.65rem] tracking-[0.1em] text-muted-foreground uppercase transition-colors hover:border-primary/40 hover:text-primary"
            >
              read the write-ups
            </Link>
          </div>
        </Container>
      </section>

      <Section className="pt-12 pb-24">
        <Container>
          <ProjectGrid projects={projects} />
        </Container>
      </Section>

      <StatusTicker
        items={[
          "all entries sourced from supabase",
          "row level security: published rows only",
          "details pages render server-side",
          "ai agent can query this archive",
        ]}
      />
    </>
  );
}
