import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

let browserClient: SupabaseClient<Database> | undefined;

function requirePublicEnv(name: "VITE_SUPABASE_URL" | "VITE_SUPABASE_PUBLISHABLE_KEY"): string {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(`${name} is required before initializing the Supabase browser client.`);
  }
  return value;
}

export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  if (!browserClient) {
    browserClient = createClient<Database>(
      requirePublicEnv("VITE_SUPABASE_URL"),
      requirePublicEnv("VITE_SUPABASE_PUBLISHABLE_KEY"),
    );
  }

  return browserClient;
}
