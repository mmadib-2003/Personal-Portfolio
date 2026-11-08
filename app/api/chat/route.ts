import { createAgentUIStreamResponse } from "ai";

import { createSocAgent } from "@/lib/ai/agent";
import { isAssistantConfigured } from "@/lib/env";
import {
  clientKeyFromHeaders,
  createRateLimiter,
  validateChatPayload,
} from "@/lib/security";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * POST /api/chat — streams the SOC Assistant's reply as a UI message stream.
 *
 * Trust boundary notes:
 * - The body is validated and sanitized before it reaches the model.
 * - Client-supplied `system` messages are dropped: the agent owns its prompt.
 * - Prompt-injection heuristics reject obvious instruction-override attempts.
 * - Requests are rate limited per IP (per instance).
 *
 * Failure behaviour: once the stream has started we can no longer change the
 * status code, so upstream failures (missing key, Gateway 4xx/5xx, timeout)
 * are surfaced *inside* the stream as a readable sentence via `onError`
 * instead of the SDK's opaque default "An error occurred.". That is what the
 * chat widget renders — a bare stack trace is useless to a recruiter.
 */
const limiter = createRateLimiter({ limit: 20, windowMs: 60_000 });

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
  Vary: "Origin",
};

function json(body: unknown, status: number, extra?: Record<string, string>) {
  return Response.json(body, {
    status,
    headers: { ...CORS_HEADERS, ...extra },
  });
}

/** Maps a thrown/streamed error to something a visitor can act on. */
function describeError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error ?? "");

  if (/401|403|unauthor|authentication|api key|oidc/i.test(message)) {
    return "The assistant could not authenticate with the AI Gateway. Please email Muntasir directly at mmadib2001@gmail.com.";
  }
  if (/429|rate limit|quota/i.test(message)) {
    return "The assistant is rate limited right now. Please try again in a minute, or email Muntasir at mmadib2001@gmail.com.";
  }
  if (/timeout|timed out|ETIMEDOUT|ECONNRESET|fetch failed|network/i.test(message)) {
    return "Connection lost while contacting the assistant. Please try again.";
  }
  if (/model|not found|404/i.test(message)) {
    return "The assistant's model is unavailable on this deployment. Please email Muntasir at mmadib2001@gmail.com.";
  }
  return "The assistant hit an unexpected error. Please try again, or email Muntasir at mmadib2001@gmail.com.";
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: Request) {
  const clientKey = clientKeyFromHeaders(request.headers);
  const gate = limiter.check(clientKey);

  if (!gate.allowed) {
    return json(
      {
        error: "Too many requests. Please wait a moment before asking again.",
        code: "rate_limited",
      },
      429,
      { "Retry-After": String(gate.retryAfter) },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json(
      { error: "Request body must be valid JSON.", code: "invalid_json" },
      400,
    );
  }

  const validation = validateChatPayload(payload);
  if (!validation.ok) {
    return json(
      { error: validation.error, code: validation.code },
      validation.status,
    );
  }

  if (!isAssistantConfigured()) {
    return json(
      {
        error:
          "The SOC Assistant is not configured on this deployment. Set AI_GATEWAY_API_KEY to enable it.",
        code: "assistant_unconfigured",
      },
      503,
    );
  }

  try {
    const agent = await createSocAgent();

    return await createAgentUIStreamResponse({
      agent,
      uiMessages: validation.messages,
      abortSignal: request.signal,
      headers: CORS_HEADERS,
      onError: (error) => {
        console.error("[api/chat] stream error", error);
        return describeError(error);
      },
    });
  } catch (error) {
    console.error("[api/chat] agent failure", error);
    return json(
      { error: describeError(error), code: "agent_error" },
      500,
    );
  }
}

export function GET() {
  return json(
    { error: "Use POST to talk to the SOC Assistant.", code: "method_not_allowed" },
    405,
    { Allow: "POST, OPTIONS" },
  );
}
