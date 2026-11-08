import { createAgentUIStreamResponse } from "ai";

import { createSocAgent } from "@/lib/ai/agent";
import { serverEnv } from "@/lib/env";
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
 */
const limiter = createRateLimiter({ limit: 20, windowMs: 60_000 });

export async function POST(request: Request) {
  const clientKey = clientKeyFromHeaders(request.headers);
  const gate = limiter.check(clientKey);

  if (!gate.allowed) {
    return Response.json(
      {
        error: "Too many requests. Please wait a moment before asking again.",
        code: "rate_limited",
      },
      { status: 429, headers: { "Retry-After": String(gate.retryAfter) } },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json(
      { error: "Request body must be valid JSON.", code: "invalid_json" },
      { status: 400 },
    );
  }

  const validation = validateChatPayload(payload);
  if (!validation.ok) {
    return Response.json(
      { error: validation.error, code: validation.code },
      { status: validation.status },
    );
  }

  if (!serverEnv.gatewayApiKey && !process.env.VERCEL_OIDC_TOKEN) {
    return Response.json(
      {
        error:
          "The SOC Assistant is not configured on this deployment. Set AI_GATEWAY_API_KEY to enable it.",
        code: "assistant_unconfigured",
      },
      { status: 503 },
    );
  }

  try {
    const agent = await createSocAgent();

    return createAgentUIStreamResponse({
      agent,
      uiMessages: validation.messages,
      abortSignal: request.signal,
    });
  } catch (error) {
    console.error("[api/chat] agent failure", error);
    return Response.json(
      {
        error:
          "The SOC Assistant hit an error. Please try again, or reach Muntasir directly at mmadib2001@gmail.com.",
        code: "agent_error",
      },
      { status: 500 },
    );
  }
}

export function GET() {
  return Response.json(
    { error: "Use POST to talk to the SOC Assistant.", code: "method_not_allowed" },
    { status: 405, headers: { Allow: "POST" } },
  );
}
