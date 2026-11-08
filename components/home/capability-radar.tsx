import { Badge } from "@/components/ui/badge";
import type { RadarAxis, Skill } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Capability radar.
 *
 * A pure-SVG hexagon radar (no chart dependency, no client JS) plus the
 * per-category skill ledger. `score` is the mean proficiency of the skills in
 * that category, on the same 1-5 scale as the database.
 */

const SIZE = 360;
const CENTER = SIZE / 2;
const RADIUS = 128;
const MAX_SCORE = 5;

function pointFor(index: number, total: number, ratio: number) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  return {
    x: CENTER + Math.cos(angle) * RADIUS * ratio,
    y: CENTER + Math.sin(angle) * RADIUS * ratio,
  };
}

function polygon(total: number, ratio: number) {
  return Array.from({ length: total }, (_, i) => {
    const { x, y } = pointFor(i, total, ratio);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");
}

export function CapabilityRadar({ axes }: { axes: RadarAxis[] }) {
  const total = axes.length || 1;
  const dataPoints = axes
    .map((axis, i) => {
      const ratio = Math.max(0.08, axis.score / MAX_SCORE);
      const { x, y } = pointFor(i, total, ratio);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label={`Capability radar across ${axes.length} categories`}
        className="mx-auto w-full max-w-[380px]"
      >
        {/* concentric grid */}
        {[0.25, 0.5, 0.75, 1].map((ratio) => (
          <polygon
            key={ratio}
            points={polygon(total, ratio)}
            fill="none"
            stroke="currentColor"
            strokeOpacity={ratio === 1 ? 0.22 : 0.1}
            strokeWidth="1"
            className="text-muted-foreground"
          />
        ))}

        {/* spokes + labels */}
        {axes.map((axis, i) => {
          const end = pointFor(i, total, 1);
          const label = pointFor(i, total, 1.19);
          const anchor =
            Math.abs(label.x - CENTER) < 12
              ? "middle"
              : label.x > CENTER
                ? "start"
                : "end";
          return (
            <g key={axis.category}>
              <line
                x1={CENTER}
                y1={CENTER}
                x2={end.x}
                y2={end.y}
                stroke="currentColor"
                strokeOpacity="0.12"
                strokeWidth="1"
                className="text-muted-foreground"
              />
              <text
                x={label.x}
                y={label.y}
                textAnchor={anchor}
                dominantBaseline="middle"
                className="fill-muted-foreground font-mono text-[9px] tracking-[0.06em] uppercase"
              >
                {axis.category}
              </text>
            </g>
          );
        })}

        {/* data polygon */}
        <polygon
          points={dataPoints}
          fill="var(--primary)"
          fillOpacity="0.16"
          stroke="var(--primary)"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />

        {/* vertices */}
        {axes.map((axis, i) => {
          const ratio = Math.max(0.08, axis.score / MAX_SCORE);
          const { x, y } = pointFor(i, total, ratio);
          return (
            <circle
              key={axis.category}
              cx={x}
              cy={y}
              r="3"
              fill="var(--primary)"
              stroke="var(--background)"
              strokeWidth="1.5"
            />
          );
        })}

        <circle cx={CENTER} cy={CENTER} r="2" fill="currentColor" className="text-primary" opacity="0.5" />
      </svg>
    </div>
  );
}

function ProficiencyBar({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-[3px]" aria-label={`${value} of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-2.5 w-[3px] rounded-full",
            i < value ? "bg-primary" : "bg-border",
          )}
        />
      ))}
    </span>
  );
}

export function SkillLedger({ axes }: { axes: RadarAxis[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {axes.map((axis) => (
        <div key={axis.category} className="rounded-lg border border-border bg-card/50 p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-mono text-[0.8rem] font-semibold tracking-wide">
              {axis.category}
            </h3>
            <Badge variant="primary" className="tabular-nums">
              {axis.score.toFixed(1)} / 5
            </Badge>
          </div>
          <ul className="mt-4 space-y-2.5">
            {axis.skills.map((skill) => (
              <SkillRow key={skill.name} skill={skill} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function SkillRow({ skill }: { skill: Skill }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.8rem] text-foreground/90">
          {skill.name}
        </span>
        {skill.notes ? (
          <span className="mt-0.5 block truncate font-mono text-[0.58rem] tracking-[0.04em] text-muted-foreground/80">
            {skill.notes}
          </span>
        ) : null}
      </span>
      <ProficiencyBar value={skill.proficiency} />
    </li>
  );
}
