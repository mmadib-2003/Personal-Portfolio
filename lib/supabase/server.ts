import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { publicEnv, serverEnv } from "@/lib/env";

/**
 * Server-side, anon-key client for public reads inside Server Components.
 * RLS still applies — this client can only ever see published rows.
 */
export function createPublicServerClient(): SupabaseClient | null {
  if (!publicEnv.supabaseUrl || !publicEnv.supabaseAnonKey) return null;

  return createClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: { "x-application-name": "muntasir-portfolio-server" },
      fetch: (input, init) =>
        fetch(input, { ...init, next: { revalidate: 60 } } as RequestInit),
    },
  });
}

/**
 * Service-role client. Bypasses RLS — server only, never imported into a
 * Client Component (`server-only` guards that at build time).
 */
export function createAdminServerClient(): SupabaseClient | null {
  if (!serverEnv.supabaseUrl || !serverEnv.serviceRoleKey) return null;

  return createClient(serverEnv.supabaseUrl, serverEnv.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-application-name": "muntasir-portfolio-admin" } },
  });
}
