"use client";

import * as React from "react";

import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";
import { seeded } from "@/lib/utils";

/**
 * Simulated SOC telemetry.
 *
 * Values are deterministic on the server (seeded) and only start to drift after
 * hydration, so markup never mismatches. Nothing here is presented as real
 * monitoring data — it's an interface metaphor for the owner's focus areas.
 */

interface Metric {
  label: string;
  value: string;
  hint: string;
  tone: "ok" | "warn" | "info";
}

function toneClass(tone: Metric["tone"]) {
  return tone === "warn"
    ? "text-amber-500"
    : tone === "info"
      ? "text-chart-3"
      : "text-primary";
}

export function TelemetryPanel({ queueCount }: { queueCount: number }) {
  const [tick, setTick] = React.useState(0);
  const mounted = useHydrated();

  React.useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 2600);
    return () => window.clearInterval(id);
  }, []);

  const metrics: Metric[] = React.useMemo(() => {
    const jitter = mounted ? tick : 0;
    const latency = 12 + Math.round(seeded(jitter + 1) * 9);
    const packets = 1284 + jitter * 37 + Math.round(seeded(jitter + 2) * 60);
    const queue = queueCount + (mounted ? Math.round(seeded(jitter + 3) * 2) : 0);
    const blocked = 412 + jitter * 3;

    return [
      { label: "Sensor mesh", value: "6 / 6 online", hint: "ingest pipeline", tone: "ok" },
      { label: "Edge latency", value: `${latency} ms`, hint: "p95 telemetry", tone: "info" },
      { label: "Packets parsed", value: packets.toLocaleString("en-US"), hint: "last 60s", tone: "ok" },
      { label: "Triage queue", value: String(queue), hint: "awaiting verdict", tone: queue > 4 ? "warn" : "ok" },
      { label: "Detections", value: String(blocked), hint: "rules matched", tone: "info" },
      { label: "MTTD", value: "3.4 min", hint: "rolling mean", tone: "ok" },
    ];
  }, [mounted, tick, queueCount]);

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
      {metrics.map((metric) => (
        <div key={metric.label} className="bg-card/80 p-3.5 backdrop-blur">
          <p className="label-mono text-[0.58rem]">{metric.label}</p>
          <p
            className={cn(
              "mt-1.5 font-mono text-[0.95rem] leading-none font-semibold tabular-nums",
              toneClass(metric.tone),
            )}
          >
            {metric.value}
          </p>
          <p className="mt-1 font-mono text-[0.55rem] tracking-[0.12em] text-muted-foreground/70 uppercase">
            {metric.hint}
          </p>
        </div>
      ))}
    </div>
  );
}

/** A tiny, deterministic sparkline that renders identically on server + client. */
export function Sparkline({
  points = 40,
  seed = 7,
  className,
}: {
  points?: number;
  seed?: number;
  className?: string;
}) {
  const path = React.useMemo(() => {
    const values = Array.from({ length: points }, (_, i) => {
      const base = Math.sin((i / points) * Math.PI * 2.4 + seed) * 0.4 + 0.5;
      return base + seeded(i * seed + 1) * 0.24;
    });
    const max = Math.max(...values);
    const min = Math.min(...values);
    return values
      .map((v, i) => {
        const x = (i / (points - 1)) * 100;
        const y = 100 - ((v - min) / (max - min || 1)) * 100;
        return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ");
  }, [points, seed]);

  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={cn("h-full w-full text-primary", className)}
    >
      <path d={path} fill="none" stroke="currentColor" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function StatusTicker({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  const doubled = [...items, ...items];

  return (
    <div
      className={cn(
        "relative overflow-hidden border-y border-border bg-card/50 py-1.5",
        className,
      )}
      aria-hidden
    >
      <div className="flex w-max animate-ticker items-center gap-8 whitespace-nowrap">
        {doubled.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="flex items-center gap-2 font-mono text-[0.6rem] tracking-[0.18em] text-muted-foreground uppercase"
          >
            <span className="size-1 rounded-full bg-primary/70" />
            {item}
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}
