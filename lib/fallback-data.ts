import type {
  PortfolioProfile,
  ProfileFact,
  Project,
  RadarAxis,
  Skill,
  SkillCategory,
  Writeup,
  WriteupSummary,
} from "@/lib/types";
import { SKILL_CATEGORIES } from "@/lib/types";

/**
 * Canonical, code-level fallback content.
 *
 * The live site reads from Supabase. If the database is unreachable (or the
 * env vars are not set in a fresh checkout) the UI renders this curated
 * snapshot rather than an empty page, so the portfolio is never broken.
 *
 * Keep this in sync with `supabase/migrations/0002_seed.sql`.
 */

export const FALLBACK_PROFILE: PortfolioProfile = {
  name: "Muntasir Adib",
  role: "Aspiring Cybersecurity Analyst",
  bioShort:
    "Aspiring Cybersecurity Analyst focused on blue teaming, network traffic monitoring and triage workflows. Currently pursuing a B.Sc. in ICT at the Institute of Information Technology, Jahangirnagar University.",
  bioLong:
    "Hi, I'm Muntasir Adib — an aspiring Cybersecurity Analyst.\n\nI am currently pursuing my B.Sc. in ICT at the Institute of Information Technology, Jahangirnagar University. My focus sits squarely on the defensive side of security: blue teaming, network traffic monitoring and end-to-end triage workflows.\n\nI practice through hands-on lab simulations, challenge write-ups and open-source tooling, all documented on GitHub. I am actively seeking an internship or entry-level SOC role where I can apply analytical problem-solving to real-world defensive operations.",
  focusAreas: [
    "SOC Operations",
    "Threat Detection",
    "Incident Response Fundamentals",
  ],
  location: "Dhaka, Bangladesh",
  email: "mmadib2001@gmail.com",
  phone: "+8801722194398",
  whatsapp: "8801722194398",
  githubUrl: "https://github.com/mmadib-2003",
  linkedinUrl: "https://www.linkedin.com/in/muntasir-adib-947687233/",
  resumeUrl: "/resume/muntasir-adib-resume.txt",
  university: "Institute of Information Technology, Jahangirnagar University",
  degree: "B.Sc. in Information and Communication Technology (ICT)",
  availability: "Open to SOC internships & entry-level blue team roles",
  githubUsername: "mmadib-2003",
};

export const FALLBACK_PROFILE_FACTS: ProfileFact[] = [
  { key: "name", value: FALLBACK_PROFILE.name, label: "Full name" },
  { key: "role", value: FALLBACK_PROFILE.role, label: "Headline role" },
  { key: "bio_short", value: FALLBACK_PROFILE.bioShort, label: "Short bio" },
  { key: "bio_long", value: FALLBACK_PROFILE.bioLong, label: "Long bio" },
  {
    key: "focus_areas",
    value: FALLBACK_PROFILE.focusAreas.join(", "),
    label: "Focus areas",
  },
  { key: "location", value: FALLBACK_PROFILE.location, label: "Location" },
  { key: "email", value: FALLBACK_PROFILE.email, label: "Email" },
  { key: "phone", value: FALLBACK_PROFILE.phone, label: "Phone / WhatsApp" },
  { key: "whatsapp", value: FALLBACK_PROFILE.whatsapp, label: "WhatsApp" },
  { key: "github_url", value: FALLBACK_PROFILE.githubUrl, label: "GitHub" },
  { key: "linkedin_url", value: FALLBACK_PROFILE.linkedinUrl, label: "LinkedIn" },
  { key: "resume_url", value: FALLBACK_PROFILE.resumeUrl, label: "Resume" },
  { key: "university", value: FALLBACK_PROFILE.university, label: "University" },
  { key: "degree", value: FALLBACK_PROFILE.degree, label: "Degree" },
  {
    key: "availability",
    value: FALLBACK_PROFILE.availability,
    label: "Availability",
  },
];

const now = Date.parse("2026-11-01T00:00:00.000Z");

function iso(daysAgo: number): string {
  return new Date(now - daysAgo * 86_400_000).toISOString();
}

