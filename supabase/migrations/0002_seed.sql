-- =============================================================================
--  Seed data — Muntasir Adib SOC portfolio
--  Migration: 0002_seed
--
--  Idempotent: every insert is keyed on a natural unique column and uses
--  upsert semantics, so re-running against a live database is safe.
--  Runs with elevated privileges (migrations), therefore is_published flags
--  are set explicitly here.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- profile facts
-- -----------------------------------------------------------------------------
insert into public.profile (key, value, label, is_public) values
  ('name', 'Muntasir Adib', 'Full name', true),
  ('role', 'Aspiring Cybersecurity Analyst', 'Headline role', true),
  ('bio_short',
   'Aspiring Cybersecurity Analyst focused on blue teaming, network traffic monitoring and triage workflows. Currently pursuing a B.Sc. in ICT at the Institute of Information Technology, Jahangirnagar University.',
   'Short bio', true),
  ('bio_long',
   E'Hi, I''m Muntasir Adib — an aspiring Cybersecurity Analyst.\n\nI am currently pursuing my B.Sc. in ICT at the Institute of Information Technology, Jahangirnagar University. My focus sits squarely on the defensive side of security: blue teaming, network traffic monitoring and end-to-end triage workflows.\n\nI practice through hands-on lab simulations, challenge write-ups and open-source tooling, all documented on GitHub. I am actively seeking an internship or entry-level SOC role where I can apply analytical problem-solving to real-world defensive operations.',
   'Long bio', true),
  ('focus_areas', 'SOC Operations, Threat Detection, Incident Response Fundamentals', 'Focus areas', true),
  ('location', 'Dhaka, Bangladesh', 'Location', true),
  ('email', 'mmadib2001@gmail.com', 'Email', true),
  ('phone', '+8801722194398', 'Phone / WhatsApp', true),
  ('whatsapp', '8801722194398', 'WhatsApp number', true),
  ('github_url', 'https://github.com/mmadib-2003', 'GitHub profile', true),
  ('linkedin_url', 'https://www.linkedin.com/in/muntasir-adib-947687233/', 'LinkedIn profile', true),
  ('resume_url', '/resume/muntasir-adib-resume.txt', 'Resume download', true),
  ('university', 'Institute of Information Technology, Jahangirnagar University', 'University', true),
  ('degree', 'B.Sc. in Information and Communication Technology (ICT)', 'Degree', true),
  ('availability', 'Open to SOC internships & entry-level blue team roles', 'Availability', true),
  ('github_username', 'mmadib-2003', 'GitHub username used by the AI agent', false)
on conflict (key) do update
  set value = excluded.value,
      label = excluded.label,
      is_public = excluded.is_public;

-- -----------------------------------------------------------------------------
-- skills  (proficiency 1-5, drives the capability radar)
-- -----------------------------------------------------------------------------
insert into public.skills (name, category, proficiency, notes, sort_order, is_published) values
  ('Linux Administration',        'Linux',           4, 'Daily driver: shell, systemd, permissions, log inspection.', 10, true),
  ('Bash Scripting',              'Linux',           3, 'Automation of repetitive triage and log-gathering tasks.',   20, true),
  ('Networking & Packet Analysis','Networking',      4, 'TCP/IP, DNS, HTTP; Wireshark and tcpdump capture triage.',   30, true),
  ('Wireshark',                   'Networking',      4, 'Protocol dissection, stream reassembly, IoC hunting.',       40, true),
  ('Nmap',                        'Networking',      3, 'Service/version discovery and network inventory.',           50, true),
  ('Python Scripting',           'Python',          4, 'Parsers, log enrichment, small defensive tooling.',          60, true),
  ('Log Parsing & Enrichment',   'Python',          3, 'Structuring raw telemetry into queryable events.',           70, true),
  ('Web Application Security',   'Web Security',    3, 'OWASP Top 10, request/response analysis, Burp Suite.',       80, true),
  ('Burp Suite',                 'Web Security',    3, 'Intercepting, repeating and fuzzing application traffic.',   90, true),
  ('SIEM Concepts',              'SOC Operations',  3, 'Alert triage, correlation logic, detection tuning basics.', 100, true),
  ('Incident Response Fundamentals','SOC Operations',3,'NIST-aligned IR lifecycle: identify, contain, eradicate.', 110, true),
  ('Threat Detection & Triage',  'SOC Operations',  3, 'Severity scoring, false-positive reduction, escalation.',   120, true),
  ('Git & Version Control',      'Tooling',         4, 'Branching, PR workflows, reproducible lab artifacts.',      130, true),
  ('Docker Basics',              'Tooling',         2, 'Containerised lab environments for repeatable tests.',      140, true),
  ('Splunk / ELK Basics',        'Tooling',         2, 'Search-time analysis of indexed security events.',          150, true)
