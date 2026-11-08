/**
 * Command catalogue for the interactive terminal.
 *
 * Pure data + pure functions, shared by the client component and (for the
 * `help` copy) the write-ups. No DOM access, so it stays testable.
 */

export interface TerminalLine {
  id: string;
  type: "input" | "output" | "error" | "accent" | "muted";
  text: string;
  href?: string;
}

export interface TerminalContext {
  profile: {
    name: string;
    role: string;
    availability: string;
    email: string;
    phone: string;
    githubUrl: string;
    linkedinUrl: string;
    resumeUrl: string;
    location: string;
  };
  projects: { slug: string; title: string; category: string; tech: string[] }[];
  skills: { name: string; category: string; proficiency: number }[];
  scenarios: { id: string; title: string; severity: string }[];
}

export interface CommandResult {
  lines: Omit<TerminalLine, "id">[];
  /** Optional in-page anchor the terminal should smooth-scroll to. */
  scrollTo?: string;
}

const HELP_ENTRIES: Array<[string, string]> = [
  ["help", "list every available command"],
  ["whoami", "short operator profile"],
  ["bio", "the long-form bio"],
  ["skills [category]", "proficiency ledger, optionally filtered"],
  ["projects", "published projects with stack"],
  ["project <slug>", "detail on one project"],
  ["writeups", "SOC triage write-ups"],
  ["triage", "triage scenarios and their severity"],
  ["contact", "how to reach Muntasir"],
  ["social", "GitHub, LinkedIn, resume"],
  ["status", "simulated HUD status readout"],
  ["goto <page>", "navigate: projects | writeups | triage | contact | home"],
  ["clear", "wipe the buffer"],
];

function fmt(value: string, width = 15): string {
  return value.padEnd(width, " ");
}

