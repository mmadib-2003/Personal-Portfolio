import Link from "next/link";
import { ArrowUpRight, Download, Mail, ShieldCheck, Terminal } from "lucide-react";

import { AvatarHex } from "@/components/hud/avatar-hex";
import { Sparkline, StatusTicker, TelemetryPanel } from "@/components/hud/telemetry";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import type { PortfolioProfile, Project } from "@/lib/types";

import { KineticRoles } from "./kinetic-roles";

export function Hero({
  profile,
  projects,
  triageCount,
}: {
  profile: PortfolioProfile;
  projects: Project[];
  triageCount: number;
}) {
  const featured = projects.filter((p) => p.featured).slice(0, 2);

  return (
    <section
      id="command-center"
      className="relative overflow-hidden pt-28 pb-16 sm:pt-32 lg:pt-36"
    >
      {/* backdrop: grid + radial glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 hud-grid opacity-70" />
        <div className="absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
      </div>

      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
          {/* ---------------------------------------------------------------- */}
          {/* Left: identity + kinetic heading                                  */}
          {/* ---------------------------------------------------------------- */}
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 backdrop-blur">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
              </span>
              <span className="font-mono text-[0.62rem] tracking-[0.16em] text-muted-foreground uppercase">
                {profile.availability}
              </span>
            </div>

            <p className="label-mono mb-3 flex items-center gap-2">
              <Terminal className="size-3" aria-hidden />
              sys://command-center
            </p>

            <h1 className="font-display text-[2.6rem] leading-[0.95] font-semibold tracking-[-0.045em] sm:text-6xl lg:text-[4.1rem]">
              <span className="block text-muted-foreground/60 text-[0.42em] tracking-[0.28em] uppercase mb-3 font-normal">
                {profile.name}
              </span>
              <span className="block">I watch the</span>
              <span className="relative block text-primary text-glow">
                quiet hours
                <span className="ml-2 inline-block h-[0.75em] w-[3px] animate-caret bg-primary align-baseline" aria-hidden />
              </span>
            </h1>

            <div className="mt-5 flex min-h-[1.75rem] items-center font-mono text-sm text-foreground/80">
              <span className="text-primary">&gt;</span>
              <span className="ml-2">
                <KineticRoles />
              </span>
            </div>

            <p className="mt-6 max-w-xl text-[0.975rem] leading-relaxed text-muted-foreground">
              {profile.bioShort}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="#contact" className={buttonVariants({ size: "lg" })}>
                <Mail className="size-4" />
                Open a channel
              </Link>
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                <Download className="size-4" />
                Download resume
              </a>
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase transition-colors hover:text-primary"
              >
                github
                <ArrowUpRight className="size-3" />
              </a>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-border pt-6">
              {[
                { label: "Focus", value: "Blue team" },
                { label: "Practice", value: "Lab + write-ups" },
                { label: "Seeking", value: "SOC internship" },
              ].map((item) => (
                <div key={item.label}>
                  <dt className="label-mono text-[0.55rem]">{item.label}</dt>
                  <dd className="mt-1 font-mono text-[0.8rem] text-foreground/90">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Right: operator badge + telemetry                                  */}
          {/* ---------------------------------------------------------------- */}
          <div className="relative flex flex-col items-center gap-8">
            <div className="relative">
              <AvatarHex size={236} priority statusLabel="operator online" />
              <div
                aria-hidden
                className="absolute -top-3 -left-3 size-6 border-t border-l border-primary/50"
              />
              <div
                aria-hidden
                className="absolute -right-3 -bottom-3 size-6 border-r border-b border-primary/50"
              />
            </div>

            <div className="w-full max-w-md">
              <div className="mb-2 flex items-center justify-between">
                <span className="label-mono text-[0.58rem]">telemetry</span>
                <span className="flex items-center gap-1.5 font-mono text-[0.55rem] tracking-[0.14em] text-primary uppercase">
                  <ShieldCheck className="size-3" />
                  simulated
                </span>
              </div>
              <TelemetryPanel queueCount={triageCount} />
              <div className="mt-3 h-14 overflow-hidden rounded-lg border border-border bg-card/60 p-2">
                <Sparkline seed={5} />
              </div>
            </div>
          </div>
        </div>

        {featured.length > 0 ? (
          <div className="mt-16 grid gap-3 sm:grid-cols-2">
            {featured.map((project) => (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                className="group relative overflow-hidden rounded-lg border border-border bg-card/60 p-5 backdrop-blur transition-colors hover:border-primary/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="label-mono text-[0.55rem]">
                      featured · {project.category}
                    </p>
                    <h2 className="mt-2 font-mono text-sm leading-snug font-semibold text-foreground/95 group-hover:text-primary">
                      {project.title}
                    </h2>
                  </div>
                  <ArrowUpRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {project.description}
                </p>
              </Link>
            ))}
          </div>
        ) : null}
      </Container>

      <div className="mt-16">
        <StatusTicker
          items={[
            "blue team · defensive operations",
            "wireshark · tcpdump · nmap",
            "python automation",
            "log parsing & enrichment",
            "owasp top 10",
            "nist incident response lifecycle",
            "splunk / elk basics",
            "linux administration",
          ]}
        />
      </div>
    </section>
  );
}
