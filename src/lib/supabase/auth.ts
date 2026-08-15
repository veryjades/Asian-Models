import type {
  AuthChangeEvent,
  AuthResponse,
  Session,
  SupabaseClient,
  User,
} from "@supabase/supabase-js";

import type { Database } from "./database.types";

/** Roles accepted by the Phase 2 database policies. */
export type AppRole = "admin" | "editor" | "viewer";

export interface AuthIdentity {
  id: string;
  email: string | null;
  role: AppRole;
}

/**
 * Read only the trusted app_metadata claim. Invalid or missing claims are
 * deliberately downgraded to viewer, matching public.current_app_role().
 */
export function appRoleFromMetadata(metadata: Record<string, unknown> | undefined): AppRole {
  const role = metadata?.["role"];
  return role === "admin" || role === "editor" || role === "viewer" ? role : "viewer";
}

export function toAuthIdentity(user: Pick<User, "id" | "email" | "app_metadata">): AuthIdentity {
  return {
    id: user.id,
    email: user.email ?? null,
    role: appRoleFromMetadata(user.app_metadata),
  };
}

export interface AuthAdapter {
  getSession: () => Promise<{ data: { session: Session | null }; error: Error | null }>;
  getIdentity: () => Promise<{ data: { identity: AuthIdentity | null }; error: Error | null }>;
  signInWithPassword: (email: string, password: string) => Promise<AuthResponse>;
  resetPasswordForEmail: (email: string, redirectTo: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  onAuthStateChange: (callback: (event: AuthChangeEvent, session: Session | null) => void) => {
    unsubscribe: () => void;
  };
}

/**
 * Confirm a live user JWT before Admin writes. A stale React identity is not
 * enough: deleted or expired sessions must fail closed instead of writing as anon.
 * Call only getUser() here. A follow-up getSession() can deadlock supabase-js
 * navigator.locks and leave the Save button stuck on "Saving…".
 */
export async function requireAuthenticatedSession(client: SupabaseClient<Database>) {
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) {
    return {
      user: null,
      error: error ?? new Error("Auth session missing. Sign in again."),
    };
  }
  return { user: data.user, error: null };
}

export function createAuthAdapter(client: SupabaseClient<Database>): AuthAdapter {
  return {
    getSession: async () => {
      const { data, error } = await client.auth.getSession();
      return { data, error };
    },
    getIdentity: async () => {
      const { data, error } = await client.auth.getUser();
      return {
        data: { identity: data.user ? toAuthIdentity(data.user) : null },
        error,
      };
    },
    signInWithPassword: (email, password) => client.auth.signInWithPassword({ email, password }),
    resetPasswordForEmail: async (email, redirectTo) => {
      const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
      return { error };
    },
    updatePassword: async (password) => {
      const { error } = await client.auth.updateUser({ password });
      return { error };
    },
    signOut: () => client.auth.signOut(),
    onAuthStateChange: (callback) => {
      const { data } = client.auth.onAuthStateChange(callback);
      return data.subscription;
    },
  };
}