on conflict (name, category) do update
  set proficiency = excluded.proficiency,
      notes = excluded.notes,
      sort_order = excluded.sort_order,
      is_published = excluded.is_published;

-- -----------------------------------------------------------------------------
-- projects
-- -----------------------------------------------------------------------------
insert into public.projects
  (slug, title, description, long_description, tech_stack, github_url, write_up_url, category, status, featured, is_published, sort_order)
values
  (
    'cybershield-mini-soc',
    'CyberShield — Mini SOC Detection Software',
    'A full-stack real-time security monitoring dashboard that simulates threats, scores risk, tracks incidents and streams live alerts to a single pane of glass.',
    E'CyberShield is a compact SOC-in-a-box: it generates synthetic security events, evaluates a risk score per event, opens and tracks incidents, and pushes live alerts to a centralised dashboard over a streaming channel.\n\nWhy it exists: I wanted a lab where I could rehearse the loop that real SOC analysts run every day — detect, score, correlate, escalate, document — without needing a production SIEM behind it.\n\nWhat I built:\n- An event pipeline that classifies activity into severity bands and derives a rolling risk score.\n- Incident lifecycle tracking so every escalation has an owner, a state and an audit trail.\n- A live alert feed streamed to the dashboard so triage decisions happen against fresh telemetry.\n\nWhat it demonstrates: detection engineering instincts, data-modelling discipline and the ability to wire a real-time pipeline end to end.',
    array['Next.js','TypeScript','Prisma','Real-time Streaming','Risk Scoring'],
    'https://github.com/mmadib-2003/Cybershield-mini-SOC-detection-software',
    null,
    'SOC',
    'shipped',
    true,
    true,
    100
  ),
  (
    'campus-360-bd',
    'Campus 360 BD — Activity Management Platform',
    'A smart campus activity management system with role-aware workflows, serving multiple universities from a single deployment.',
    E'Campus 360 BD coordinates campus activities end to end: discovery, registration, approvals and reporting.\n\nMy contribution centred on the platform engineering — typed data flows, permission boundaries and a UI that stays legible under real usage.\n\nThe security angle: building a multi-tenant, role-aware application forces you to think about authorisation boundaries the same way you think about trust boundaries in a network. That mindset transfers directly into access-control review during triage.',
    array['Next.js','TypeScript','Supabase','Tailwind CSS'],
    'https://github.com/mmadib-2003/Campus-360-BD',
    null,
    'Web Security',
    'shipped',
    true,
    true,
    90
  ),
  (
    'schedule-and-reminder',
    'Schedule & Reminder Application',
    'A calendar-centric time management application built on the scheduling concepts behind leading calendar tools.',
    E'A desktop application that models events, recurrence and reminders — built to understand how calendar products represent time.\n\nWorking in Java forced explicit modelling of recurrence rules and state transitions, which is the same discipline needed when normalising event data for correlation in a SIEM.',
    array['Java','OOP','Data Modelling'],
    'https://github.com/mmadib-2003/Schedule-and-Reminder-Application',
    null,
    'Scripting',
    'shipped',
    false,
    true,
    80
  ),
  (
    'packet-triage-lab',
    'Packet Triage Lab — PCAP → Verdict',
    'A repeatable Wireshark + Python workflow that turns a raw capture into a documented triage verdict: what happened, who was involved, what to escalate.',
    E'A lab discipline rather than a single tool: capture, filter, follow streams, extract indicators, enrich with Python, then write the verdict.\n\nThe workflow:\n1. Capture or ingest a PCAP and establish a baseline of expected conversations.\n2. Apply display filters to isolate anomalous flows (beaconing cadence, unusual ports, malformed DNS).\n3. Extract indicators with a small Python parser and enrich them against reputation data.\n4. Write a triage note with severity, evidence and recommended next action.\n\nEverything is versioned so the same capture can be re-run after a hypothesis changes.',
    array['Wireshark','Python','tcpdump','PCAP Analysis'],
    'https://github.com/mmadib-2003',
    null,
    'Networking',
    'in-progress',
    false,
    true,
    70
  ),
  (
    'log-enrichment-scripts',
    'Log Enrichment Scripts',
    'A growing set of Python helpers that normalise, parse and enrich raw logs into queryable events before they hit a SIEM.',
    E'Raw logs are noise. These scripts normalise timestamps, parse heterogeneous formats, tag events with context (asset criticality, geo, known-good baselines) and emit structured records ready for correlation.\n\nEach helper is deliberately small and testable — the goal is a library an analyst can trust at 3 a.m., not a monolith.',
    array['Python','Regex','JSON','Log Analysis'],
    'https://github.com/mmadib-2003',
    null,
    'Scripting',
    'in-progress',
    false,
    true,
    60
  ),
  (
    'web-sec-notes',
    'Web Application Security Notes',
    'Structured notes and reproducible labs covering the OWASP Top 10 with request/response evidence captured in Burp Suite.',
    E'For each OWASP category I keep a lab setup, a reproduction, the raw evidence, the fix and the detection idea.\n\nKeeping the detection idea alongside the exploit is the habit that makes an analyst useful: knowing how something breaks is only half the job — you also need to know what it looks like in telemetry.',
    array['Burp Suite','OWASP Top 10','HTTP','Reconnaissance'],
    'https://github.com/mmadib-2003',
    null,
    'Web Security',
    'in-progress',
    false,
    true,
    50
  )
