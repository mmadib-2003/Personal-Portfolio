import "server-only";

import { createGateway } from "@ai-sdk/gateway";
import type { LanguageModel } from "ai";

import { serverEnv } from "@/lib/env";

/**
 * Resolves the language model the SOC Assistant talks to.
 *
 * Credential order (handled by the Gateway SDK itself):
 *   1. `AI_GATEWAY_API_KEY`
 *   2. Vercel OIDC — present automatically on a Vercel deployment
 *
 * `AI_GATEWAY_BASE_URL` exists so the agent can be pointed at a local mock
 * during development and CI. It is never set on Vercel, so production always
 * talks to the real Gateway.
 */
let cachedProvider: ReturnType<typeof createGateway> | null = null;
let cachedBaseUrl: string | undefined | null = null;

function getProvider() {
  const baseURL = serverEnv.gatewayBaseUrl;

  if (cachedProvider && cachedBaseUrl === baseURL) return cachedProvider;

  cachedProvider = createGateway(baseURL ? { baseURL } : {});
  cachedBaseUrl = baseURL;
  return cachedProvider;
}

export function resolveChatModel(): LanguageModel {
  return getProvider().languageModel(serverEnv.modelId);
}