export const FALLBACK_PROJECTS: Project[] = [
  {
    id: "p1",
    slug: "cybershield-mini-soc",
    title: "CyberShield — Mini SOC Detection Software",
    description:
      "A full-stack real-time security monitoring dashboard that simulates threats, scores risk, tracks incidents and streams live alerts to a single pane of glass.",
    long_description:
      "CyberShield is a compact SOC-in-a-box: it generates synthetic security events, evaluates a risk score per event, opens and tracks incidents, and pushes live alerts to a centralised dashboard over a streaming channel.\n\nWhy it exists: I wanted a lab where I could rehearse the loop that real SOC analysts run every day — detect, score, correlate, escalate, document — without needing a production SIEM behind it.\n\nWhat I built:\n- An event pipeline that classifies activity into severity bands and derives a rolling risk score.\n- Incident lifecycle tracking so every escalation has an owner, a state and an audit trail.\n- A live alert feed streamed to the dashboard so triage decisions happen against fresh telemetry.\n\nWhat it demonstrates: detection engineering instincts, data-modelling discipline and the ability to wire a real-time pipeline end to end.",
    tech_stack: ["Next.js", "TypeScript", "Prisma", "Real-time Streaming", "Risk Scoring"],
    github_url:
      "https://github.com/mmadib-2003/Cybershield-mini-SOC-detection-software",
    write_up_url: null,
    category: "SOC",
    status: "shipped",
    featured: true,
    sort_order: 100,
    created_at: iso(30),
  },
  {
    id: "p2",
    slug: "campus-360-bd",
    title: "Campus 360 BD — Activity Management Platform",
    description:
      "A smart campus activity management system with role-aware workflows, serving multiple universities from a single deployment.",
    long_description:
      "Campus 360 BD coordinates campus activities end to end: discovery, registration, approvals and reporting.\n\nMy contribution centred on the platform engineering — typed data flows, permission boundaries and a UI that stays legible under real usage.\n\nThe security angle: building a multi-tenant, role-aware application forces you to think about authorisation boundaries the same way you think about trust boundaries in a network. That mindset transfers directly into access-control review during triage.",
    tech_stack: ["Next.js", "TypeScript", "Supabase", "Tailwind CSS"],
    github_url: "https://github.com/mmadib-2003/Campus-360-BD",
    write_up_url: null,
    category: "Web Security",
    status: "shipped",
    featured: true,
    sort_order: 90,
    created_at: iso(52),
  },
  {
    id: "p3",
    slug: "schedule-and-reminder",
    title: "Schedule & Reminder Application",
    description:
      "A calendar-centric time management application built on the scheduling concepts behind leading calendar tools.",
    long_description:
      "A desktop application that models events, recurrence and reminders — built to understand how calendar products represent time.\n\nWorking in Java forced explicit modelling of recurrence rules and state transitions, which is the same discipline needed when normalising event data for correlation in a SIEM.",
    tech_stack: ["Java", "OOP", "Data Modelling"],
    github_url:
      "https://github.com/mmadib-2003/Schedule-and-Reminder-Application",
    write_up_url: null,
    category: "Scripting",
    status: "shipped",
    featured: false,
    sort_order: 80,
    created_at: iso(74),
  },
  {
    id: "p4",
    slug: "packet-triage-lab",
    title: "Packet Triage Lab — PCAP → Verdict",
    description:
      "A repeatable Wireshark + Python workflow that turns a raw capture into a documented triage verdict: what happened, who was involved, what to escalate.",
    long_description:
      "A lab discipline rather than a single tool: capture, filter, follow streams, extract indicators, enrich with Python, then write the verdict.\n\nThe workflow:\n1. Capture or ingest a PCAP and establish a baseline of expected conversations.\n2. Apply display filters to isolate anomalous flows (beaconing cadence, unusual ports, malformed DNS).\n3. Extract indicators with a small Python parser and enrich them against reputation data.\n4. Write a triage note with severity, evidence and recommended next action.\n\nEverything is versioned so the same capture can be re-run after a hypothesis changes.",
    tech_stack: ["Wireshark", "Python", "tcpdump", "PCAP Analysis"],
    github_url: "https://github.com/mmadib-2003",
    write_up_url: null,
    category: "Networking",
    status: "in-progress",
    featured: false,
    sort_order: 70,
    created_at: iso(88),
  },
  {
    id: "p5",
    slug: "log-enrichment-scripts",
    title: "Log Enrichment Scripts",
    description:
      "A growing set of Python helpers that normalise, parse and enrich raw logs into queryable events before they hit a SIEM.",
    long_description:
      "Raw logs are noise. These scripts normalise timestamps, parse heterogeneous formats, tag events with context (asset criticality, geo, known-good baselines) and emit structured records ready for correlation.\n\nEach helper is deliberately small and testable — the goal is a library an analyst can trust at 3 a.m., not a monolith.",
    tech_stack: ["Python", "Regex", "JSON", "Log Analysis"],
    github_url: "https://github.com/mmadib-2003",
    write_up_url: null,
    category: "Scripting",
    status: "in-progress",
    featured: false,
    sort_order: 60,
    created_at: iso(96),
  },
  {
    id: "p6",
    slug: "web-sec-notes",
    title: "Web Application Security Notes",
    description:
      "Structured notes and reproducible labs covering the OWASP Top 10 with request/response evidence captured in Burp Suite.",
    long_description:
      "For each OWASP category I keep a lab setup, a reproduction, the raw evidence, the fix and the detection idea.\n\nKeeping the detection idea alongside the exploit is the habit that makes an analyst useful: knowing how something breaks is only half the job — you also need to know what it looks like in telemetry.",
    tech_stack: ["Burp Suite", "OWASP Top 10", "HTTP", "Reconnaissance"],
    github_url: "https://github.com/mmadib-2003",
    write_up_url: null,
    category: "Web Security",
    status: "in-progress",
    featured: false,
    sort_order: 50,
    created_at: iso(110),
  },
];

