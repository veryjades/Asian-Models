import { createClient } from "npm:@supabase/supabase-js@2";

type AppRole = "admin" | "editor" | "viewer";
type Action = "list" | "invite" | "set_role" | "delete";

const ALLOWED_ROLES = new Set<AppRole>(["admin", "editor", "viewer"]);
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
  "access-control-allow-methods": "POST, OPTIONS",
};

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "content-type": "application/json" },
  });
}

function safeRedirect(value: unknown): string | undefined {
  if (typeof value !== "string" || !value) return undefined;
  try {
    const url = new URL(value);
    const allowedHost =
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname.endsWith(".vercel.app");
    if (!allowedHost || url.pathname !== "/admin") return undefined;
    if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
      return undefined;
    }
    return url.toString();
  } catch {
    return undefined;
  }
}

function requiredEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

function readKey(jsonEnvName: string, legacyEnvName: string): string {
  const jsonValue = Deno.env.get(jsonEnvName);
  if (jsonValue) {
    try {
      const keys = JSON.parse(jsonValue) as Record<string, unknown>;
      if (typeof keys["default"] === "string" && keys["default"]) return keys["default"];
    } catch {
      // Fall through to the legacy variable for projects before key migration.
    }
  }

  const legacyValue = Deno.env.get(legacyEnvName);
  if (!legacyValue) throw new Error(`${jsonEnvName} or ${legacyEnvName} is not configured.`);
  return legacyValue;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return json({ error: "Missing bearer token." }, 401);

  let payload: {
    action?: unknown;
    user_id?: unknown;
    role?: unknown;
    email?: unknown;
    redirect_to?: unknown;
  };
  try {
    payload = (await request.json()) as {
      action?: unknown;
      user_id?: unknown;
      role?: unknown;
      email?: unknown;
      redirect_to?: unknown;
    };
  } catch {
    return json({ error: "Request body must be valid JSON." }, 400);
  }

  const action = (payload.action ?? (payload.user_id ? "set_role" : "list")) as Action;
  if (!["list", "invite", "set_role", "delete"].includes(action)) {
    return json({ error: "action must be list, invite, set_role, or delete." }, 400);
  }
  if (action === "set_role" || action === "delete") {
    if (typeof payload.user_id !== "string" || !UUID_PATTERN.test(payload.user_id)) {
      return json({ error: "user_id must be a valid UUID." }, 400);
    }
  }
  if (action === "set_role" || action === "invite") {
    if (typeof payload.role !== "string" || !ALLOWED_ROLES.has(payload.role as AppRole)) {
      return json({ error: "role must be admin, editor, or viewer." }, 400);
    }
  }
  if (action === "invite" && (typeof payload.email !== "string" || !payload.email.includes("@"))) {
    return json({ error: "email must be a valid email address." }, 400);
  }

  try {
    const url = requiredEnv("SUPABASE_URL");
    const anonKey = readKey("SUPABASE_PUBLISHABLE_KEYS", "SUPABASE_ANON_KEY");
    const serviceRoleKey = readKey("SUPABASE_SECRET_KEYS", "SUPABASE_SERVICE_ROLE_KEY");
    const userClient = createClient(url, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const adminClient = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: callerData, error: callerError } = await userClient.auth.getUser();
    if (callerError || callerData.user?.app_metadata?.["role"] !== "admin") {
      return json({ error: "Admin role required." }, 403);
    }

    if (action === "list") {
      const { data, error } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (error) return json({ error: "Unable to list workspace users." }, 502);
      return json({
        users: data.users.map((user) => ({
          id: user.id,
          email: user.email ?? null,
          role: ALLOWED_ROLES.has(user.app_metadata?.["role"] as AppRole)
            ? user.app_metadata["role"]
            : "viewer",
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at ?? null,
          confirmed_at: user.confirmed_at ?? null,
        })),
      });
    }

    if (action === "invite") {
      const redirectTo = safeRedirect(payload.redirect_to);
      if (!redirectTo) {
        return json({ error: "redirect_to must be the approved /admin URL." }, 400);
      }
      const { data, error } = await adminClient.auth.admin.inviteUserByEmail(
        payload.email as string,
        {
          redirectTo,
        },
      );
      if (error || !data.user) {
        return json({ error: error?.message ?? "Unable to send invitation." }, 502);
      }
      const { error: updateError } = await adminClient.auth.admin.updateUserById(data.user.id, {
        app_metadata: { ...data.user.app_metadata, role: payload.role },
      });
      if (updateError) return json({ error: "Invitation sent, but role assignment failed." }, 502);
      return json({ user_id: data.user.id, email: data.user.email, role: payload.role });
    }

    const { data: targetData, error: targetError } = await adminClient.auth.admin.getUserById(
      payload.user_id as string,
    );
    if (targetError || !targetData.user) return json({ error: "Target user not found." }, 404);
    if (action === "delete") {
      if (targetData.user.id === callerData.user.id)
        return json({ error: "You cannot delete your own admin account." }, 400);
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(targetData.user.id);
      if (deleteError) return json({ error: "Unable to delete target user." }, 502);
      return json({ user_id: targetData.user.id, deleted: true });
    }

    const { error: updateError } = await adminClient.auth.admin.updateUserById(targetData.user.id, {
      app_metadata: {
        ...targetData.user.app_metadata,
        role: payload.role,
      },
    });
    if (updateError) return json({ error: "Unable to update target role." }, 502);

    return json({ user_id: targetData.user.id, role: payload.role });
  } catch (error) {
    console.error(error);
    return json({ error: "Role provisioning is not configured." }, 503);
  }
});
