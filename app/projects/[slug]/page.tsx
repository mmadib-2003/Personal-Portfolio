import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CalendarDays, Layers } from "lucide-react";
import { GithubIcon } from "@/components/icons/brand";

import { Badge } from "@/components/ui/badge";
import { Container, Section } from "@/components/ui/section";
import { getProjectBySlug, getProjects } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data: project } = await getProjectBySlug(slug);

  if (!project) return { title: "Project not found" };

  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      type: "article",
    },
  };
}

export async function generateStaticParams() {
  const { data: projects } = await getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [{ data: project }, { data: all }] = await Promise.all([
    getProjectBySlug(slug),
    getProjects(),
  ]);

  if (!project) notFound();

  const related = all
    .filter((p) => p.slug !== project.slug && p.category === project.category)
    .slice(0, 2);

  const paragraphs = (project.long_description ?? project.description)
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <>
      <section className="relative overflow-hidden border-b border-border pt-28 pb-10">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 hud-grid opacity-50" />
        </div>
        <Container>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 font-mono text-[0.65rem] tracking-[0.12em] text-muted-foreground uppercase transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-3" /> archive
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Badge variant="primary">{project.category}</Badge>
            <Badge variant={project.status === "shipped" ? "outline" : "warning"}>
              {project.status}
            </Badge>
            <Badge variant="muted">
              <CalendarDays className="size-2.5" />
              {formatDate(project.created_at)}
            </Badge>
          </div>

          <h1 className="mt-4 max-w-3xl font-display text-3xl leading-[1.1] font-semibold tracking-[-0.035em] sm:text-[2.75rem]">
            {project.title}
          </h1>
          <p className="mt-4 max-w-2xl text-[0.975rem] leading-relaxed text-muted-foreground">
            {project.description}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            {project.github_url ? (
              <a
                href={project.github_url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-4 py-2 font-mono text-[0.7rem] tracking-[0.1em] text-primary uppercase transition-colors hover:bg-primary/20"
              >
                <GithubIcon className="size-3.5" />
                view source
                <ArrowUpRight className="size-3" />
              </a>
            ) : null}
            {project.write_up_url ? (
              <a
                href={project.write_up_url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 font-mono text-[0.7rem] tracking-[0.1em] text-muted-foreground uppercase transition-colors hover:border-primary/40 hover:text-primary"
              >
                read write-up
              </a>
            ) : null}
          </div>
        </Container>
      </section>

      <Section className="py-14">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_280px]">
            <article className="space-y-5">
              {paragraphs.map((paragraph) => {
                if (paragraph.startsWith("- ")) {
                  return (
                    <ul key={paragraph.slice(0, 30)} className="space-y-2">
                      {paragraph
                        .split("\n")
                        .filter((line) => line.trim().startsWith("- "))
                        .map((line) => (
                          <li
                            key={line}
                            className="flex gap-2.5 text-[0.92rem] leading-relaxed text-muted-foreground"
                          >
                            <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
                            {line.replace(/^-\s*/, "")}
                          </li>
                        ))}
                    </ul>
                  );
                }

                if (/^\d+\./.test(paragraph)) {
                  return (
                    <ol key={paragraph.slice(0, 30)} className="space-y-2.5">
                      {paragraph
                        .split("\n")
                        .filter((line) => /^\d+\./.test(line.trim()))
                        .map((line) => (
                          <li
                            key={line}
                            className="flex gap-2.5 text-[0.92rem] leading-relaxed text-muted-foreground"
                          >
                            <span className="font-mono text-[0.72rem] text-primary">
                              {line.match(/^\d+\./)?.[0]}
                            </span>
                            {line.replace(/^\d+\.\s*/, "")}
                          </li>
                        ))}
                    </ol>
                  );
                }

                return (
                  <p
                    key={paragraph.slice(0, 30)}
                    className="text-[0.95rem] leading-[1.75] text-muted-foreground"
                  >
                    {paragraph}
                  </p>
                );
              })}
            </article>

            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-lg border border-border bg-card/50 p-4">
                <p className="label-mono mb-3 flex items-center gap-1.5 text-[0.55rem]">
                  <Layers className="size-3" /> stack
                </p>
                <ul className="flex flex-wrap gap-1.5">
                  {project.tech_stack.map((tech) => (
                    <li
                      key={tech}
                      className="rounded border border-border bg-secondary/40 px-2 py-0.5 font-mono text-[0.62rem] text-muted-foreground"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-border bg-card/50 p-4">
                <p className="label-mono mb-2 text-[0.55rem]">metadata</p>
                <dl className="space-y-2 font-mono text-[0.68rem]">
                  {[
                    ["category", project.category],
                    ["status", project.status],
                    ["created", formatDate(project.created_at)],
                    ["featured", project.featured ? "yes" : "no"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-3">
                      <dt className="text-muted-foreground/70">{label}</dt>
                      <dd className="text-foreground/90">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {related.length > 0 ? (
                <div className="rounded-lg border border-border bg-card/50 p-4">
                  <p className="label-mono mb-3 text-[0.55rem]">related</p>
                  <ul className="space-y-2">
                    {related.map((item) => (
                      <li key={item.slug}>
                        <Link
                          href={`/projects/${item.slug}`}
                          className="text-[0.8rem] leading-snug text-muted-foreground transition-colors hover:text-primary"
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
