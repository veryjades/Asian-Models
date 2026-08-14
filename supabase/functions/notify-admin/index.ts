import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Notification = {
  id: string;
  kind: "inquiry" | "application";
  reference_id: string;
  recipient_email: string;
  subject: string;
  status: "pending" | "sent" | "failed";
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
}

function env(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);

  let body: { reference_id?: unknown };
  try {
    body = (await request.json()) as { reference_id?: unknown };
  } catch {
    return json({ error: "Request body must be valid JSON." }, 400);
  }
  if (!isUuid(body.reference_id)) return json({ error: "reference_id must be a UUID." }, 400);

  try {
    const url = env("SUPABASE_URL");
    const serviceKey = env("SUPABASE_SERVICE_ROLE_KEY");
    const admin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: notification, error: notificationError } = await admin
      .from("admin_notifications")
      .select("*")
      .eq("reference_id", body.reference_id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<Notification>();

    if (notificationError) throw notificationError;
    if (!notification) return json({ status: "already_processed" });

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const resendFrom = Deno.env.get("RESEND_FROM") ?? "Asian Models <onboarding@resend.dev>";
    if (!resendKey) {
      await admin
        .from("admin_notifications")
        .update({ error: "RESEND_API_KEY is not configured; notification remains pending." })
        .eq("id", notification.id);
      return json(
        {
          notification_id: notification.id,
          status: "pending",
          error: "Email provider is not configured.",
        },
        503,
      );
    }

    const source =
      notification.kind === "application"
        ? (
            await admin
              .from("scout_applications")
              .select("*")
              .eq("id", notification.reference_id)
              .single()
          ).data
        : (await admin.from("inquiries").select("*").eq("id", notification.reference_id).single())
            .data;
    if (!source) return json({ error: "Source record not found." }, 404);

    const fields = Object.entries(source as Record<string, unknown>)
      .filter(([key]) => !["id", "attachments", "details"].includes(key))
      .map(
        ([key, value]) =>
          `<tr><td style="padding:6px 12px 6px 0;color:#666">${escapeHtml(key)}</td><td style="padding:6px 0">${escapeHtml(value)}</td></tr>`,
      )
      .join("");
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: resendFrom,
        to: [notification.recipient_email],
        subject: notification.subject,
        html: `<h2>${escapeHtml(notification.subject)}</h2><table>${fields}</table><p>Open the Admin inbox to review and update this request.</p>`,
      }),
    });
    if (!response.ok) {
      const detail = await response.text();
      await admin
        .from("admin_notifications")
        .update({ status: "failed", error: detail.slice(0, 1000) })
        .eq("id", notification.id);
      return json(
        {
          notification_id: notification.id,
          status: "failed",
          error: "Email provider rejected the message.",
        },
        502,
      );
    }

    await admin
      .from("admin_notifications")
      .update({ status: "sent", error: null, sent_at: new Date().toISOString() })
      .eq("id", notification.id);
    return json({ notification_id: notification.id, status: "sent" });
  } catch (error) {
    console.error(error);
    return json(
      { error: error instanceof Error ? error.message : "Unable to send notification." },
      503,
    );
  }
});
