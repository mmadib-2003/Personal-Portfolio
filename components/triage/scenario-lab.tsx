"use client";

import * as React from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { AlertTriangle, ArrowRight, Clock, ShieldAlert, Wrench } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { SocScenario } from "@/lib/types";
import { cn } from "@/lib/utils";

const SEVERITY_STYLES: Record<
  SocScenario["severity"],
  { badge: "danger" | "warning" | "primary"; ring: string; glow: string }
> = {
  critical: {
    badge: "danger",
    ring: "border-destructive/40",
    glow: "bg-destructive/10",
  },
  high: { badge: "warning", ring: "border-amber-500/40", glow: "bg-amber-500/10" },
  medium: { badge: "primary", ring: "border-primary/40", glow: "bg-primary/10" },
};

export function ScenarioLab({ scenarios }: { scenarios: SocScenario[] }) {
  const [active, setActive] = React.useState(scenarios[0]?.id ?? "");
  const [step, setStep] = React.useState(0);

  const scenario = scenarios.find((s) => s.id === active) ?? scenarios[0];

  if (!scenario) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card/50">
      <Tabs.Root
        value={active}
        onValueChange={setActive}
        orientation="vertical"
        className="grid lg:grid-cols-[280px_1fr]"
      >
        {/* incident list */}
        <Tabs.List
          aria-label="Triage scenarios"
          className="flex flex-row gap-1 overflow-x-auto border-b border-border p-3 lg:flex-col lg:overflow-visible lg:border-r lg:border-b-0"
        >
          {scenarios.map((item) => {
            const itemStyles = SEVERITY_STYLES[item.severity];
            return (
              <Tabs.Trigger
                key={item.id}
                value={item.id}
                className={cn(
                  "group relative shrink-0 rounded-md px-3 py-3 text-left transition-colors",
                  "data-[state=active]:bg-secondary data-[state=active]:text-foreground",
                  "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                )}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      item.severity === "critical"
                        ? "bg-destructive"
                        : item.severity === "high"
                          ? "bg-amber-500"
                          : "bg-primary",
                    )}
                  />
                  <span className="font-mono text-[0.55rem] tracking-[0.14em] uppercase">
                    {item.severity}
                  </span>
                  <span className="ml-auto font-mono text-[0.55rem] text-muted-foreground/60">
                    {item.mttr}
                  </span>
                </span>
                <span className="mt-1.5 block max-w-[220px] text-[0.8rem] leading-snug font-medium">
                  {item.title}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-y-2 left-0 w-0.5 rounded-full opacity-0 transition-opacity",
                    itemStyles.glow,
                    "data-[state=active]:opacity-100",
                  )}
                />
                <span
                  aria-hidden
                  className="absolute inset-y-2 left-0 hidden w-0.5 rounded-full bg-primary opacity-0 transition-opacity group-data-[state=active]:opacity-100 lg:block"
                />
              </Tabs.Trigger>
            );
          })}
        </Tabs.List>

        {/* scenario detail */}
        <Tabs.Content value={active} className="focus:outline-none">
          <ScenarioDetail
            key={scenario.id}
            scenario={scenario}
            step={step}
            setStep={setStep}
          />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}

