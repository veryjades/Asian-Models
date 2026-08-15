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
 * Browser-safe Auth boundary. It never accepts or exposes a service-role key;
 * account creation and role assignment stay in the Dashboard/server workflow.
 */
/**
 * Confirm a live user JWT before Admin writes. A stale React identity is not
 * enough: deleted or expired sessions must fail closed instead of writing as anon.
 */
export async function requireAuthenticatedSession(client: SupabaseClient<Database>) {
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) {
    return {
      user: null,
      session: null,
      error: userError ?? new Error("Auth session missing. Sign in again."),
    };
  }
  const { data: sessionData, error: sessionError } = await client.auth.getSession();
  if (sessionError || !sessionData.session?.access_token) {
    return {
      user: null,
      session: null,
      error: sessionError ?? new Error("Auth session missing. Sign in again."),
    };
  }
  return { user: userData.user, session: sessionData.session, error: null };
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