type SeedSkill = [name: string, category: SkillCategory, proficiency: number, notes: string];

const SEED_SKILL_ROWS: SeedSkill[] = [
  ["Linux Administration", "Linux", 4, "Daily driver: shell, systemd, permissions, log inspection."],
  ["Bash Scripting", "Linux", 3, "Automation of repetitive triage and log-gathering tasks."],
  ["Networking & Packet Analysis", "Networking", 4, "TCP/IP, DNS, HTTP; Wireshark and tcpdump capture triage."],
  ["Wireshark", "Networking", 4, "Protocol dissection, stream reassembly, IoC hunting."],
  ["Nmap", "Networking", 3, "Service/version discovery and network inventory."],
  ["Python Scripting", "Python", 4, "Parsers, log enrichment, small defensive tooling."],
  ["Log Parsing & Enrichment", "Python", 3, "Structuring raw telemetry into queryable events."],
  ["Web Application Security", "Web Security", 3, "OWASP Top 10, request/response analysis, Burp Suite."],
  ["Burp Suite", "Web Security", 3, "Intercepting, repeating and fuzzing application traffic."],
  ["SIEM Concepts", "SOC Operations", 3, "Alert triage, correlation logic, detection tuning basics."],
  ["Incident Response Fundamentals", "SOC Operations", 3, "NIST-aligned IR lifecycle: identify, contain, eradicate."],
  ["Threat Detection & Triage", "SOC Operations", 3, "Severity scoring, false-positive reduction, escalation."],
  ["Git & Version Control", "Tooling", 4, "Branching, PR workflows, reproducible lab artifacts."],
  ["Docker Basics", "Tooling", 2, "Containerised lab environments for repeatable tests."],
  ["Splunk / ELK Basics", "Tooling", 2, "Search-time analysis of indexed security events."],
];

export const FALLBACK_SKILLS: Skill[] = SEED_SKILL_ROWS.map(
  ([name, category, proficiency, notes], index) => ({
    id: `s${index + 1}`,
    name,
    category,
    proficiency,
    notes,
    sort_order: (index + 1) * 10,
  }),
);

export function buildRadarAxes(skills: Skill[]): RadarAxis[] {
  return SKILL_CATEGORIES.map((category) => {
    const categorySkills = skills.filter((s) => s.category === category);
    const count = categorySkills.length;
    const score =
      count === 0
        ? 0
        : categorySkills.reduce((sum, s) => sum + s.proficiency, 0) / count;
    return {
      category,
      score: Math.round(score * 10) / 10,
      count,
      skills: categorySkills.sort((a, b) => b.proficiency - a.proficiency),
    };
  });
}

