"use client";

import type { ReactNode } from "react";

/**
 * Triggers the browser's own print dialog, where "Save as PDF" produces a
 * print-styled copy of /cv. Kept as a tiny client island so the CV page itself
 * stays a Server Component.
 */
export function CvPrintButton({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={className}
      aria-label="Print this page or save it as a PDF"
    >
      {children}
    </button>
  );
}
