import Link from "next/link";

import { Container } from "@/components/ui/section";

export default function NotFound() {
  return (
    <Container>
      <div className="flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
        <p className="font-mono text-[0.65rem] tracking-[0.2em] text-muted-foreground uppercase">
          error 404 · route unresolved
        </p>
        <h1 className="mt-6 font-display text-6xl font-semibold tracking-[-0.05em] text-primary sm:text-7xl">
          404
        </h1>
        <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-muted-foreground">
          No entry in the routing table for that path. The packet was dropped —
          try the archive instead.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-md bg-primary px-5 py-2.5 font-mono text-[0.7rem] tracking-[0.1em] text-primary-foreground uppercase"
          >
            command center
          </Link>
          <Link
            href="/projects"
            className="rounded-md border border-border px-5 py-2.5 font-mono text-[0.7rem] tracking-[0.1em] text-muted-foreground uppercase transition-colors hover:border-primary/40 hover:text-primary"
          >
            project archive
          </Link>
        </div>
      </div>
    </Container>
  );
}