export const FALLBACK_WRITEUPS: Writeup[] = [
  {
    slug: "ransomware-triage-playbook",
    title: "Ransomware Triage: First 15 Minutes",
    summary:
      "The order of operations when mass file encryption is suspected — from preserving volatile evidence to isolating the host without destroying the timeline.",
    category: "Triage",
    read_minutes: 7,
    tags: ["ransomware", "incident-response", "containment", "evidence"],
    published_at: iso(3),
    body_md:
      "## Objective\nContain a suspected ransomware event without destroying the evidence needed to determine initial access.\n\n## 1. Confirm the signal, not the noise\nCheck for the classic tells simultaneously:\n- A burst of file rename/write events across a share.\n- A newly created persistence artifact (Run key, scheduled task, service).\n- Outbound connections to a host with no reputation history.\n\nOne symptom is a hypothesis. Two corroborating symptoms is an incident.\n\n## 2. Preserve volatile state first\nBefore isolating, capture what will evaporate:\n- Running processes and their parent chain.\n- Network connections (`netstat -anob` / `ss -tp`).\n- Recent authentication events for the affected account.\n\n## 3. Isolate, but keep the box alive\nNetwork-isolate the host rather than powering it off. Memory-resident keys and injected modules survive isolation but not a hard shutdown.\n\n## 4. Scope the blast radius\n- Which accounts authenticated to the host in the last 24h?\n- Which shares were writable from that account?\n- Is there a lateral movement pattern (SMB, RDP, WinRM) leaving the host?\n\n## 5. Escalate with a written verdict\nState severity, affected assets, evidence gathered, and the recommended next action. A triage note without a recommendation is an unfinished task.",
  },
  {
    slug: "beaconing-detection-analysis",
    title: "Hunting Beaconing Patterns in Packet Captures",
    summary:
      "How to separate real C2 beaconing from chatty applications using inter-arrival variance, packet size consistency and destination reputation.",
    category: "Detection",
    read_minutes: 8,
    tags: ["beaconing", "c2", "wireshark", "detection-engineering"],
    published_at: iso(9),
    body_md:
      "## The problem\nPeriodic outbound traffic is everywhere — updates, telemetry, sync clients. Real beaconing is periodic *and* regular in size, destination and payload shape.\n\n## Signals that matter\n1. **Inter-arrival time.** Compute the standard deviation of the gap between connections. Beaconing has a tight distribution with jitter applied on top; user traffic does not.\n2. **Packet size.** C2 check-ins are small and similar. Compare the coefficient of variation across connections.\n3. **Destination reputation.** Newly registered domains and IPs with no history score higher.\n4. **Absence of referrer/SNI coherence.** A request claiming to be an update server rarely behaves like one.\n\n## Method\n- Extract conversations from the PCAP, group by destination.\n- For each group compute count, mean interval, stdev, and size variance.\n- Rank by (low size variance) x (tight interval) x (poor reputation).\n- Validate the top candidate by following the TCP stream and reading the payload.\n\n## False positives to expect\nBrowser prefetch, NTP, and any application with a fixed poll interval. Confirm before escalating — a good analyst closes a ticket correctly, not noisily.",
  },
  {
    slug: "dns-tunnelling-triage",
    title: "DNS Tunnelling: A Triage Walkthrough",
    summary:
      "Recognising data exfiltration over DNS by volume, entropy and query-name structure — then containing it without breaking resolution.",
    category: "Networking",
    read_minutes: 6,
    tags: ["dns", "exfiltration", "triage", "network-security"],
    published_at: iso(16),
    body_md:
      "## What tunnelling looks like\n- Long, high-entropy subdomains in front of a single registered domain.\n- A high volume of TXT or NULL queries.\n- Query patterns from one host that no peer host exhibits.\n\n## Triage order\n1. Baseline the resolver: which domains see heavy traffic normally?\n2. Identify hosts whose query count is an outlier by orders of magnitude.\n3. Inspect query-name entropy — encoded payloads are not pronounceable.\n4. Correlate with the process that made the query, not just the host.\n\n## Containment\nBlock the authoritative nameserver at egress, keep resolution for everything else, and preserve resolver logs for the timeline. Blocking the whole domain family is a last resort because it often breaks legitimate SaaS tenants.\n\n## Verdict template\nSeverity, host, indicator, volume, data-at-risk estimate, containment applied, follow-up required.",
  },
  {
    slug: "phishing-triage-ladder",
    title: "Phishing Triage Ladder",
    summary:
      "A five-rung decision ladder for reported phishing mail: from header forensics to credential-harvest confirmation and tenant sweep.",
    category: "Triage",
    read_minutes: 5,
    tags: ["phishing", "email-security", "soc", "playbook"],
    published_at: iso(24),
    body_md:
      "## Rung 1 — Authentication results\nRead `Authentication-Results` first: SPF, DKIM, DMARC. Three passes on a suspicious mail means you look deeper before you block.\n\n## Rung 2 — Header anomaly\nReply-To divergence, mismatched Return-Path, unusual `Received` chain, first-hop IP reputation.\n\n## Rung 3 — Content intent\nCredential harvesting, invoice fraud, QR-code redirection, attachment macro. Intent determines urgency, not the sender domain.\n\n## Rung 4 — Interaction evidence\nDid anyone click? Did anyone submit? Check proxy and identity logs, not just the mail gateway.\n\n## Rung 5 — Tenant sweep\nSearch for the same subject, sender or URL across all mailboxes and quarantine in bulk.\n\n## Common mistake\nStopping at rung 1. A campaign that fails DMARC today can pass tomorrow with a freshly warmed domain.",
  },
];

export const FALLBACK_WRITEUP_SUMMARIES: WriteupSummary[] =
  FALLBACK_WRITEUPS.map((writeup) => ({
    slug: writeup.slug,
    title: writeup.title,
    summary: writeup.summary,
    category: writeup.category,
    read_minutes: writeup.read_minutes,
    tags: writeup.tags,
    published_at: writeup.published_at,
  }));
