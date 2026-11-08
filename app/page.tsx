import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, Radar } from "lucide-react";

import { CapabilityRadar, SkillLedger } from "@/components/home/capability-radar";
import { ContactDispatch } from "@/components/home/contact-dispatch";
import { Hero } from "@/components/home/hero";
import { InteractiveTerminal } from "@/components/terminal/interactive-terminal";
import { ProjectCard } from "@/components/projects/project-grid";
import { ScenarioLab } from "@/components/triage/scenario-lab";
import { Badge } from "@/components/ui/badge";
import { Container, Section, SectionHeading } from "@/components/ui/section";
import { SOC_SCENARIOS } from "@/lib/soc-scenarios";
import {
  getProfile,
  getProjects,
  getRadarAxes,
  getSkills,
  getWriteupSummaries,
} from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export default async function HomePage() {
  const [{ data: profile }, { data: projects }, { data: axes }, { data: skills }, { data: writeups }] =
    await Promise.all([
      getProfile(),
      getProjects(),
      getRadarAxes(),
      getSkills(),
      getWriteupSummaries(),
    ]);

  const terminalContext = {
    profile: {
      name: profile.name,
      role: profile.role,
      availability: profile.availability,
      email: profile.email,
      phone: profile.phone,
      githubUrl: profile.githubUrl,
      linkedinUrl: profile.linkedinUrl,
      resumeUrl: profile.resumeUrl,
      location: profile.location,
    },
    projects: projects.map((p) => ({
      slug: p.slug,
      title: p.title,
      category: p.category,
      tech: p.tech_stack,
    })),
    skills: skills.map((s) => ({
      name: s.name,
      category: s.category,
      proficiency: s.proficiency,
    })),
    scenarios: SOC_SCENARIOS.map((s) => ({
      id: s.id,
      title: s.title,
      severity: s.severity,
    })),
  };

  return (
    <>
      <Hero
        profile={profile}
        projects={projects}
        triageCount={SOC_SCENARIOS.length}
      />

      {/* ------------------------------------------------------------------ */}
      {/* 01 · Operator briefing                                              */}
      {/* ------------------------------------------------------------------ */}
      <Section id="briefing" className="border-t border-border">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_0.92fr] lg:gap-16">
            <div>
              <SectionHeading
                index="01"
                eyebrow="operator briefing"
                title={
                  <>
                    Defensive work,
                    <br />
                    <span className="text-primary">practised daily.</span>
                  </>
                }
                description={profile.bioShort}
              />

              <div className="mt-8 space-y-4 text-[0.95rem] leading-relaxed text-muted-foreground">
                {profile.bioLong
                  .split("\n\n")
                  .slice(1, 3)
                  .map((paragraph) => (
                    <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                  ))}
              </div>

              <ul className="mt-8 grid gap-2.5">
                {profile.focusAreas.map((area) => (
                  <li
                    key={area}
                    className="flex items-center gap-3 rounded-md border border-border bg-card/40 px-3.5 py-2.5"
                  >
                    <Radar className="size-3.5 shrink-0 text-primary" aria-hidden />
                    <span className="font-mono text-[0.78rem] text-foreground/90">
                      {area}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card/40 p-4">
                <GraduationCap className="size-4 shrink-0 text-primary" aria-hidden />
                <div className="min-w-0">
                  <p className="font-mono text-[0.75rem] text-foreground/90">
                    {profile.degree}
                  </p>
                  <p className="mt-0.5 text-[0.78rem] text-muted-foreground">
                    {profile.university}
                  </p>
                </div>
              </div>
            </div>

            {/* terminal */}
            <div className="lg:pt-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="label-mono text-[0.55rem]">interactive shell</p>
                <span className="font-mono text-[0.55rem] tracking-[0.12em] text-muted-foreground/60 uppercase">
                  type to explore
                </span>
              </div>
              <InteractiveTerminal context={terminalContext} />
              <p className="mt-3 text-[0.72rem] leading-relaxed text-muted-foreground/80">
                This console reads from the same Supabase tables that render the
                rest of the page — commands resolve against live content, not a
                hard-coded list.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* 02 · Capability radar                                               */}
      {/* ------------------------------------------------------------------ */}
      <Section id="capability" className="border-t border-border">
        <Container>
          <SectionHeading
            index="02"
            eyebrow="capability ledger"
            title={
              <>
                Toolkit, mapped to <span className="text-primary">depth</span>
              </>
            }
            description="Proficiency is scored 1–5 against hands-on lab work: 1 is awareness, 3 is comfortable unsupervised, 5 is teaching others. Scores are stored in Supabase so they stay honest as the work grows."
          />

          <div className="mt-12 grid gap-10 lg:grid-cols-[380px_1fr] lg:gap-14">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-xl border border-border bg-card/40 p-5">
                <div className="mb-2 flex items-center justify-between">
                  <p className="label-mono text-[0.55rem]">capability radar</p>
                  <Badge variant="outline">1–5 scale</Badge>
                </div>
                <CapabilityRadar axes={axes} />
                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4">
                  <div>
                    <p className="label-mono text-[0.52rem]">skills tracked</p>
                    <p className="mt-1 font-mono text-lg text-primary tabular-nums">
                      {skills.length}
                    </p>
                  </div>
                  <div>
                    <p className="label-mono text-[0.52rem]">categories</p>
                    <p className="mt-1 font-mono text-lg text-primary tabular-nums">
                      {axes.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <SkillLedger axes={axes} />
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* 03 · Projects                                                       */}
      {/* ------------------------------------------------------------------ */}
      <Section id="projects" className="border-t border-border">
        <Container>
          <SectionHeading
            index="03"
            eyebrow="project archive"
            title={
              <>
                Things built, <span className="text-primary">breaks documented</span>
              </>
            }
            description="Every project ships with the defensive angle spelled out — what it detects, what it models, and what it taught me about telemetry."
            action={
              <Link
                href="/projects"
                className="inline-flex items-center gap-1.5 font-mono text-[0.68rem] tracking-[0.12em] text-primary uppercase transition-opacity hover:opacity-80"
              >
                all projects <ArrowRight className="size-3" />
              </Link>
            }
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.slice(0, 6).map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* 04 · Triage lab                                                     */}
      {/* ------------------------------------------------------------------ */}
      <Section id="triage" className="border-t border-border">
        <Container>
          <SectionHeading
            index="04"
            eyebrow="triage lab"
            title={
              <>
                Simulated incidents, <span className="text-primary">documented verdicts</span>
              </>
            }
            description="Four drills I run against lab telemetry. Each one is a repeatable decision ladder: which signal to trust, what evidence to preserve, and the exact condition that turns a report into an escalation."
          />

          <div className="mt-10">
            <ScenarioLab scenarios={SOC_SCENARIOS} />
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* 05 · Write-ups                                                      */}
      {/* ------------------------------------------------------------------ */}
      <Section id="writeups" className="border-t border-border">
        <Container>
          <SectionHeading
            index="05"
            eyebrow="field notes"
            title={
              <>
                Write-ups from <span className="text-primary">the lab</span>
              </>
            }
            description="Longer-form analysis: how the traffic looked, what I ruled out, and what the verdict was."
            action={
              <Link
                href="/writeups"
                className="inline-flex items-center gap-1.5 font-mono text-[0.68rem] tracking-[0.12em] text-primary uppercase transition-opacity hover:opacity-80"
              >
                all write-ups <ArrowRight className="size-3" />
              </Link>
            }
          />

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {writeups.slice(0, 4).map((writeup) => (
              <Link
                key={writeup.slug}
                href={`/writeups/${writeup.slug}`}
                className="group flex flex-col rounded-lg border border-border bg-card/50 p-5 transition-colors hover:border-primary/40 hover:bg-card"
              >
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="primary">{writeup.category}</Badge>
                  <span className="font-mono text-[0.58rem] tracking-[0.08em] text-muted-foreground/70 uppercase">
                    {writeup.read_minutes} min read
                  </span>
                </div>
                <h3 className="mt-3 font-mono text-[0.92rem] leading-snug font-semibold group-hover:text-primary">
                  {writeup.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-[0.82rem] leading-relaxed text-muted-foreground">
                  {writeup.summary}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3">
                  <span className="flex items-center gap-1.5 font-mono text-[0.58rem] tracking-[0.08em] text-muted-foreground/70 uppercase">
                    <BookOpen className="size-3" />
                    {formatDate(writeup.published_at)}
                  </span>
                  <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* 06 · Contact                                                        */}
      {/* ------------------------------------------------------------------ */}
      <Section id="contact" className="border-t border-border">
        <Container>
          <SectionHeading
            index="06"
            eyebrow="open a channel"
            title={
              <>
                Hiring for a SOC seat? <span className="text-primary">Let&apos;s talk.</span>
              </>
            }
            description="I'm looking for an internship or entry-level SOC role where I can put analytical problem-solving to work on real defensive operations. Messages land straight in a monitored inbox."
          />
          <div className="mt-10">
            <ContactDispatch profile={profile} />
          </div>
        </Container>
      </Section>
    </>
  );
}
