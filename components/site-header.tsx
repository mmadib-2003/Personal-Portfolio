"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const LINKS = [
  { href: "/#command-center", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/writeups", label: "Write-ups" },
  { href: "/#capability", label: "Capabilities" },
  { href: "/#triage", label: "Triage Lab" },
  { href: "/cv", label: "CV" },
  { href: "/#contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile drawer when the route changes, synced during render
  // rather than in an effect (React's recommended pattern).
  const [openedAt, setOpenedAt] = React.useState(pathname);
  if (openedAt !== pathname) {
    setOpenedAt(pathname);
    setOpen(false);
  }

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled
          ? "border-b border-border bg-background/85 backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2.5"
          aria-label="Muntasir Adib — home"
        >
          <span className="grid size-8 place-items-center rounded border border-primary/40 bg-primary/10 font-mono text-[0.7rem] font-bold text-primary transition-colors group-hover:bg-primary/20">
            MA
          </span>
          <span className="hidden flex-col leading-none sm:flex">
            <span className="font-mono text-[0.8rem] font-semibold tracking-tight">
              muntasir.adib
            </span>
            <span className="font-mono text-[0.6rem] tracking-[0.2em] text-muted-foreground uppercase">
              soc · blue team
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {LINKS.map((link) => {
            const active =
              link.href === "/projects"
                ? pathname.startsWith("/projects")
                : link.href === "/writeups"
                  ? pathname.startsWith("/writeups")
                  : link.href === "/cv"
                    ? pathname === "/cv"
                    : false;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded px-2.5 py-2 font-mono text-[0.7rem] tracking-[0.08em] uppercase transition-colors xl:px-3 xl:text-[0.72rem]",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href="#contact"
            className="hidden rounded border border-primary/40 bg-primary/10 px-3 py-1.5 font-mono text-[0.7rem] tracking-[0.1em] text-primary uppercase transition-colors hover:bg-primary/20 sm:inline-flex"
          >
            Hire
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid size-9 place-items-center rounded border border-border text-muted-foreground lg:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border bg-background/95 backdrop-blur-xl lg:hidden">
          <nav className="mx-auto grid w-full max-w-6xl gap-1 px-5 py-4" aria-label="Mobile">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded px-3 py-2.5 font-mono text-xs tracking-[0.1em] uppercase text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
