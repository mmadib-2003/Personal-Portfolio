# Muntasir Adib — SOC Portfolio

An interactive, security-themed personal portfolio for **Muntasir Adib**, an aspiring
Cybersecurity Analyst focused on SOC operations, threat detection and incident
response triage.

The site is a working defensive-operations console rather than a static résumé:
a live HUD, an interactive terminal, SOC triage playbooks, a capability radar, a
Supabase-backed project archive, and a streaming AI "SOC Assistant" that answers
recruiter questions from the portfolio data and the owner's live GitHub repos.

- **Live:** <https://personalportfolio-rust-nu.vercel.app>
- **Stack:** Next.js 16 (App Router) · TypeScript 5 · Tailwind CSS 4 · Supabase · Vercel AI SDK
- **Package manager:** pnpm

---

## 1. Quick start

```bash
pnpm install
cp .env.example .env.local     # then fill in the values (see §2)
pnpm dev                       # http://localhost:3000
```

Quality gates — run all three before pushing:

```bash
pnpm lint          # eslint (flat config, next/core-web-vitals + typescript)
pnpm typecheck     # tsc --noEmit
pnpm build         # next build
```

The app is designed to **degrade gracefully**: with no Supabase credentials it
renders a curated fallback snapshot from `lib/fallback-data.ts`, and with no AI
Gateway key the chat widget reports that the assistant is offline instead of
breaking the page. Nothing whitescreens on a fresh clone.

---

## 2. Environment variables

| Variable | Scope | Required | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | public | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | yes | Anon key — RLS-restricted public reads only |
| `SUPABASE_SERVICE_ROLE_KEY` | server | yes | Contact-form writes; bypasses RLS, never bundled to the client |
| `GITHUB_TOKEN` | server | optional | Raises the GitHub API rate limit for the agent's repo tool |
| `AI_GATEWAY_API_KEY` | server | yes for chat | Vercel AI Gateway credential |
| `AI_MODEL_ID` | server | optional | Gateway model id (default `openai/gpt-4o-mini`) |

Set the same variables in **Vercel → Project → Settings → Environment Variables**
for Production *and* Preview. On Vercel, the AI Gateway can also authenticate via
Vercel OIDC, in which case `AI_GATEWAY_API_KEY` may be omitted.

> `.env`, `.env.local` and every `.env.*` variant are git-ignored. Only
> `.env.example` is committed, and it contains no secrets.

---

## 3. Database

Schema and RLS live in `supabase/migrations/`:

| File | Contents |
| --- | --- |
| `0001_init.sql` | Tables, enums, indexes, triggers, RLS policies, grants, `project_digest` view |
| `0002_seed.sql` | Idempotent seed data (profile facts, 15 skills, 6 projects, 4 write-ups) |

### Tables

- `projects` — `slug, title, description, long_description, tech_stack[], github_url, write_up_url, category, status, featured, is_published, sort_order`
- `skills` — `name, category, proficiency (1–5), notes, sort_order, is_published`
- `profile` — key/value facts (`bio_short`, `email`, `resume_url`, …) with `is_public`
- `writeups` — `slug, title, summary, body_md, category, read_minutes, tags[], published_at, is_published`
- `contact_messages` — write-only inbox: `name, email, subject, message, user_agent`

### Applying migrations

Migrations are **never** run by the build. Apply them explicitly:

```bash
# Option A — Supabase CLI (the recommended path)
supabase link --project-ref <project-ref>
supabase db push

# Option B — paste the file contents into the Supabase SQL editor, in order
```

Rows are only publicly visible when `is_published` / `is_public` is true, so
editing content is a matter of flipping that column (or inserting new rows with
the service role).

---

## 4. Security model

**RLS is on for every table and `force row level security` is set**, so even the
table owner is subject to policy.

| Table | `anon` / `authenticated` | `service_role` |
| --- | --- | --- |
| `projects` | `SELECT` where `is_published` | full |
| `skills` | `SELECT` where `is_published` | full |
| `profile` | `SELECT` where `is_public` | full |
| `writeups` | `SELECT` where `is_published` | full |
| `contact_messages` | `INSERT` only — no `SELECT` grant exists, so submissions can never be read back | full |

Additional hardening:

- **Least privilege grants.** `revoke all` then a single `grant select` (or
  `grant insert` for the inbox) per table. `anon` has no write path anywhere else.
- **Server-only secrets.** `lib/supabase/server.ts` imports `server-only`, so the
  service-role client fails the build if it is ever pulled into client code.
- **Input sanitisation** (`lib/security.ts`) — control characters stripped, HTML
  entities neutralised, `javascript:` / `data:text/html` defused, lengths bounded
  with Zod on both the chat and contact paths.
- **Prompt-injection defence in depth** — heuristic pattern matching rejects
  instruction-override, prompt-exfiltration, role-confusion, token-smuggling and
  secret-exfiltration attempts; client-supplied `system` messages are dropped;
  a strict system prompt reasserts scope; and every agent tool is read-only.
- **Rate limiting** — sliding-window limiter per IP on `/api/chat` (20/min) and on
  the contact action (5 per 10 min).
- **Spam controls** — honeypot field plus a heuristic scorer (link density, casing,
  blocked URL schemes) on the contact form.
- **Headers** set in `next.config.ts`: `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy`, HSTS. `poweredByHeader` is disabled.
- **No XSS surface** — the write-up renderer (`components/writeups/markdown.tsx`)
  escapes all text and builds React nodes; `dangerouslySetInnerHTML` is not used
  anywhere in the project.

---

## 5. Architecture

