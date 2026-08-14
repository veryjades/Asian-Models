import { createClient } from "npm:@supabase/supabase-js@2";

type AppRole = "admin" | "editor" | "viewer";

const ALLOWED_ROLES = new Set<AppRole>(["admin", "editor", "viewer"]);
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
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
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return json({ error: "Missing bearer token." }, 401);

  let payload: { user_id?: unknown; role?: unknown };
  try {
    payload = (await request.json()) as { user_id?: unknown; role?: unknown };
  } catch {
    return json({ error: "Request body must be valid JSON." }, 400);
  }

  if (typeof payload.user_id !== "string" || !UUID_PATTERN.test(payload.user_id)) {
    return json({ error: "user_id must be a valid UUID." }, 400);
  }
  if (typeof payload.role !== "string" || !ALLOWED_ROLES.has(payload.role as AppRole)) {
    return json({ error: "role must be admin, editor, or viewer." }, 400);
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

    const { data: targetData, error: targetError } = await adminClient.auth.admin.getUserById(
      payload.user_id,
    );
    if (targetError || !targetData.user) return json({ error: "Target user not found." }, 404);

    const { error: updateError } = await adminClient.auth.admin.updateUserById(payload.user_id, {
      app_metadata: {
        ...targetData.user.app_metadata,
        role: payload.role,
      },
    });
    if (updateError) return json({ error: "Unable to update target role." }, 502);

    return json({ user_id: payload.user_id, role: payload.role });
  } catch (error) {
    console.error(error);
    return json({ error: "Role provisioning is not configured." }, 503);
  }
});
