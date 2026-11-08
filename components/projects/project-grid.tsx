"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { GithubIcon } from "@/components/icons/brand";
import { motion, AnimatePresence } from "motion/react";

import { Badge } from "@/components/ui/badge";
import type { Project, ProjectCategory } from "@/lib/types";
import { cn, formatRelative } from "@/lib/utils";

type Filter = "All" | ProjectCategory;

export function ProjectGrid({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = React.useState<Filter>("All");
  const [query, setQuery] = React.useState("");

  const categories = React.useMemo<Filter[]>(() => {
    const present = new Set(projects.map((p) => p.category));
    return ["All", ...Array.from(present).sort()];
  }, [projects]);

  const visible = React.useMemo(() => {
    const term = query.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesCategory = filter === "All" || project.category === filter;
      if (!matchesCategory) return false;
      if (!term) return true;
      const haystack = [
        project.title,
        project.description,
        project.category,
        ...project.tech_stack,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [projects, filter, query]);

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by category">
          {categories.map((category) => {
            const active = filter === category;
            const count =
              category === "All"
                ? projects.length
                : projects.filter((p) => p.category === category).length;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setFilter(category)}
                aria-pressed={active}
                className={cn(
                  "group inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[0.65rem] tracking-[0.1em] uppercase transition-colors",
                  active
                    ? "border-primary/50 bg-primary/12 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground",
                )}
              >
                {category}
                <span
                  className={cn(
                    "tabular-nums",
                    active ? "text-primary/70" : "text-muted-foreground/60",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-64">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <label htmlFor="project-search" className="sr-only">
            Search projects
          </label>
          <input
            id="project-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="grep projects…"
            className="h-9 w-full rounded-md border border-border bg-card/60 pl-9 pr-3 font-mono text-xs placeholder:text-muted-foreground/70 focus:border-primary/50 focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((project) => (
            <motion.div
              key={project.slug}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {visible.length === 0 ? (
        <p className="mt-12 text-center font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
          no projects matched that query
        </p>
      ) : null}
    </div>
  );
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card/60 p-5 transition-all hover:border-primary/40 hover:bg-card">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="primary">{project.category}</Badge>
          {project.status === "in-progress" ? (
            <Badge variant="warning">in progress</Badge>
          ) : null}
        </div>
        <span className="shrink-0 font-mono text-[0.6rem] tracking-[0.08em] text-muted-foreground/70 uppercase">
          {formatRelative(project.created_at)}
        </span>
      </div>

      <h3 className="mt-4 font-mono text-[0.95rem] leading-snug font-semibold tracking-tight">
        <Link
          href={`/projects/${project.slug}`}
          className="transition-colors after:absolute after:inset-0 group-hover:text-primary"
        >
          {project.title}
        </Link>
      </h3>

      <p className="mt-2.5 line-clamp-3 flex-1 text-[0.83rem] leading-relaxed text-muted-foreground">
        {project.description}
      </p>

      <ul className="mt-4 flex flex-wrap gap-1.5">
        {project.tech_stack.slice(0, 4).map((tech) => (
          <li
            key={tech}
            className="rounded border border-border/80 bg-secondary/40 px-1.5 py-0.5 font-mono text-[0.6rem] text-muted-foreground"
          >
            {tech}
          </li>
        ))}
        {project.tech_stack.length > 4 ? (
          <li className="px-1 py-0.5 font-mono text-[0.6rem] text-muted-foreground/70">
            +{project.tech_stack.length - 4}
          </li>
        ) : null}
      </ul>

      <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-3">
        <span className="font-mono text-[0.6rem] tracking-[0.12em] text-primary/80 uppercase">
          read case →
        </span>
        {project.github_url ? (
          <a
            href={project.github_url}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`${project.title} on GitHub`}
            className="relative z-10 grid size-6 place-items-center rounded text-muted-foreground transition-colors hover:text-primary"
          >
            <GithubIcon className="size-3.5" />
          </a>
        ) : (
          <ArrowUpRight className="size-3.5 text-muted-foreground" />
        )}
      </div>
    </article>
  );
}
