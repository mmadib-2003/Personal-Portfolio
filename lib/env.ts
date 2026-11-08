/**
 * Environment access.
 *
 * Every variable is read lazily so a missing key degrades the feature that
 * needs it (e.g. the AI chat) instead of crashing the whole build.
 */

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  if (!value || value.trim().length === 0) return undefined;
  return value.trim();
}

export const publicEnv = {
  get supabaseUrl() {
    return readEnv("NEXT_PUBLIC_SUPABASE_URL");
  },
  get supabaseAnonKey() {
    return (
      readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") ??
      readEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")
    );
  },
};

export const serverEnv = {
  get supabaseUrl() {
    return readEnv("NEXT_PUBLIC_SUPABASE_URL") ?? readEnv("SUPABASE_URL");
  },
  get serviceRoleKey() {
    return (
      readEnv("SUPABASE_SERVICE_ROLE_KEY") ?? readEnv("SUPABASE_SECRET_KEY")
    );
  },
  get githubToken() {
    return readEnv("GITHUB_TOKEN");
  },
  get gatewayApiKey() {
    return readEnv("AI_GATEWAY_API_KEY") ?? readEnv("VERCEL_AI_GATEWAY_KEY");
  },
  /** Local/testing override only — unset on Vercel. */
  get gatewayBaseUrl() {
    return readEnv("AI_GATEWAY_BASE_URL");
  },
  get modelId() {
    return readEnv("AI_MODEL_ID") ?? "openai/gpt-4o-mini";
  },
};

/**
 * True when the assistant has a usable credential.
 *
 * On Vercel the Gateway authenticates with the OIDC token, which the platform
 * injects per-request rather than as a build-time env var — so checking only
 * `AI_GATEWAY_API_KEY` would wrongly report "unconfigured" on a live
 * deployment.
 */
export function isAssistantConfigured(): boolean {
  return Boolean(
    serverEnv.gatewayApiKey ||
      // Vercel OIDC: a platform-provided build/runtime token, or the
      // per-request token the SDK reads from the request context.
      process.env.VERCEL_OIDC_TOKEN ||
      process.env.VERCEL === "1",
  );
}

export const GITHUB_OWNER = "mmadib-2003";

/** True when the public Supabase read path is configured. */
export function isSupabaseConfigured(): boolean {
  return Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey);
}
