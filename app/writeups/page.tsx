import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Container, Section } from "@/components/ui/section";
import { getWriteupSummaries } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Write-ups",
  description:
    "SOC triage write-ups and lab notes by Muntasir Adib: ransomware triage, beaconing detection, DNS tunnelling and phishing ladders.",
};

export default async function WriteupsPage() {
  const { data: writeups } = await getWriteupSummaries();

  return (
    <>
      <section className="relative overflow-hidden border-b border-border pt-32 pb-12">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 hud-grid opacity-60" />
          <div className="absolute -top-32 right-1/4 h-72 w-[560px] rounded-full bg-primary/8 blur-[100px]" />
        </div>
        <Container>
          <p className="label-mono mb-3">field notes · {writeups.length} entries</p>
          <h1 className="font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Write-<span className="text-primary">ups</span>
          </h1>
          <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground">
            The reasoning behind each drill: what the telemetry showed, what I
            ruled out, the evidence I kept, and the verdict I would escalate.
          </p>
        </Container>
      </section>

      <Section className="pt-12 pb-24">
        <Container>
          <div className="grid gap-4">
            {writeups.map((writeup, index) => (
              <Link
                key={writeup.slug}
                href={`/writeups/${writeup.slug}`}
                className="group relative grid gap-4 overflow-hidden rounded-xl border border-border bg-card/50 p-5 transition-colors hover:border-primary/40 hover:bg-card sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-6 sm:p-6"
              >
                <span className="font-mono text-[0.7rem] text-muted-foreground/50 tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="primary">{writeup.category}</Badge>
                    <span className="flex items-center gap-1 font-mono text-[0.58rem] tracking-[0.1em] text-muted-foreground/70 uppercase">
                      <Clock className="size-2.5" />
                      {writeup.read_minutes} min
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[0.58rem] tracking-[0.1em] text-muted-foreground/70 uppercase">
                      <BookOpen className="size-2.5" />
                      {formatDate(writeup.published_at)}
                    </span>
                  </div>
                  <h2 className="mt-2.5 font-mono text-[1rem] leading-snug font-semibold group-hover:text-primary">
                    {writeup.title}
                  </h2>
                  <p className="mt-1.5 max-w-2xl text-[0.85rem] leading-relaxed text-muted-foreground">
                    {writeup.summary}
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {writeup.tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded border border-border/80 px-1.5 py-0.5 font-mono text-[0.58rem] text-muted-foreground/80"
                      >
                        #{tag}
                      </li>
                    ))}
                  </ul>
                </div>

                <ArrowRight className="hidden size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary sm:block" />
              </Link>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
