import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  ExternalLink,
  FileText,
  Printer,
  ShieldCheck,
} from "lucide-react";

import { GithubIcon, LinkedinIcon } from "@/components/icons/brand";
import { CvPrintButton } from "@/components/cv/cv-print-button";
import { buttonVariants } from "@/components/ui/button";
import { Container, Section, SectionHeading } from "@/components/ui/section";
import { getProfile, getProjects, getRadarAxes, getWriteupSummaries } from "@/lib/queries";
import { CV_TEXT_PATH } from "@/lib/site";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "CV",
  description:
    "Curriculum vitae for Muntasir Adib — aspiring Cybersecurity Analyst focused on SOC operations, threat detection and incident response. Download the PDF or read it inline.",
};

/**
 * Web version of the CV.
 *
 * The PDF in /public is the canonical artefact; this page exists so the content
 * is also indexable, readable on a phone, and printable. "Download PDF" hits the
 * static file, "Print / Save as PDF" uses the browser's own renderer.
 */
export default async function CvPage() {
  const [{ data: profile }, { data: projects }, { data: axes }, { data: writeups }] =
    await Promise.all([getProfile(), getProjects(), getRadarAxes(), getWriteupSummaries()]);

  const selected = projects.slice(0, 4);

  return (
    <>
      {/* header */}
      <section className="relative overflow-hidden border-b border-border pt-28 pb-10">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 hud-grid opacity-60" />
          <div className="absolute -top-32 right-1/4 h-72 w-[560px] rounded-full bg-primary/8 blur-[100px]" />
        </div>
        <Container>
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 font-mono text-[0.62rem] tracking-[0.14em] text-muted-foreground uppercase transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-3" />
            back to command center
          </Link>

          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="label-mono mb-3">sys://cv · curriculum_vitae</p>
              <h1 className="font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                {profile.name}
              </h1>
              <p className="mt-2 font-mono text-[0.8rem] tracking-[0.05em] text-primary">
                {profile.role}
              </p>
              <p className="mt-3 max-w-xl text-[0.9rem] leading-relaxed text-muted-foreground">
                {profile.availability}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href="/Muntasir_Adib_CV.pdf"
                download
                className={buttonVariants({ size: "lg" })}
              >
                <Download className="size-4" />
                Download PDF
              </a>
              <CvPrintButton className={buttonVariants({ variant: "outline", size: "lg" })}>
                <Printer className="size-4" />
                Print / Save as PDF
              </CvPrintButton>
            </div>
          </div>

          <dl className="mt-8 grid gap-4 border-t border-border pt-6 font-mono text-[0.72rem] sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "email", value: profile.email, href: `mailto:${profile.email}` },
              { label: "phone", value: profile.phone, href: `tel:${profile.phone}` },
              { label: "github", value: "mmadib-2003", href: profile.githubUrl },
              { label: "location", value: profile.location },
            ].map((item) => (
              <div key={item.label}>
                <dt className="text-muted-foreground/60 tracking-[0.14em] uppercase">
                  {item.label}
                </dt>
                <dd className="mt-1 truncate text-foreground/90">
                  {item.href ? (
                    <a
                      href={item.href}
                      className="hover:text-primary"
                      {...(item.href.startsWith("http")
                        ? { target: "_blank", rel: "noreferrer noopener" }
                        : {})}
                    >
                      {item.value}
                    </a>
                  ) : (
                    item.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* body */}
      <Section id="cv" className="pt-14">
        <div className="cv-grid grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
          <div className="space-y-10">
            <div>
              <SectionHeading index="01" eyebrow="profile" title="Objective" />
              <p className="mt-4 max-w-2xl text-[0.93rem] leading-relaxed text-muted-foreground">
                {profile.bioLong}
              </p>
            </div>

            <div>
              <SectionHeading index="02" eyebrow="education" title="Academic record" />
              <ul className="mt-4 space-y-3">
                <li className="rounded-lg border border-border bg-card/40 p-4">
                  <p className="font-mono text-[0.8rem] text-foreground/90">{profile.degree}</p>
                  <p className="mt-1 text-[0.82rem] text-muted-foreground">{profile.university}</p>
                  <p className="mt-1 font-mono text-[0.6rem] tracking-[0.12em] text-primary uppercase">
                    currently pursuing
                  </p>
                </li>
              </ul>
            </div>

            <div>
              <SectionHeading
                index="03"
                eyebrow="key projects"
                title="Selected work"
                description="Each entry maps to a case study on this site and, where public, a repository."
              />
              <ul className="mt-4 space-y-3">
                {selected.map((project) => (
                  <li
                    key={project.id}
                    className="rounded-lg border border-border bg-card/40 p-4 transition-colors hover:border-primary/35"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <Link
                        href={`/projects/${project.slug}`}
                        className="font-mono text-[0.82rem] font-semibold text-foreground/90 hover:text-primary"
                      >
                        {project.title}
                      </Link>
                      <span className="font-mono text-[0.55rem] tracking-[0.12em] text-muted-foreground/60 uppercase">
                        {project.status}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[0.84rem] leading-relaxed text-muted-foreground">
                      {project.description}
                    </p>
                    <p className="mt-2 font-mono text-[0.58rem] tracking-[0.06em] text-muted-foreground/70">
                      {project.tech_stack.join(" · ")}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <SectionHeading
                index="04"
                eyebrow="practice"
                title="Triage write-ups"
                description="Documented drills — the reasoning, the evidence kept, the verdict."
              />
              <ul className="mt-4 divide-y divide-border rounded-lg border border-border bg-card/40">
                {writeups.map((writeup) => (
                  <li key={writeup.slug}>
                    <Link
                      href={`/writeups/${writeup.slug}`}
                      className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 transition-colors hover:bg-secondary/40"
                    >
                      <span className="text-[0.85rem] text-foreground/90">{writeup.title}</span>
                      <span className="font-mono text-[0.58rem] tracking-[0.1em] text-muted-foreground/70 uppercase">
                        {formatDate(writeup.published_at)} · {writeup.read_minutes} min
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* sidebar */}
          <aside className="space-y-6">
            <div className="rounded-xl border border-border bg-card/50 p-4">
              <p className="label-mono text-[0.55rem]">technical skills</p>
              <dl className="mt-3 space-y-3">
                {axes.map((axis) => (
                  <div key={axis.category}>
                    <dt className="flex items-baseline justify-between gap-2 font-mono text-[0.68rem] text-foreground/85">
                      {axis.category}
                      <span className="text-[0.58rem] text-primary">
                        {axis.score.toFixed(1)}/5
                      </span>
                    </dt>
                    <dd className="mt-1 text-[0.72rem] leading-relaxed text-muted-foreground">
                      {axis.skills.map((skill) => skill.name).join(" · ")}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-xl border border-border bg-card/50 p-4">
              <p className="label-mono text-[0.55rem]">files</p>
              <ul className="mt-3 space-y-2">
                <li>
                  <a
                    href="/Muntasir_Adib_CV.pdf"
                    download
                    className="flex items-center gap-2 text-[0.8rem] text-foreground/85 hover:text-primary"
                  >
                    <FileText className="size-3.5 shrink-0 text-primary" />
                    Muntasir_Adib_CV.pdf
                  </a>
                </li>
                <li>
                  <a
                    href={CV_TEXT_PATH}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-[0.8rem] text-foreground/85 hover:text-primary"
                  >
                    <FileText className="size-3.5 shrink-0 text-muted-foreground" />
                    Plain-text version (ATS)
                  </a>
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-border bg-card/50 p-4">
              <p className="label-mono text-[0.55rem]">channels</p>
              <ul className="mt-3 space-y-2.5">
                <li>
                  <a
                    href={`mailto:${profile.email}`}
                    className="flex items-center gap-2 text-[0.8rem] text-foreground/85 hover:text-primary"
                  >
                    <ShieldCheck className="size-3.5 shrink-0 text-primary" />
                    {profile.email}
                  </a>
                </li>
                <li>
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center gap-2 text-[0.8rem] text-foreground/85 hover:text-primary"
                  >
                    <GithubIcon className="size-3.5 shrink-0" />
                    github.com/mmadib-2003
                  </a>
                </li>
                <li>
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center gap-2 text-[0.8rem] text-foreground/85 hover:text-primary"
                  >
                    <LinkedinIcon className="size-3.5 shrink-0" />
                    linkedin
                  </a>
                </li>
                <li>
                  <Link
                    href="/#contact"
                    className="flex items-center gap-2 text-[0.8rem] text-foreground/85 hover:text-primary"
                  >
                    <ExternalLink className="size-3.5 shrink-0" />
                    contact form
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
