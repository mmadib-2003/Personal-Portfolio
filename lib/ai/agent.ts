import "server-only";

import { ToolLoopAgent, stepCountIs } from "ai";

import { resolveChatModel } from "@/lib/ai/model";
import { buildSystemPrompt } from "@/lib/ai/prompt";
import { portfolioTools } from "@/lib/ai/tools";
import { getProfile } from "@/lib/queries";

/**
 * The SOC Assistant agent.
 *
 * `ToolLoopAgent` owns the tool-calling loop: the model may call
 * query_projects / query_skills / list_github_repos / search_writeups across
 * multiple steps before it answers. All four tools are read-only.
 *
 * Model access goes through the Vercel AI Gateway (see `lib/ai/model.ts`).
 */
export async function createSocAgent() {
  const { data: profile } = await getProfile();

  return new ToolLoopAgent({
    id: "soc-assistant",
    model: resolveChatModel(),
    instructions: buildSystemPrompt(profile),
    tools: portfolioTools,
    temperature: 0.3,
    maxOutputTokens: 900,
    maxRetries: 1,
    // A tool-only step should never end the turn: keep looping until the model
    // has produced prose for the visitor.
    stopWhen: stepCountIs(4),
  });
}

export type SocAgent = Awaited<ReturnType<typeof createSocAgent>>;
