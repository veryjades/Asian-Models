import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../database.types";

export function createAgencyAdapter(client: SupabaseClient<Database>) {
  return {
    models: {
      list: () => client.from("models").select().order("display_name"),
      getById: (id: string) => client.from("models").select().eq("id", id).maybeSingle(),
    },
    portfolios: {
      listForModel: (modelId: string) =>
        client
          .from("portfolios")
          .select()
          .eq("model_id", modelId)
          .order("created_at", { ascending: false }),
    },
    mediaAssets: {
      listForOwner: (ownerType: string, ownerId: string) =>
        client
          .from("media_assets")
          .select()
          .eq("owner_type", ownerType)
          .eq("owner_id", ownerId)
          .order("sort_order"),
    },
    clients: {
      list: () => client.from("clients").select().order("company_name"),
    },
    bookings: {
      list: () => client.from("bookings").select().order("date", { ascending: false }),
    },
  };
}
