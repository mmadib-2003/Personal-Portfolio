import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";

/**
 * Browser / anon client.
 *
 * Read-only by policy: RLS only grants `select` on published rows and `insert`
 * on `contact_messages`. Safe to ship to the client bundle.
 */
let browserClient: SupabaseClient | null = null;

export function getBrowserSupabase(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  if (!publicEnv.supabaseUrl || !publicEnv.supabaseAnonKey) return null;
  if (browserClient) return browserClient;

  browserClient = createClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-application-name": "muntasir-portfolio-web" } },
  });

  return browserClient;
}
