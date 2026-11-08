"use client";

import * as React from "react";

const ROLES = [
  "aspiring SOC analyst",
  "blue-team focused",
  "packet wrangler",
  "log whisperer",
  "incident triage",
  "always learning",
];

/**
 * Kinetic typing effect for the hero subtitle.
 *
 * Starts on the first role so SSR markup is meaningful without JS; the caret
 * animation is pure CSS. Reduced-motion users get a static first role.
 */
export function KineticRoles() {
  const [index, setIndex] = React.useState(0);
  const [text, setText] = React.useState(ROLES[0]);
  const [phase, setPhase] = React.useState<"typing" | "holding" | "deleting">(
    "holding",
  );

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;

    let timer: number;

    if (phase === "holding") {
      timer = window.setTimeout(() => setPhase("deleting"), 2100);
    } else if (phase === "deleting") {
      timer = window.setTimeout(() => {
        if (text.length === 0) {
          setIndex((i) => (i + 1) % ROLES.length);
          setPhase("typing");
        } else {
          setText((t) => t.slice(0, -1));
        }
      }, 26);
    } else {
      const target = ROLES[index];
      timer = window.setTimeout(() => {
        if (text.length >= target.length) {
          setPhase("holding");
        } else {
          setText(target.slice(0, text.length + 1));
        }
      }, 62);
    }

    return () => window.clearTimeout(timer);
  }, [phase, text, index]);

  return (
    <span className="text-primary" aria-live="polite">
      {text}
      <span className="ml-0.5 inline-block h-[1em] w-[2px] animate-caret bg-primary align-middle" aria-hidden />
    </span>
  );
}
