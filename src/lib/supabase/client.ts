import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

const BROWSER_CLIENT_KEY = "__asianModelsSupabaseBrowserClient";

function requirePublicEnv(name: "VITE_SUPABASE_URL" | "VITE_SUPABASE_PUBLISHABLE_KEY"): string {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(`${name} is required before initializing the Supabase browser client.`);
  }
  return value;
}

function isBrowser() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index) {
      return [...store.keys()][index] ?? null;
    },
    removeItem(key) {
      store.delete(key);
    },
    setItem(key, value) {
      store.set(key, value);
    },
  };
}

function createBrowserAuthStorage(): Storage {
  const probe = "__asian_models_auth_probe__";
  for (const storage of [window.localStorage, window.sessionStorage]) {
    try {
      storage.setItem(probe, "1");
      storage.removeItem(probe);
      return storage;
    } catch {
      // Private mode or a partitioned preview frame can block persistence.
    }
  }
  return createMemoryStorage();
}

function createPublicClient(persist: boolean): SupabaseClient<Database> {
  return createClient<Database>(
    requirePublicEnv("VITE_SUPABASE_URL"),
    requirePublicEnv("VITE_SUPABASE_PUBLISHABLE_KEY"),
    {
      auth: persist
        ? {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storage: createBrowserAuthStorage(),
          }
        : {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
    },
  );
}

/**
 * Public Data API client. Browser calls share one persisted Auth session so
 * Admin writes send the user JWT. SSR gets a throwaway anon client and must
 * never reuse that instance after hydration.
 */
export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  if (!isBrowser()) {
    return createPublicClient(false);
  }

  const scope = globalThis as typeof globalThis & {
    [BROWSER_CLIENT_KEY]?: SupabaseClient<Database>;
  };
  scope[BROWSER_CLIENT_KEY] ??= createPublicClient(true);
  return scope[BROWSER_CLIENT_KEY];
}