on conflict (slug) do update
  set title = excluded.title,
      description = excluded.description,
      long_description = excluded.long_description,
      tech_stack = excluded.tech_stack,
      github_url = excluded.github_url,
      write_up_url = excluded.write_up_url,
      category = excluded.category,
      status = excluded.status,
      featured = excluded.featured,
      is_published = excluded.is_published,
      sort_order = excluded.sort_order;

-- -----------------------------------------------------------------------------
-- writeups
-- -----------------------------------------------------------------------------
insert into public.writeups
  (slug, title, summary, body_md, category, read_minutes, tags, is_published, published_at)
values
  (
    'ransomware-triage-playbook',
    'Ransomware Triage: First 15 Minutes',
    'The order of operations when mass file encryption is suspected — from preserving volatile evidence to isolating the host without destroying the timeline.',
    E'## Objective\nContain a suspected ransomware event without destroying the evidence needed to determine initial access.\n\n## 1. Confirm the signal, not the noise\nCheck for the classic tells simultaneously:\n- A burst of file rename/write events across a share.\n- A newly created persistence artifact (Run key, scheduled task, service).\n- Outbound connections to a host with no reputation history.\n\nOne symptom is a hypothesis. Two corroborating symptoms is an incident.\n\n## 2. Preserve volatile state first\nBefore isolating, capture what will evaporate:\n- Running processes and their parent chain.\n- Network connections (`netstat -anob` / `ss -tp`).\n- Recent authentication events for the affected account.\n\n## 3. Isolate, but keep the box alive\nNetwork-isolate the host rather than powering it off. Memory-resident keys and injected modules survive isolation but not a hard shutdown.\n\n## 4. Scope the blast radius\n- Which accounts authenticated to the host in the last 24h?\n- Which shares were writable from that account?\n- Is there a lateral movement pattern (SMB, RDP, WinRM) leaving the host?\n\n## 5. Escalate with a written verdict\nState severity, affected assets, evidence gathered, and the recommended next action. A triage note without a recommendation is an unfinished task.',
    'Triage',
    7,
    array['ransomware','incident-response','containment','evidence'],
    true,
    now() - interval '3 days'
  ),
  (
    'beaconing-detection-analysis',
    'Hunting Beaconing Patterns in Packet Captures',
    'How to separate real C2 beaconing from chatty applications using inter-arrival variance, packet size consistency and destination reputation.',
    E'## The problem\nPeriodic outbound traffic is everywhere — updates, telemetry, sync clients. Real beaconing is periodic *and* regular in size, destination and payload shape.\n\n## Signals that matter\n1. **Inter-arrival time.** Compute the standard deviation of the gap between connections. Beaconing has a tight distribution with jitter applied on top; user traffic does not.\n2. **Packet size.** C2 check-ins are small and similar. Compare the coefficient of variation across connections.\n3. **Destination reputation.** Newly registered domains and IPs with no history score higher.\n4. **Absence of referrer/SNI coherence.** A request claiming to be an update server rarely behaves like one.\n\n## Method\n- Extract conversations from the PCAP, group by destination.\n- For each group compute count, mean interval, stdev, and size variance.\n- Rank by (low size variance) x (tight interval) x (poor reputation).\n- Validate the top candidate by following the TCP stream and reading the payload.\n\n## False positives to expect\nBrowser prefetch, NTP, and any application with a fixed poll interval. Confirm before escalating — a good analyst closes a ticket correctly, not noisily.',
    'Detection',
    8,
    array['beaconing','c2','wireshark','detection-engineering'],
    true,
    now() - interval '9 days'
  ),
  (
    'dns-tunnelling-triage',
    'DNS Tunnelling: A Triage Walkthrough',
    'Recognising data exfiltration over DNS by volume, entropy and query-name structure — then containing it without breaking resolution.',
    E'## What tunnelling looks like\n- Long, high-entropy subdomains in front of a single registered domain.\n- A high volume of TXT or NULL queries.\n- Query patterns from one host that no peer host exhibits.\n\n## Triage order\n1. Baseline the resolver: which domains see heavy traffic normally?\n2. Identify hosts whose query count is an outlier by orders of magnitude.\n3. Inspect query-name entropy — encoded payloads are not pronounceable.\n4. Correlate with the process that made the query, not just the host.\n\n## Containment\nBlock the authoritative nameserver at egress, keep resolution for everything else, and preserve resolver logs for the timeline. Blocking the whole domain family is a last resort because it often breaks legitimate SaaS tenants.\n\n## Verdict template\nSeverity, host, indicator, volume, data-at-risk estimate, containment applied, follow-up required.',
    'Networking',
    6,
    array['dns','exfiltration','triage','network-security'],
    true,
    now() - interval '16 days'
  ),
  (
    'phishing-triage-ladder',
    'Phishing Triage Ladder',
    'A five-rung decision ladder for reported phishing mail: from header forensics to credential-harvest confirmation and tenant sweep.',
    E'## Rung 1 — Authentication results\nRead `Authentication-Results` first: SPF, DKIM, DMARC. Three passes on a suspicious mail means you look deeper before you block.\n\n## Rung 2 — Header anomaly\nReply-To divergence, mismatched Return-Path, unusual `Received` chain, first-hop IP reputation.\n\n## Rung 3 — Content intent\nCredential harvesting, invoice fraud, QR-code redirection, attachment macro. Intent determines urgency, not the sender domain.\n\n## Rung 4 — Interaction evidence\nDid anyone click? Did anyone submit? Check proxy and identity logs, not just the mail gateway.\n\n## Rung 5 — Tenant sweep\nSearch for the same subject, sender or URL across all mailboxes and quarantine in bulk.\n\n## Common mistake\nStopping at rung 1. A campaign that fails DMARC today can pass tomorrow with a freshly warmed domain.',
    'Triage',
    5,
    array['phishing','email-security','soc','playbook'],
    true,
    now() - interval '24 days'
  )
on conflict (slug) do update
  set title = excluded.title,
      summary = excluded.summary,
      body_md = excluded.body_md,
      category = excluded.category,
      read_minutes = excluded.read_minutes,
      tags = excluded.tags,
      is_published = excluded.is_published;
