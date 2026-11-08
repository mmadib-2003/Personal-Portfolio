import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Tag } from "lucide-react";

import { Markdown } from "@/components/writeups/markdown";
import { Badge } from "@/components/ui/badge";
import { Container, Section } from "@/components/ui/section";
import { getWriteupBySlug, getWriteupSummaries } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data: writeup } = await getWriteupBySlug(slug);

  if (!writeup) return { title: "Write-up not found" };

  return {
    title: writeup.title,
    description: writeup.summary,
    openGraph: { title: writeup.title, description: writeup.summary, type: "article" },
  };
}

export async function generateStaticParams() {
  const { data: writeups } = await getWriteupSummaries();
  return writeups.map((writeup) => ({ slug: writeup.slug }));
}

export default async function WriteupDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [{ data: writeup }, { data: all }] = await Promise.all([
    getWriteupBySlug(slug),
    getWriteupSummaries(),
  ]);

  if (!writeup) notFound();

  const others = all.filter((w) => w.slug !== writeup.slug).slice(0, 2);

  return (
    <>
      <section className="relative overflow-hidden border-b border-border pt-28 pb-10">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 hud-grid opacity-50" />
        </div>
        <Container>
          <Link
            href="/writeups"
            className="inline-flex items-center gap-1.5 font-mono text-[0.65rem] tracking-[0.12em] text-muted-foreground uppercase transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-3" /> field notes
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Badge variant="primary">{writeup.category}</Badge>
            <Badge variant="outline">
              <Clock className="size-2.5" />
              {writeup.read_minutes} min read
            </Badge>
            <Badge variant="muted">{formatDate(writeup.published_at)}</Badge>
          </div>

          <h1 className="mt-4 max-w-3xl font-display text-3xl leading-[1.12] font-semibold tracking-[-0.035em] sm:text-[2.6rem]">
            {writeup.title}
          </h1>
          <p className="mt-4 max-w-2xl text-[0.975rem] leading-relaxed text-muted-foreground">
            {writeup.summary}
          </p>

          <ul className="mt-5 flex flex-wrap items-center gap-1.5">
            <Tag className="size-3 text-muted-foreground" aria-hidden />
            {writeup.tags.map((tag) => (
              <li
                key={tag}
                className="rounded border border-border px-1.5 py-0.5 font-mono text-[0.58rem] text-muted-foreground"
              >
                #{tag}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <Section className="py-14">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_260px]">
            <article className="max-w-2xl">
              <Markdown content={writeup.body_md} />
            </article>

            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-lg border border-border bg-card/50 p-4">
                <p className="label-mono mb-2 text-[0.55rem]">note</p>
                <p className="text-[0.78rem] leading-relaxed text-muted-foreground">
                  Written from lab work. No client or production data appears in
                  these notes — every artefact is synthetic.
                </p>
              </div>

              {others.length > 0 ? (
                <div className="rounded-lg border border-border bg-card/50 p-4">
                  <p className="label-mono mb-3 text-[0.55rem]">keep reading</p>
                  <ul className="space-y-2.5">
                    {others.map((item) => (
                      <li key={item.slug}>
                        <Link
                          href={`/writeups/${item.slug}`}
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
