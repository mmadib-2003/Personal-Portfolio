import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Hexagonal operator badge.
 *
 * The photo is clipped by an SVG hexagon clip-path and wrapped in three
 * concentric frames (dashed sweep ring, solid accent ring, soft outer glow) so
 * it reads as part of the SOC interface rather than a photo dropped onto it.
 * `next/image` handles optimisation; the file is a bundled local asset.
 */
export function AvatarHex({
  size = 224,
  priority = false,
  className,
  statusLabel = "operator online",
}: {
  size?: number;
  priority?: boolean;
  className?: string;
  statusLabel?: string;
}) {
  return (
    <div
      className={cn("relative select-none", className)}
      style={{ width: size, height: size }}
    >
      {/* outer soft halo */}
      <div
        aria-hidden
        className="absolute inset-[-14%] rounded-full bg-primary/12 blur-2xl"
      />

      {/* rotating dashed sweep ring */}
      <svg
        aria-hidden
        viewBox="0 0 200 200"
        className="absolute inset-[-9%] size-[118%] animate-sweep text-primary/35"
        style={{ animationDuration: "22s" }}
      >
        <circle
          cx="100"
          cy="100"
          r="94"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.75"
          strokeDasharray="2 7"
        />
        <circle
          cx="100"
          cy="100"
          r="87"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeDasharray="24 140"
          strokeLinecap="round"
        />
      </svg>

      {/* static accent hex frame */}
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 size-full text-primary"
      >
        <polygon
          points="50,1.5 96,27 96,73 50,98.5 4,73 4,27"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.55"
          strokeWidth="0.9"
        />
        <polygon
          points="50,6 92,29.5 92,70.5 50,94 8,70.5 8,29.5"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.22"
          strokeWidth="0.5"
        />
      </svg>

      {/* corner ticks */}
      <span className="absolute -top-1 left-1/2 h-2 w-px -translate-x-1/2 bg-primary" aria-hidden />
      <span className="absolute -bottom-1 left-1/2 h-2 w-px -translate-x-1/2 bg-primary" aria-hidden />

      {/* the photo, clipped to the hexagon */}
      <div
        className="absolute inset-[3.5%] overflow-hidden bg-secondary"
        style={{
          clipPath:
            "polygon(50% 2%, 95% 27.5%, 95% 72.5%, 50% 98%, 5% 72.5%, 5% 27.5%)",
        }}
      >
        <Image
          src="/muntasir-adib.jpg"
          alt="Muntasir Adib"
          width={800}
          height={800}
          priority={priority}
          sizes={`${size}px`}
          className="size-full object-cover object-top grayscale-[18%] contrast-[1.05] transition-all duration-500 hover:grayscale-0"
        />
        {/* interface tint + scanlines over the photo */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 scanlines opacity-70 mix-blend-overlay"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/70 to-transparent"
        />
      </div>

      {/* status pill */}
      <div className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 shadow-sm">
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-70" />
          <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
        </span>
        <span className="font-mono text-[0.55rem] tracking-[0.16em] text-muted-foreground uppercase">
          {statusLabel}
        </span>
      </div>
    </div>
  );
}
