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
  get modelId() {
    return readEnv("AI_MODEL_ID") ?? "openai/gpt-4o-mini";
  },
};

export const GITHUB_OWNER = "mmadib-2003";

/** True when the public Supabase read path is configured. */
export function isSupabaseConfigured(): boolean {
  return Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey);
}
