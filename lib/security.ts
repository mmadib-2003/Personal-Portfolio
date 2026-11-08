import { z } from "zod";

/**
 * Input hardening for everything that crosses a trust boundary:
 * the AI chat endpoint and the contact form.
 */

/** Strips C0/C1 control characters (except newlines/tabs) and null bytes. */
function stripControlCharacters(input: string): string {
  return input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "");
}

/** Neutralises HTML-ish payloads so nothing can be re-rendered as markup. */
export function sanitizeText(input: string): string {
  return stripControlCharacters(input)
    .replace(/<\s*script/gi, "&lt;script")
    .replace(/<\s*\/\s*script/gi, "&lt;/script")
    .replace(/<\s*iframe/gi, "&lt;iframe")
    .replace(/<\s*object/gi, "&lt;object")
    .replace(/<\s*embed/gi, "&lt;embed")
    .replace(/javascript\s*:/gi, "javascript\u200b:")
    .replace(/data\s*:\s*text\/html/gi, "data:text\u200b/html")
    .replace(/on(?:error|load|click|mouseover)\s*=/gi, "on_=")
    .replace(/\s{3,}/g, " ")
    .trim();
}

/**
 * Prompt-injection heuristics.
 *
 * This is defence in depth, not a guarantee. The system prompt also instructs
 * the model to ignore instruction overrides, and no tool is allowed to mutate
 * data or read secrets.
 */
const INJECTION_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /ignore\s+(all\s+|any\s+)?(previous|prior|above)\s+(instructions?|prompts?|rules?)/i, label: "instruction-override" },
  { pattern: /disregard\s+(all\s+|any\s+)?(previous|prior|above)/i, label: "instruction-override" },
  { pattern: /(reveal|print|show|repeat)\s+(me\s+)?(your|the)\s+(system\s+)?(prompt|instructions?)/i, label: "prompt-exfiltration" },
  { pattern: /you\s+are\s+now\s+(a|an|in)\s+/i, label: "role-confusion" },
  { pattern: /(system|developer)\s*(prompt|message|role)\s*[:=]/i, label: "role-confusion" },
  { pattern: /<\|?(im_start|im_end|system|endoftext)\|?>/i, label: "token-smuggling" },
  { pattern: /\b(jailbreak|dan\s+mode|developer\s+mode\s+enabled)\b/i, label: "jailbreak" },
  { pattern: /\b(print|dump|leak)\s+(the\s+)?(env|environment\s+variables?|api\s*keys?|secrets?)/i, label: "secret-exfiltration" },
];

export function detectPromptInjection(text: string): string | null {
  for (const { pattern, label } of INJECTION_PATTERNS) {
    if (pattern.test(text)) return label;
  }
  return null;
}

/** URLs the contact form may not advertise. */
const BLOCKED_URL_PROTOCOLS = /(javascript|data|vbscript)\s*:/i;

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please share your name.")
    .max(120, "That name is too long."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254)
    .email("That email address does not look valid."),
  subject: z.string().trim().max(160, "Keep the subject under 160 characters.").optional(),
  message: z
    .string()
    .trim()
    .min(10, "Please write at least 10 characters.")
    .max(4000, "Please keep the message under 4000 characters."),
  // Honeypot: real humans never fill a hidden field.
  company: z.string().max(0, "Rejected.").optional().default(""),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

export function sanitizeContactInput(input: ContactFormInput) {
  return {
    name: sanitizeText(input.name),
    email: sanitizeText(input.email),
    subject: input.subject ? sanitizeText(input.subject) : null,
    message: sanitizeText(input.message),
  };
}

export function looksLikeSpam(message: string, name: string): boolean {
  if (BLOCKED_URL_PROTOCOLS.test(message)) return true;
  const linkCount = (message.match(/https?:\/\//gi) ?? []).length;
  if (linkCount > 4) return true;
  const upper = message.replace(/[^A-Z]/g, "").length;
  const letters = message.replace(/[^A-Za-z]/g, "").length;
  if (letters > 80 && upper / letters > 0.6) return true;
  if (name.length > 0 && message.toLowerCase() === name.toLowerCase()) return true;
  return false;
}

export const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        id: z.string().min(1).max(128),
        role: z.enum(["user", "assistant", "system"]),
        parts: z.array(z.record(z.string(), z.unknown())).min(1).max(20),
      }),
    )
    .min(1)
    .max(40),
});

export const MAX_CHAT_MESSAGE_CHARS = 1200;

/** Extract plain text from a UI message part list (defensive: types are loose). */
export function extractText(parts: unknown[]): string {
  const out: string[] = [];
  for (const part of parts) {
    if (!part || typeof part !== "object") continue;
    const candidate = part as { type?: unknown; text?: unknown };
    if (candidate.type === "text" && typeof candidate.text === "string") {
      out.push(candidate.text);
    }
  }
  return out.join("\n").trim();
}

export type ChatValidationResult =
  | { ok: true; messages: { id: string; role: "user" | "assistant" | "system"; parts: Array<{ type: "text"; text: string }> }[] }
  | { ok: false; status: number; error: string; code: string };

export function validateChatPayload(payload: unknown): ChatValidationResult {
  const parsed = chatRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      error: "Malformed chat request.",
      code: "invalid_request",
    };
  }

  const cleaned: Array<{
    id: string;
    role: "user" | "assistant" | "system";
    parts: Array<{ type: "text"; text: string }>;
  }> = [];

  for (const message of parsed.data.messages) {
    // Drop client-supplied system messages: the agent owns its instructions.
    if (message.role === "system") continue;

    const text = extractText(message.parts);
    if (!text) continue;

    if (message.role === "user") {
      if (text.length > MAX_CHAT_MESSAGE_CHARS) {
        return {
          ok: false,
          status: 413,
          error: `Messages are limited to ${MAX_CHAT_MESSAGE_CHARS} characters.`,
          code: "message_too_long",
        };
      }
      const injection = detectPromptInjection(text);
      if (injection) {
        return {
          ok: false,
          status: 400,
          error:
            "That message looks like an instruction-override attempt. Ask about Muntasir's skills, projects or experience instead.",
          code: `blocked_${injection}`,
        };
      }
    }

    cleaned.push({
      id: message.id,
      role: message.role,
      parts: [{ type: "text", text: sanitizeText(text).slice(0, 4000) }],
    });
  }

  if (!cleaned.some((m) => m.role === "user")) {
    return {
      ok: false,
      status: 400,
      error: "A user message is required.",
      code: "missing_user_message",
    };
  }

  return { ok: true, messages: cleaned };
}

/** Very small in-memory sliding window rate limiter (per instance). */
export function createRateLimiter(options: {
  limit: number;
  windowMs: number;
}) {
  const hits = new Map<string, number[]>();

  function check(key: string): { allowed: boolean; retryAfter: number } {
    const now = Date.now();
    const timestamps = (hits.get(key) ?? []).filter(
      (t) => now - t < options.windowMs,
    );

    if (timestamps.length >= options.limit) {
      const oldest = timestamps[0] ?? now;
      return {
        allowed: false,
        retryAfter: Math.max(1, Math.ceil((options.windowMs - (now - oldest)) / 1000)),
      };
    }

    timestamps.push(now);
    hits.set(key, timestamps);

    // Opportunistic cleanup so the map cannot grow without bound.
    if (hits.size > 5000) {
      for (const [k, v] of hits) {
        if (v.every((t) => now - t >= options.windowMs)) hits.delete(k);
      }
    }

    return { allowed: true, retryAfter: 0 };
  }

  return { check };
}

export function clientKeyFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
  return ip;
}
