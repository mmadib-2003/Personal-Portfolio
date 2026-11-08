import "server-only";

import { ToolLoopAgent } from "ai";

import { buildSystemPrompt } from "@/lib/ai/prompt";
import { portfolioTools } from "@/lib/ai/tools";
import { serverEnv } from "@/lib/env";
import { getProfile } from "@/lib/queries";

/**
 * The SOC Assistant agent.
 *
 * `ToolLoopAgent` owns the tool-calling loop: the model may call
 * query_projects / query_skills / list_github_repos / search_writeups across
 * multiple steps before it answers. All four tools are read-only.
 *
 * Model access goes through the Vercel AI Gateway, which picks up
 * `AI_GATEWAY_API_KEY` (or Vercel OIDC on a deployment) automatically.
 */
export async function createSocAgent() {
  const { data: profile } = await getProfile();

  return new ToolLoopAgent({
    id: "soc-assistant",
    model: serverEnv.modelId,
    instructions: buildSystemPrompt(profile),
    tools: portfolioTools,
    temperature: 0.3,
    maxOutputTokens: 900,
    maxRetries: 1,
  });
}

export type SocAgent = Awaited<ReturnType<typeof createSocAgent>>;