export function runCommand(raw: string, ctx: TerminalContext): CommandResult {
  const input = raw.trim();
  if (!input) return { lines: [] };

  const [command, ...rest] = input.toLowerCase().split(/\s+/);
  const args = rest.join(" ");

  switch (command) {
    case "help":
    case "?":
      return {
        lines: [
          { type: "accent", text: "available commands" },
          ...HELP_ENTRIES.map(([cmd, desc]) => ({
            type: "muted" as const,
            text: `  ${fmt(cmd)}${desc}`,
          })),
          { type: "muted", text: "tip: use ↑ / ↓ to walk command history" },
        ],
      };

    case "whoami":
      return {
        lines: [
          { type: "accent", text: ctx.profile.name },
          { type: "output", text: `  role      ${ctx.profile.role}` },
          { type: "output", text: `  location  ${ctx.profile.location}` },
          { type: "output", text: `  status    ${ctx.profile.availability}` },
          { type: "output", text: `  focus     SOC operations · threat detection · IR fundamentals` },
        ],
      };

    case "bio":
      return {
        lines: [
          { type: "accent", text: "bio" },
          {
            type: "output",
            text: `${ctx.profile.name} is an aspiring Cybersecurity Analyst pursuing a B.Sc. in ICT at the Institute of Information Technology, Jahangirnagar University.`,
          },
          {
            type: "output",
            text: "Focus: blue teaming, network traffic monitoring and triage workflows — practised through lab simulations, challenge write-ups and open-source tooling.",
          },
          { type: "muted", text: `currently: ${ctx.profile.availability}` },
        ],
      };

    case "skills": {
      const filter = args;
      const rows = filter
        ? ctx.skills.filter(
            (s) =>
              s.category.toLowerCase().includes(filter) ||
              s.name.toLowerCase().includes(filter),
          )
        : ctx.skills;

      if (rows.length === 0) {
        return {
          lines: [
            { type: "error", text: `no skills matched "${filter}"` },
            { type: "muted", text: "try: skills linux | skills python | skills networking" },
          ],
        };
      }

      const grouped = new Map<string, typeof rows>();
      for (const row of rows) {
        const bucket = grouped.get(row.category) ?? [];
        bucket.push(row);
        grouped.set(row.category, bucket);
      }

      const lines: Omit<TerminalLine, "id">[] = [
        { type: "accent", text: `skills${filter ? ` · matching "${filter}"` : ""}` },
      ];
      for (const [category, entries] of grouped) {
        lines.push({ type: "output", text: `[${category}]` });
        for (const entry of entries) {
          const bar = "█".repeat(entry.proficiency) + "░".repeat(5 - entry.proficiency);
          lines.push({
            type: "muted",
            text: `  ${fmt(entry.name, 32)}${bar} ${entry.proficiency}/5`,
          });
        }
      }
      return { lines };
    }

    case "projects":
      return {
        lines: [
          { type: "accent", text: `${ctx.projects.length} published projects` },
          ...ctx.projects.map((p) => ({
            type: "output" as const,
            text: `  ${fmt(p.category, 14)}${p.title}`,
          })),
          { type: "muted", text: "run `project <slug>` for detail · or browse /projects" },
        ],
        scrollTo: "#projects",
      };

    case "project": {
      const slug = args.replace(/\s+/g, "-");
      const project = ctx.projects.find(
        (p) => p.slug === slug || p.title.toLowerCase().includes(args) || p.slug.includes(slug),
      );
      if (!project) {
        return {
          lines: [
            { type: "error", text: args ? `unknown project "${args}"` : "usage: project <slug>" },
            ...ctx.projects.map((p) => ({ type: "muted" as const, text: `  ${p.slug}` })),
          ],
        };
      }
      return {
        lines: [
          { type: "accent", text: project.title },
          { type: "output", text: `  category  ${project.category}` },
          { type: "output", text: `  stack     ${project.tech.join(" · ")}` },
          { type: "muted", text: `  open      /projects/${project.slug}` },
        ],
      };
    }

    case "writeups":
    case "writeup":
      return {
        lines: [
          { type: "accent", text: "documented triage work" },
          { type: "output", text: "  ransomware triage · first 15 minutes" },
          { type: "output", text: "  beaconing hunting in packet captures" },
          { type: "output", text: "  dns tunnelling walkthrough" },
          { type: "output", text: "  phishing triage ladder" },
          { type: "muted", text: "open /writeups to read them" },
        ],
        scrollTo: "#writeups",
      };

    case "triage":
      return {
        lines: [
          { type: "accent", text: "triage scenarios" },
          ...ctx.scenarios.map((s) => ({
            type: "output" as const,
            text: `  [${s.severity.toUpperCase()}] ${s.title}`,
          })),
          { type: "muted", text: "open the Triage Lab section to walk a playbook" },
        ],
        scrollTo: "#triage",
      };

    case "contact":
      return {
        lines: [
          { type: "accent", text: "open a channel" },
          { type: "output", text: `  email     ${ctx.profile.email}` },
          { type: "output", text: `  whatsapp  ${ctx.profile.phone}` },
          { type: "output", text: `  location  ${ctx.profile.location}` },
          { type: "muted", text: "or use the dispatch form in the contact section" },
        ],
        scrollTo: "#contact",
      };

    case "social":
    case "links":
      return {
        lines: [
          { type: "accent", text: "links" },
          { type: "output", text: `  github    ${ctx.profile.githubUrl}`, href: ctx.profile.githubUrl },
          { type: "output", text: `  linkedin  ${ctx.profile.linkedinUrl}`, href: ctx.profile.linkedinUrl },
          { type: "output", text: `  resume    ${ctx.profile.resumeUrl}`, href: ctx.profile.resumeUrl },
        ],
      };

    case "status":
      return {
        lines: [
          { type: "accent", text: "hud status" },
          { type: "output", text: "  sensor mesh     6 / 6 online" },
          { type: "output", text: "  ingest pipeline nominal" },
          { type: "output", text: "  triage queue    0 critical · 2 medium" },
          { type: "muted", text: "  note: telemetry on this site is simulated for demonstration" },
        ],
      };

    case "goto":
    case "cd": {
      const target = args.trim();
      const map: Record<string, string> = {
        projects: "/projects",
        project: "/projects",
        writeups: "/writeups",
        writeup: "/writeups",
        triage: "#triage",
        contact: "#contact",
        home: "/",
        capabilities: "#capability",
        skills: "#capability",
      };
      const destination = map[target];
      if (!destination) {
        return {
          lines: [
            { type: "error", text: target ? `no route "${target}"` : "usage: goto <page>" },
            { type: "muted", text: "  pages: projects | writeups | triage | contact | home" },
          ],
        };
      }
      return {
        lines: [{ type: "accent", text: `routing → ${destination}` }],
        scrollTo: destination.startsWith("#") ? destination : undefined,
      };
    }

    case "clear":
      return { lines: [] };

    case "sudo":
      return {
        lines: [
          { type: "error", text: "nice try — but this shell is read-only." },
          { type: "muted", text: "try `help` for the command list" },
        ],
      };

    case "ls":
      return {
        lines: [
          { type: "muted", text: "home  projects  writeups  triage  contact  resume" },
          { type: "muted", text: "hint: try `goto projects`" },
        ],
      };

    case "cat":
      return {
        lines: [{ type: "muted", text: "try `bio`, `skills` or `projects` instead" }],
      };

    default:
      return {
        lines: [
          { type: "error", text: `command not found: ${command}` },
          { type: "muted", text: "type `help` to see what this shell understands" },
        ],
      };
  }
}

export const TERMINAL_SUGGESTIONS = [
  "help",
  "whoami",
  "skills",
  "projects",
  "triage",
  "contact",
];