```
app/
  layout.tsx                 Fonts, theme provider, header/footer, chat widget
  page.tsx                   Home: HUD hero, briefing, radar, projects, triage, write-ups, contact
  projects/page.tsx          Filterable archive (client-side filter + search)
  projects/[slug]/page.tsx   Project detail (SSG from Supabase, falls back to seed)
  writeups/page.tsx          Write-up index
  writeups/[slug]/page.tsx   Write-up detail (safe Markdown renderer)
  actions/contact.ts         Server Action: validate → sanitize → insert
  api/chat/route.ts          Streaming agent endpoint (createAgentUIStreamResponse)
  sitemap.ts, robots.ts, not-found.tsx

components/
  hud/            Hexagonal avatar badge, simulated telemetry, sparkline, ticker
  terminal/       Client-side emulator (history, suggestions, scroll commands)
  chat/           Floating streaming chat panel
  projects/       Filterable grid + card
  triage/         Radix-tabs triage lab with a step walker
  home/           Hero, kinetic roles, capability radar, contact dispatch
  writeups/       Dependency-free Markdown renderer
  ui/             Button, badge, section primitives (shadcn-style)

lib/
  supabase/{client,server}.ts   Browser (anon) + server (anon / service-role) clients
  queries.ts                    Server data layer with per-query fallback
  ai/{agent,tools,prompt}.ts    ToolLoopAgent, 4 read-only tools, system prompt
  security.ts                   Sanitisation, injection detection, rate limiting
  github.ts                     Cached public repo fetcher
  fallback-data.ts              Curated snapshot for offline/unconfigured builds
  soc-scenarios.ts              Static triage playbooks
  terminal-commands.ts          Pure command interpreter
  types.ts, utils.ts, env.ts

supabase/migrations/            SQL schema, RLS policies, seed data
```

**Data flow.** Server Components call `lib/queries.ts`, which talks to Supabase
through the anon key (RLS enforced) and falls back to the curated snapshot if the
query fails or credentials are missing. Mutations happen only in Server Actions.
The chat route validates and sanitises the request, then hands it to a
`ToolLoopAgent` whose four tools query the same tables server-side.

---

## 6. The AI agent

`app/api/chat/route.ts` → `lib/ai/agent.ts`:

```ts
new ToolLoopAgent({
  model: serverEnv.modelId,          // AI Gateway route, e.g. openai/gpt-4o-mini
  instructions: buildSystemPrompt(profile),
  tools: portfolioTools,
  temperature: 0.3,
});
```

Tools (`lib/ai/tools.ts`), all read-only:

| Tool | Purpose |
| --- | --- |
| `query_projects` | Keyword/category search over the project archive |
| `query_skills` | Proficiency lookup by category or keyword |
| `list_github_repos` | Live public repos + languages, cached 10 min in-process |
| `search_writeups` | Full-text-ish search across triage write-ups |

Each tool prefers Supabase and falls back to the seed snapshot, so the agent
still answers during a database hiccup. The response streams to the client with
`createAgentUIStreamResponse` and is consumed by `useChat` in the widget.

---

## 7. Design notes

- **Dark by default** (`smoky black` / `eerie black`) with a matrix-green accent,
  plus a three-way `next-themes` toggle (`dark` / `light` / `system`). All colours
  are CSS custom properties in `app/globals.css`, so light mode is a token swap.
- **Typography:** JetBrains Mono for headings, labels and code; Inter for body —
  both self-hosted through `@fontsource-variable` (no Google Fonts request).
- **Hero:** hexagonal avatar badge clipped by `clip-path` with a rotating dashed
  sweep ring and a pulsing status pill, over a simulated telemetry panel.
- **Motion:** `motion` for grid filtering and micro-interactions only; everything
  respects `prefers-reduced-motion` (animations collapse to a single frame).
- **Accessibility:** skip link, visible focus rings, ARIA labelling on every
  composite widget, `aria-live` regions for streaming output, and semantic
  headings.

---

## 8. Deployment workflow

```bash
# feature work
git switch -c feat/whatever
pnpm lint && pnpm typecheck && pnpm build
git commit -m "feat(projects): add category filter"
git push origin feat/whatever
```

`main` is connected to Vercel project `personal_portfolio`; every push to `main`
triggers a production deployment, and other branches get preview URLs.
`vercel.json` sets `pnpm build` as the build command and pins the region to
`sin1` (Singapore) for the Bangladesh-based owner.

**Do not** add `prisma migrate deploy`, `supabase db push`, or any other schema
mutation to the build command. Migrations are run manually (§3) before a push
that depends on them.

Conventional commit prefixes are used throughout: `feat:`, `fix:`, `chore:`,
`docs:`, `refactor:`.

---

## 9. Content updates

Everything editorial lives in Supabase — no deploys needed for content:

```sql
-- publish a new project
insert into public.projects (slug, title, description, tech_stack, category,
                             github_url, is_published, sort_order)
values ('new-lab', 'New Lab', 'What it does…', array['Wireshark','Python'],
        'Networking', 'https://github.com/mmadib-2003/new-lab', true, 110);

-- adjust a skill score (drives the radar immediately)
update public.skills set proficiency = 5 where name = 'Wireshark';

-- take something offline
update public.projects set is_published = false where slug = 'old-lab';
```

The only content kept in code is the four SOC triage drills
(`lib/soc-scenarios.ts`) — they are interactive reference playbooks rather than
editorial posts, and they ship as part of the bundle.

---

## 10. Contact intake

Messages submitted through the site land in `public.contact_messages`. To read
them, use the Supabase dashboard or a server-side query with the service role —
the anon key cannot select from that table by design.

```sql
select created_at, name, email, subject, left(message, 120)
from public.contact_messages
order by created_at desc
limit 50;
```

---

## License

Content and imagery © Muntasir Adib. Source available for reference; please do
not redeploy the personal content as your own portfolio.
