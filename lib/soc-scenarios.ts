import type { SocScenario } from "@/lib/types";

/**
 * Static SOC triage drills. These are deliberately static (not in Supabase):
 * they are reference playbooks authored in code, while the database holds the
 * editorial content (projects, skills, write-ups, profile facts).
 */
export const SOC_SCENARIOS: SocScenario[] = [
  {
    id: "ransomware-triage",
    title: "Ransomware Triage Playbook",
    severity: "critical",
    signal:
      "EDR flags 2,400 file rename events in 90 seconds on a shared drive, plus a new Run-key entry on the originating workstation.",
    mttr: "15 min",
    summary:
      "A suspected encryption event is unfolding. The priority is to preserve volatile evidence, contain the host without destroying the timeline, and scope how far the account spread before escalation.",
    tools: ["EDR console", "netstat / ss", "Sysinternals", "Identity logs"],
    steps: [
      {
        order: 1,
        title: "Corroborate the signal",
        detail:
          "Confirm at least two independent symptoms — mass file writes, new persistence, and an unknown outbound connection. One symptom is a hypothesis; two is an incident.",
        artifact: "Alert timeline with matched rule IDs",
      },
      {
        order: 2,
        title: "Preserve volatile state",
        detail:
          "Before isolating, capture the process tree with parent chain, active network connections, and recently loaded modules. This data evaporates on reboot.",
        artifact: "process-tree.txt + connections.txt",
      },
      {
        order: 3,
        title: "Network-isolate, don't power off",
        detail:
          "Isolation keeps memory-resident artefacts intact. A hard shutdown destroys the encryption key material that later suggests which family was used.",
        artifact: "Isolation ticket + timestamp",
      },
      {
        order: 4,
        title: "Scope the blast radius",
        detail:
          "Enumerate accounts that authenticated to the host in the last 24 hours, writable shares reachable from that identity, and any lateral movement protocols leaving the host.",
        artifact: "Affected-asset list with auth evidence",
      },
      {
        order: 5,
        title: "Write the verdict and escalate",
        detail:
          "State severity, affected assets, evidence gathered and the recommended next action. A triage note without a recommendation is an unfinished task.",
        artifact: "Escalation note (severity P1)",
      },
    ],
    verdict:
      "Escalate to P1 immediately when two hosts or a file server are affected. Contain first, communicate second, root-cause third.",
  },
  {
    id: "beaconing-hunt",
    title: "Suspicious Beaconing Hunt",
    severity: "high",
    signal:
      "A workstation makes an HTTPS request to the same /api/v2/ping endpoint every 61 seconds (±3s) with a constant 412-byte request body.",
    mttr: "30 min",
    summary:
      "Periodic traffic is normal; periodic and *uniform* traffic is not. This drill separates genuine C2 beaconing from chatty legitimate clients using interval variance and payload consistency.",
    tools: ["Wireshark", "Zeek conn.log", "Proxy logs", "Threat intel"],
    steps: [
      {
        order: 1,
        title: "Extract conversation statistics",
        detail:
          "Group traffic by destination and compute count, mean inter-arrival time, standard deviation and payload size variance for each group.",
        artifact: "Conversation stats table",
      },
      {
        order: 2,
        title: "Rank by suspiciousness",
        detail:
          "Score candidates on tight interval distribution × low size variance × poor destination reputation. Beaconing with jitter still shows a far tighter distribution than human traffic.",
        artifact: "Ranked candidate list",
      },
      {
        order: 3,
        title: "Validate the candidate",
        detail:
          "Follow the TCP stream. Check SNI/Host coherence, user-agent plausibility, and whether the destination has any business relationship with the asset owner.",
        artifact: "TCP stream capture",
      },
      {
        order: 4,
        title: "Determine the executing process",
        detail:
          "Correlate the connection timestamp with process creation events on the host. The destination matters less than the binary that reached it.",
        artifact: "Process attribution note",
      },
    ],
    verdict:
      "Escalate when a non-browser process owns the connection. Block at egress only after capturing the stream — blocking too early blinds the evidence.",
  },
  {
    id: "phishing-report",
    title: "Reported Phishing Email",
    severity: "medium",
    signal:
      "Two employees forward the same 'invoice overdue' email. SPF passes, DKIM passes, domain is 6 days old.",
    mttr: "20 min",
    summary:
      "Authentication passing does not mean benign. This drill follows the five-rung ladder from header forensics to a tenant-wide sweep.",
    tools: ["Mail gateway", "Header analyser", "Proxy logs", "Identity logs"],
    steps: [
      {
        order: 1,
        title: "Read authentication results",
        detail:
          "SPF/DKIM/DMARC outcomes plus the full Received chain. Note the first hop and whether the sending IP aligns with the claimed domain.",
        artifact: "Header extract with auth verdicts",
      },
      {
        order: 2,
        title: "Check for structural anomalies",
        detail:
          "Reply-To divergence, mismatched Return-Path, and recently registered lookalike domains are the highest-signal tells.",
        artifact: "Anomaly checklist",
      },
      {
        order: 3,
        title: "Classify intent",
        detail:
          "Credential harvesting, payment redirection, QR-code evasion or attachment payload. Intent sets urgency, not the sender's reputation.",
        artifact: "Intent classification",
      },
      {
        order: 4,
        title: "Check interaction evidence",
        detail:
          "Did anyone click? Did anyone submit credentials? Query proxy and identity logs, not just the mail gateway.",
        artifact: "Interaction query results",
      },
      {
        order: 5,
        title: "Sweep the tenant",
        detail:
          "Search for the sender, subject and URL across all mailboxes, then quarantine in bulk and block the URL at the proxy.",
        artifact: "Quarantine + block record",
      },
    ],
    verdict:
      "Escalate to high the moment a credential submission is confirmed — that converts a phishing report into an account-takeover investigation.",
  },
  {
    id: "dns-tunnelling",
    title: "DNS Tunnelling Exfiltration",
    severity: "high",
    signal:
      "One host issues 14,000 TXT queries in an hour to random-looking subdomains under a single registered domain.",
    mttr: "25 min",
    summary:
      "Encoded payloads carried over DNS are invisible to most egress filters. The drill triages volume, entropy and query structure, then contains without breaking resolution for everyone else.",
    tools: ["Resolver logs", "passivedns", "Python", "Reputation feeds"],
    steps: [
      {
        order: 1,
        title: "Baseline normal resolver behaviour",
        detail:
          "Establish which domains and hosts normally dominate query volume so the outlier is measured, not guessed.",
        artifact: "Query volume baseline",
      },
      {
        order: 2,
        title: "Find the outlier host",
        detail:
          "Rank hosts by query count and unique-subdomain count. A single workstation with 10-100× the median is the starting point.",
        artifact: "Host ranking table",
      },
      {
        order: 3,
        title: "Measure name entropy",
        detail:
          "Encoded data is not pronounceable. Score subdomain entropy and length; legitimate CDN and telemetry names cluster far lower.",
        artifact: "Entropy scoring output",
      },
      {
        order: 4,
        title: "Contain precisely",
        detail:
          "Block the authoritative nameserver at egress rather than the whole domain family, so legitimate SaaS tenants keep resolving.",
        artifact: "Egress rule + justification",
      },
    ],
    verdict:
      "Escalate when entropy and volume both cross the threshold. Preserve resolver logs before containment — they are the timeline.",
  },
];