function ScenarioDetail({
  scenario,
  step,
  setStep,
}: {
  scenario: SocScenario;
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
}) {
  const styles = SEVERITY_STYLES[scenario.severity];
  const current = scenario.steps[step];

  return (
          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={styles.badge}>
                    <AlertTriangle className="size-2.5" />
                    {scenario.severity}
                  </Badge>
                  <Badge variant="outline">
                    <Clock className="size-2.5" />
                    target {scenario.mttr}
                  </Badge>
                  <Badge variant="outline">simulated exercise</Badge>
                </div>
                <h3 className="mt-3 font-display text-xl font-semibold sm:text-2xl">
                  {scenario.title}
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="size-4 text-primary" aria-hidden />
                <span className="font-mono text-[0.58rem] tracking-[0.14em] text-muted-foreground uppercase">
                  playbook
                </span>
              </div>
            </div>

            <p className="mt-4 text-[0.9rem] leading-relaxed text-muted-foreground">
              {scenario.summary}
            </p>

            <div className={cn("mt-5 rounded-lg border p-4", styles.ring, styles.glow)}>
              <p className="label-mono text-[0.55rem]">initial signal</p>
              <p className="mt-1.5 font-mono text-[0.78rem] leading-relaxed text-foreground/90">
                {scenario.signal}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-1.5">
              <span className="mr-1 inline-flex items-center gap-1 font-mono text-[0.55rem] tracking-[0.12em] text-muted-foreground uppercase">
                <Wrench className="size-3" /> tooling
              </span>
              {scenario.tools.map((toolName) => (
                <span
                  key={toolName}
                  className="rounded border border-border bg-secondary/40 px-1.5 py-0.5 font-mono text-[0.6rem] text-muted-foreground"
                >
                  {toolName}
                </span>
              ))}
            </div>

            {/* step walker */}
            <div className="mt-7">
              <div className="flex items-center justify-between">
                <p className="label-mono text-[0.55rem]">
                  step {step + 1} / {scenario.steps.length}
                </p>
                <div className="flex gap-1">
                  {scenario.steps.map((s, index) => (
                    <button
                      key={s.order}
                      type="button"
                      onClick={() => setStep(index)}
                      aria-label={`Go to step ${index + 1}: ${s.title}`}
                      aria-current={index === step}
                      className={cn(
                        "h-1 rounded-full transition-all",
                        index === step
                          ? "w-6 bg-primary"
                          : "w-3 bg-border hover:bg-primary/40",
                      )}
                    />
                  ))}
                </div>
              </div>

              <ol className="mt-4 space-y-0">
                {scenario.steps.map((item, index) => {
                  const isCurrent = index === step;
                  const isDone = index < step;
                  return (
                    <li key={item.order} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <button
                          type="button"
                          onClick={() => setStep(index)}
                          className={cn(
                            "mt-1 grid size-5 shrink-0 place-items-center rounded-full border font-mono text-[0.55rem] transition-colors",
                            isCurrent
                              ? "border-primary bg-primary text-primary-foreground"
                              : isDone
                                ? "border-primary/40 text-primary"
                                : "border-border text-muted-foreground",
                          )}
                        >
                          {index + 1}
                        </button>
                        {index < scenario.steps.length - 1 ? (
                          <span
                            aria-hidden
                            className={cn(
                              "my-1 w-px flex-1",
                              isDone ? "bg-primary/30" : "bg-border",
                            )}
                          />
                        ) : null}
                      </div>
                      <div
                        className={cn(
                          "mb-3 flex-1 rounded-md px-3 py-2 transition-colors",
                          isCurrent
                            ? "bg-secondary/60"
                            : "hover:bg-secondary/30",
                        )}
                      >
                        <p
                          className={cn(
                            "font-mono text-[0.78rem] font-medium",
                            isCurrent ? "text-foreground" : "text-foreground/80",
                          )}
                        >
                          {item.title}
                        </p>
                        {isCurrent ? (
                          <>
                            <p className="mt-1.5 text-[0.82rem] leading-relaxed text-muted-foreground">
                              {item.detail}
                            </p>
                            <p className="mt-2 font-mono text-[0.62rem] text-primary/80">
                              <span className="text-muted-foreground">artifact → </span>
                              {item.artifact}
                            </p>
                          </>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ol>

              <div className="mt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                  className="font-mono text-[0.62rem] tracking-[0.1em] text-muted-foreground uppercase transition-colors hover:text-foreground disabled:opacity-40"
                >
                  ← prev
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setStep((s) => Math.min(scenario.steps.length - 1, s + 1))
                  }
                  disabled={step === scenario.steps.length - 1}
                  className="inline-flex items-center gap-1 font-mono text-[0.62rem] tracking-[0.1em] text-primary uppercase transition-opacity hover:opacity-80 disabled:opacity-40"
                >
                  next step <ArrowRight className="size-3" />
                </button>
              </div>
            </div>

            {current ? (
              <div className="mt-6 rounded-lg border border-border bg-background/60 p-4">
                <p className="label-mono text-[0.55rem]">escalation rule</p>
                <p className="mt-1.5 font-mono text-[0.75rem] leading-relaxed text-foreground/85">
                  {scenario.verdict}
                </p>
              </div>
            ) : null}
          </div>
  );
}
