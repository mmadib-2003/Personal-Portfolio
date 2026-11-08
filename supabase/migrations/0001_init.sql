-- =============================================================================
--  Muntasir Adib — SOC Portfolio : initial schema
--  Migration: 0001_init
--
--  Security model
--  --------------
--  * RLS is ENABLED (and force-applied) on every table in the schema.
--  * The `anon` role may only SELECT rows that are explicitly published.
--  * The `service_role` (server-only) bypasses RLS for ingestion/AI tooling.
--  * No INSERT/UPDATE/DELETE policy exists for anon/authenticated: the public
--    surface is strictly read-only.
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'project_category') then
    create type public.project_category as enum (
      'SOC',
      'Networking',
      'Scripting',
      'Web Security',
      'Systems'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'skill_category') then
    create type public.skill_category as enum (
      'Linux',
      'Networking',
      'Python',
      'Web Security',
      'SOC Operations',
      'Tooling'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'writeup_category') then
    create type public.writeup_category as enum (
      'Triage',
      'Detection',
      'Networking',
      'Web Security',
      'Lab Notes'
    );
  end if;
end
$$;

-- -----------------------------------------------------------------------------
-- Shared trigger: keep updated_at honest
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- projects
-- -----------------------------------------------------------------------------
create table if not exists public.projects (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null check (char_length(title) between 1 and 160),
  description   text not null check (char_length(description) between 1 and 4000),
  long_description text,
  tech_stack    text[] not null default '{}',
  github_url    text,
  write_up_url  text,
  category      public.project_category not null default 'SOC',
  status        text not null default 'shipped'
                  check (status in ('shipped', 'in-progress', 'archived')),
  featured      boolean not null default false,
  is_published  boolean not null default false,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint projects_github_url_https
    check (github_url is null or github_url ~* '^https://'),
  constraint projects_write_up_url_https
    check (write_up_url is null or write_up_url ~* '^https://')
);

comment on table public.projects is
  'Portfolio projects. Public read is restricted to published rows via RLS.';

create index if not exists projects_category_idx on public.projects (category);
create index if not exists projects_published_sort_idx
  on public.projects (is_published, sort_order desc, created_at desc);

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- skills
-- -----------------------------------------------------------------------------
create table if not exists public.skills (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 80),
  category    public.skill_category not null,
  proficiency integer not null check (proficiency between 1 and 5),
  notes       text,
  sort_order  integer not null default 0,
  is_published boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (name, category)
);

comment on table public.skills is
  'Capability radar source data (1-5 proficiency). Public read for published rows only.';

create index if not exists skills_category_idx on public.skills (category);

drop trigger if exists skills_set_updated_at on public.skills;
create trigger skills_set_updated_at
  before update on public.skills
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- profile  (key/value, public-safe facts only)
-- -----------------------------------------------------------------------------
create table if not exists public.profile (
  id         uuid primary key default gen_random_uuid(),
  key        text not null unique check (key ~ '^[a-z0-9_.-]{2,64}$'),
  value      text not null,
  label      text,
  is_public  boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profile is
  'Single source of truth for bio, contact links, resume URL. Public read for is_public rows.';

drop trigger if exists profile_set_updated_at on public.profile;
create trigger profile_set_updated_at
  before update on public.profile
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- writeups
-- -----------------------------------------------------------------------------
create table if not exists public.writeups (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null check (char_length(title) between 1 and 200),
  summary       text not null check (char_length(summary) between 1 and 600),
  body_md       text not null,
  category      public.writeup_category not null default 'Triage',
  read_minutes  integer not null default 5 check (read_minutes between 1 and 120),
  tags          text[] not null default '{}',
  is_published  boolean not null default false,
  published_at  timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.writeups is
  'SOC triage write-ups / lab notes rendered on the site. Public read for published rows.';

create index if not exists writeups_published_idx
  on public.writeups (is_published, published_at desc);

drop trigger if exists writeups_set_updated_at on public.writeups;
create trigger writeups_set_updated_at
  before update on public.writeups
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- contact_messages  (write-only from the public site)
-- -----------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 2 and 120),
  email      text not null check (char_length(email) between 5 and 254),
  subject    text check (subject is null or char_length(subject) <= 160),
  message    text not null check (char_length(message) between 10 and 4000),
  user_agent text,
  created_at timestamptz not null default now()
);

comment on table public.contact_messages is
  'Inbound recruiter messages. INSERT-only for anon; rows are never readable publicly.';

create index if not exists contact_messages_created_idx
  on public.contact_messages (created_at desc);

-- =============================================================================
--  Row Level Security
-- =============================================================================

alter table public.projects          enable row level security;
alter table public.skills            enable row level security;
alter table public.profile           enable row level security;
alter table public.writeups          enable row level security;
alter table public.contact_messages  enable row level security;

-- Belt-and-braces: force RLS even for table owners.
alter table public.projects          force row level security;
alter table public.skills            force row level security;
alter table public.profile           force row level security;
alter table public.writeups          force row level security;
alter table public.contact_messages  force row level security;

-- Drop-then-create keeps the migration idempotent.
drop policy if exists "Public can read published projects" on public.projects;
create policy "Public can read published projects"
  on public.projects
  for select
  to anon, authenticated
  using (is_published = true);

drop policy if exists "Public can read published skills" on public.skills;
create policy "Public can read published skills"
  on public.skills
  for select
  to anon, authenticated
  using (is_published = true);

drop policy if exists "Public can read public profile facts" on public.profile;
create policy "Public can read public profile facts"
  on public.profile
  for select
  to anon, authenticated
  using (is_public = true);

drop policy if exists "Public can read published writeups" on public.writeups;
create policy "Public can read published writeups"
  on public.writeups
  for select
  to anon, authenticated
  using (is_published = true);

drop policy if exists "Public can submit a contact message" on public.contact_messages;
create policy "Public can submit a contact message"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (true);

-- No SELECT policy on contact_messages => anon can write but never read back.

-- -----------------------------------------------------------------------------
-- Grants: explicit minimalist surface
-- -----------------------------------------------------------------------------
revoke all on public.contact_messages from anon, authenticated;
grant insert on public.contact_messages to anon, authenticated;

revoke all on public.projects from anon, authenticated;
grant select on public.projects to anon, authenticated;

revoke all on public.skills from anon, authenticated;
grant select on public.skills to anon, authenticated;

revoke all on public.profile from anon, authenticated;
grant select on public.profile to anon, authenticated;

revoke all on public.writeups from anon, authenticated;
grant select on public.writeups to anon, authenticated;

grant all on public.projects to service_role;
grant all on public.skills to service_role;
grant all on public.profile to service_role;
grant all on public.writeups to service_role;
grant all on public.contact_messages to service_role;

-- -----------------------------------------------------------------------------
-- Convenience view used by the AI agent: a compact, safe project digest
-- -----------------------------------------------------------------------------
create or replace view public.project_digest
with (security_invoker = true)
as
select
  p.slug,
  p.title,
  p.category::text as category,
  p.description,
  p.tech_stack,
  p.github_url,
  p.status,
  p.created_at
from public.projects p
where p.is_published = true;

grant select on public.project_digest to anon, authenticated, service_role;
