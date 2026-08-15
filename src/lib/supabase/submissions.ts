import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "./database.types";

type Client = SupabaseClient<Database>;

export async function createInquiry(
  client: Client,
  input: Database["public"]["Tables"]["inquiries"]["Insert"],
) {
  const result = await client.from("inquiries").insert(input).select("id").single();
  if (!result.error && result.data?.id) {
    await client.functions.invoke("notify-admin", { body: { reference_id: result.data.id } });
  }
  return result;
}

export async function createScoutApplication(
  client: Client,
  input: Database["public"]["Tables"]["scout_applications"]["Insert"],
) {
  const result = await client.from("scout_applications").insert(input).select("id").single();
  if (!result.error && result.data?.id) {
    await client.functions.invoke("notify-admin", { body: { reference_id: result.data.id } });
  }
  return result;
}

export async function uploadScoutFiles(
  client: Client,
  applicationId: string,
  files: Array<{ file: File; kind: string }>,
) {
  const attachments: Array<{ kind: string; path: string; name: string; type: string }> = [];
  for (const { file, kind } of files) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-120);
    const path = `applications/${applicationId}/${kind}-${crypto.randomUUID()}-${safeName}`;
    const options = { cacheControl: "3600", upsert: false } as {
      cacheControl: string;
      upsert: boolean;
      contentType?: string;
    };
    if (file.type) options.contentType = file.type;
    const { error } = await client.storage.from("scout-submissions").upload(path, file, options);
    if (error) throw error;
    attachments.push({ kind, path, name: file.name, type: file.type });
  }
  return attachments as unknown as Json;
}
