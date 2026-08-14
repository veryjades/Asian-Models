import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createAuthAdapter, type AuthIdentity } from "@/lib/supabase/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  createModelMediaAdapter,
  createModelMediaPath,
  type ModelMediaMimeType,
} from "@/lib/supabase/media";
import type { Database } from "@/lib/supabase/database.types";

type ModelRow = Database["public"]["Tables"]["models"]["Row"];
type MediaRow = Database["public"]["Tables"]["media_assets"]["Row"];
type ModelStatus = ModelRow["status"];
type ModelGender = "women" | "men";

type ModelDraft = {
  name: string;
  displayName: string;
  gender: ModelGender;
  category: string;
  height: string;
  nationality: string;
  languages: string;
  bio: string;
  status: ModelStatus;
};

type Notice = { tone: "error" | "success"; text: string };
type AccessState = "loading" | "config" | "signed-out" | "forbidden" | "ready";
type PreviewState = { primary: string | undefined; hover: string | undefined };

const EMPTY_DRAFT: ModelDraft = {
  name: "",
  displayName: "",
  gender: "women",
  category: "editorial",
  height: "",
  nationality: "",
  languages: "Mandarin, English",
  bio: "",
  status: "active",
};

export const Route = createFileRoute("/admin")({ component: AdminRoute });

function AdminRoute() {
  const [client, setClient] = useState<SupabaseClient<Database> | null>(null);
  const [identity, setIdentity] = useState<AuthIdentity | null>(null);
  const [access, setAccess] = useState<AccessState>("loading");
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    let disposed = false;
    let unsubscribe: (() => void) | undefined;

    try {
      const nextClient = getSupabaseBrowserClient();
      setClient(nextClient);
      const auth = createAuthAdapter(nextClient);

      const refreshIdentity = async () => {
        const { data, error } = await auth.getIdentity();
        if (disposed) return;
        if (error) {
          setNotice({ tone: "error", text: error.message });
          setAccess("signed-out");
          return;
        }
        const nextIdentity = data.identity;
        setIdentity(nextIdentity);
        if (!nextIdentity) {
          setAccess("signed-out");
        } else if (nextIdentity.role === "viewer") {
          setAccess("forbidden");
        } else {
          setAccess("ready");
        }
      };

      void refreshIdentity();
      unsubscribe = auth.onAuthStateChange(() => {
        void refreshIdentity();
      }).unsubscribe;
    } catch (error) {
      if (!disposed) {
        setNotice({
          tone: "error",
          text: error instanceof Error ? error.message : "Supabase is not configured.",
        });
        setAccess("config");
      }
    }

    return () => {
      disposed = true;
      unsubscribe?.();
    };
  }, []);

  if (access === "loading") return <AdminLoading />;
  if (access === "config")
    return (
      <AdminMessage
        title="Admin is not configured"
        body={
          notice?.text ??
          "Add the public Supabase environment variables before using the admin surface."
        }
      />
    );
  if (access === "signed-out") {
    return <AdminSignIn client={client} notice={notice} />;
  }
  if (access === "forbidden") {
    return (
      <AdminMessage
        title="Editor access required"
        body="This account is authenticated as Viewer. Ask an Admin to provision an Editor or Admin role before managing model media."
        action={
          <Link to="/" className="label-xs border border-foreground px-4 py-3">
            Return to public site
          </Link>
        }
      />
    );
  }

  if (!client || !identity) return <AdminLoading />;
  return (
    <AdminDashboard
      client={client}
      identity={identity}
      onSignedOut={() => setAccess("signed-out")}
    />
  );
}

function AdminLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-sm text-white/70">
      Loading admin workspace…
    </div>
  );
}

function AdminMessage({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="w-full max-w-lg border border-white/15 bg-white/5 p-8">
        <p className="label-xs text-white/50">J&J / ADMIN</p>
        <h1 className="mt-4 text-3xl font-light">{title}</h1>
        <p className="mt-4 text-sm leading-7 text-white/65">{body}</p>
        <div className="mt-7">
          {action ?? (
            <Link to="/" className="label-xs border border-white/40 px-4 py-3">
              Return to public site
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminSignIn({
  client,
  notice,
}: {
  client: SupabaseClient<Database> | null;
  notice: Notice | null;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(notice?.text ?? null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!client) return;
    setBusy(true);
    setError(null);
    const { error: signInError } = await createAuthAdapter(client).signInWithPassword(
      email.trim(),
      password,
    );
    if (signInError) setError(signInError.message);
    setBusy(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="w-full max-w-md border border-white/15 bg-white/5 p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label-xs text-white/50">J&J / ADMIN</p>
            <h1 className="mt-4 text-3xl font-light">Sign in to the workspace</h1>
          </div>
          <Link to="/" className="label-xs text-white/45 hover:text-white">
            Exit
          </Link>
        </div>
        <p className="mt-4 text-sm leading-7 text-white/65">
          Only trusted Admin and Editor roles can edit model records or upload private media.
        </p>
        <form className="mt-8 space-y-5" onSubmit={submit}>
          <label className="block text-sm text-white/70">
            Email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              autoComplete="email"
              required
              className="mt-2 w-full border border-white/20 bg-black/20 px-3 py-3 text-white outline-none focus:border-white/60"
            />
          </label>
          <label className="block text-sm text-white/70">
            Password
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete="current-password"
              required
              className="mt-2 w-full border border-white/20 bg-black/20 px-3 py-3 text-white outline-none focus:border-white/60"
            />
          </label>
          {error && (
            <p className="border border-red-300/30 bg-red-300/10 p-3 text-sm text-red-100">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy || !client}
            className="label-xs w-full bg-white px-4 py-3 text-slate-950 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

function AdminDashboard({
  client,
  identity,
  onSignedOut,
}: {
  client: SupabaseClient<Database>;
  identity: AuthIdentity;
  onSignedOut: () => void;
}) {
  const canEdit = identity.role === "admin" || identity.role === "editor";
  const [models, setModels] = useState<ModelRow[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ModelDraft>(EMPTY_DRAFT);
  const [primaryFile, setPrimaryFile] = useState<File | null>(null);
  const [hoverFile, setHoverFile] = useState<File | null>(null);
  const [mediaRows, setMediaRows] = useState<MediaRow[]>([]);
  const [remotePreviews, setRemotePreviews] = useState<PreviewState>({
    primary: undefined,
    hover: undefined,
  });
  const [localPreviews, setLocalPreviews] = useState<PreviewState>({
    primary: undefined,
    hover: undefined,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  const loadModels = useCallback(async () => {
    setLoading(true);
    const { data, error } = await client.from("models").select("*").order("display_name");
    if (error) {
      setNotice({ tone: "error", text: error.message });
    } else {
      setModels(data ?? []);
    }
    setLoading(false);
  }, [client]);

  useEffect(() => {
    void loadModels();
  }, [loadModels]);

  useEffect(() => {
    const urls: string[] = [];
    const primaryUrl = primaryFile ? URL.createObjectURL(primaryFile) : undefined;
    const hoverUrl = hoverFile ? URL.createObjectURL(hoverFile) : undefined;
    if (primaryUrl) urls.push(primaryUrl);
    if (hoverUrl) urls.push(hoverUrl);
    setLocalPreviews({ primary: primaryUrl, hover: hoverUrl });
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [primaryFile, hoverFile]);

  useEffect(() => {
    let disposed = false;
    const urls: string[] = [];
    const loadPreviews = async () => {
      if (!selectedModelId || mediaRows.length === 0) {
        setRemotePreviews({ primary: undefined, hover: undefined });
        return;
      }
      const media = createModelMediaAdapter(client);
      const next: PreviewState = { primary: undefined, hover: undefined };
      await Promise.all(
        mediaRows.map(async (row) => {
          const { data } = await media.download(row.file_url);
          if (!data) return;
          const url = URL.createObjectURL(data);
          urls.push(url);
          if (row.sort_order === 0) next.primary = url;
          if (row.sort_order === 1) next.hover = url;
        }),
      );
      if (!disposed) setRemotePreviews(next);
    };
    void loadPreviews();
    return () => {
      disposed = true;
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [client, mediaRows, selectedModelId]);

  const selectModel = async (model: ModelRow) => {
    setSelectedModelId(model.id);
    setDraft({
      name: model.name,
      displayName: model.display_name,
      gender: model.gender === "men" ? "men" : "women",
      category: model.category,
      height: model.height?.toString() ?? "",
      nationality: model.nationality ?? "",
      languages: model.languages.join(", "),
      bio: model.bio ?? "",
      status: model.status,
    });
    setPrimaryFile(null);
    setHoverFile(null);
    setNotice(null);
    const { data, error } = await client
      .from("media_assets")
      .select("*")
      .eq("owner_type", "model")
      .eq("owner_id", model.id)
      .order("sort_order");
    if (error) setNotice({ tone: "error", text: error.message });
    setMediaRows(data ?? []);
  };

  const newModel = () => {
    setSelectedModelId(null);
    setDraft(EMPTY_DRAFT);
    setMediaRows([]);
    setPrimaryFile(null);
    setHoverFile(null);
    setNotice(null);
  };

  const persistMedia = async (modelId: string, file: File, sortOrder: 0 | 1) => {
    const mime = file.type as ModelMediaMimeType;
    const extension = mime === "image/jpeg" ? "jpg" : mime === "image/png" ? "png" : "webp";
    const slot = sortOrder === 0 ? "primary" : "hover";
    const path = createModelMediaPath("models", modelId, `${slot}.${extension}`);
    const media = createModelMediaAdapter(client);
    const { error: uploadError } = await media.upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });
    if (uploadError) throw new Error(uploadError.message);

    const { data: existing, error: lookupError } = await client
      .from("media_assets")
      .select("id")
      .eq("owner_type", "model")
      .eq("owner_id", modelId)
      .eq("sort_order", sortOrder)
      .maybeSingle();
    if (lookupError) throw new Error(lookupError.message);
    if (existing) {
      const { error } = await client
        .from("media_assets")
        .update({ file_url: path, type: "image", visibility: "private" })
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await client.from("media_assets").insert({
        owner_type: "model",
        owner_id: modelId,
        file_url: path,
        type: "image",
        sort_order: sortOrder,
        visibility: "private",
      });
      if (error) throw new Error(error.message);
    }
  };

  const saveModel = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canEdit) return;
    const name = draft.name.trim();
    const displayName = draft.displayName.trim();
    const category = draft.category.trim();
    if (!name || !displayName || !category) {
      setNotice({ tone: "error", text: "Name, display name, and category are required." });
      return;
    }
    setSaving(true);
    setNotice(null);
    const payload = {
      name,
      display_name: displayName,
      gender: draft.gender,
      category,
      height: draft.height.trim() ? Number.parseInt(draft.height, 10) : null,
      nationality: draft.nationality.trim() || null,
      languages: draft.languages
        .split(",")
        .map((language) => language.trim())
        .filter(Boolean),
      bio: draft.bio.trim() || null,
      status: draft.status,
      measurements: {},
    };

    try {
      let saved: ModelRow | null = null;
      if (selectedModelId) {
        const { data, error } = await client
          .from("models")
          .update(payload)
          .eq("id", selectedModelId)
          .select()
          .single();
        if (error) throw new Error(error.message);
        saved = data;
      } else {
        const { data, error } = await client.from("models").insert(payload).select().single();
        if (error) throw new Error(error.message);
        saved = data;
      }
      if (!saved) throw new Error("The model record was not returned after save.");
      if (primaryFile) await persistMedia(saved.id, primaryFile, 0);
      if (hoverFile) await persistMedia(saved.id, hoverFile, 1);
      setSelectedModelId(saved.id);
      setPrimaryFile(null);
      setHoverFile(null);
      await loadModels();
      const { data: refreshedMedia } = await client
        .from("media_assets")
        .select("*")
        .eq("owner_type", "model")
        .eq("owner_id", saved.id)
        .order("sort_order");
      setMediaRows(refreshedMedia ?? []);
      setNotice({ tone: "success", text: "Model profile and selected photo frames saved." });
    } catch (error) {
      setNotice({
        tone: "error",
        text: error instanceof Error ? error.message : "Unable to save this model.",
      });
    } finally {
      setSaving(false);
    }
  };

  const previewPrimary = localPreviews.primary ?? remotePreviews.primary;
  const previewHover = localPreviews.hover ?? remotePreviews.hover;
  const pairCount = useMemo(
    () => models.filter((model) => model.status === "active").length,
    [models],
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-[1600px] px-5 py-6 md:px-10 md:py-10">
        <header className="flex flex-wrap items-end justify-between gap-6 border-b border-white/15 pb-7">
          <div>
            <p className="label-xs text-white/45">J&J / MODEL MANAGEMENT</p>
            <h1 className="mt-3 text-4xl font-light tracking-tight md:text-6xl">Admin workspace</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/55">
              Manage the first portrait and optional second hover frame for each profile. Files stay
              in the private model-media bucket and are written through the existing RLS boundary.
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-white/55">
            <span>{identity.email ?? "Authenticated user"}</span>
            <span className="border border-white/20 px-2 py-1 text-xs uppercase tracking-[0.18em]">
              {identity.role}
            </span>
            <button
              type="button"
              onClick={async () => {
                await createAuthAdapter(client).signOut();
                onSignedOut();
              }}
              className="label-xs text-white/70 hover:text-white"
            >
              Sign out
            </button>
          </div>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="space-y-5">
            <div className="grid grid-cols-2 gap-px border border-white/15 bg-white/15">
              <div className="bg-slate-950 p-4">
                <p className="label-xs text-white/45">Profiles</p>
                <p className="mt-2 text-3xl font-light">{models.length}</p>
              </div>
              <div className="bg-slate-950 p-4">
                <p className="label-xs text-white/45">Active</p>
                <p className="mt-2 text-3xl font-light">{pairCount}</p>
              </div>
            </div>
            {canEdit && (
              <button
                type="button"
                onClick={newModel}
                className="label-xs w-full border border-white/50 px-4 py-3 text-left hover:bg-white hover:text-slate-950"
              >
                + New model profile
              </button>
            )}
            <div className="border border-white/15">
              <div className="flex items-center justify-between border-b border-white/15 px-4 py-3">
                <p className="label-xs text-white/45">Profiles</p>
                <button
                  type="button"
                  onClick={() => void loadModels()}
                  className="text-xs text-white/45 hover:text-white"
                >
                  Refresh
                </button>
              </div>
              {loading ? (
                <p className="px-4 py-6 text-sm text-white/45">Loading profiles…</p>
              ) : models.length === 0 ? (
                <p className="px-4 py-6 text-sm leading-6 text-white/45">
                  No records yet. Create the first model profile to begin uploading media.
                </p>
              ) : (
                <ul>
                  {models.map((model) => (
                    <li key={model.id}>
                      <button
                        type="button"
                        onClick={() => void selectModel(model)}
                        className={`w-full border-b border-white/10 px-4 py-4 text-left transition-colors hover:bg-white/5 ${selectedModelId === model.id ? "bg-white/10" : ""}`}
                      >
                        <span className="block text-sm">{model.display_name}</span>
                        <span className="mt-1 block text-xs uppercase tracking-[0.16em] text-white/40">
                          {model.gender} / {model.category}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>

          <main>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="label-xs text-white/45">
                  {selectedModelId ? "EDIT PROFILE" : "NEW PROFILE"}
                </p>
                <h2 className="mt-2 text-3xl font-light">
                  {selectedModelId
                    ? draft.displayName || "Untitled profile"
                    : "Create a model profile"}
                </h2>
              </div>
              <Link to="/" className="label-xs text-white/45 hover:text-white">
                View public site ↗
              </Link>
            </div>
            {notice && (
              <div
                className={`mt-6 border p-4 text-sm ${notice.tone === "error" ? "border-red-300/30 bg-red-300/10 text-red-100" : "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"}`}
              >
                {notice.text}
              </div>
            )}

            <form onSubmit={saveModel} className="mt-7 space-y-8">
              <section className="border border-white/15 bg-white/[0.03] p-5 md:p-7">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    label="Slug / internal name"
                    value={draft.name}
                    disabled={!canEdit}
                    onChange={(value) => setDraft((current) => ({ ...current, name: value }))}
                    placeholder="chen-yu-xin"
                  />
                  <Field
                    label="Display name"
                    value={draft.displayName}
                    disabled={!canEdit}
                    onChange={(value) =>
                      setDraft((current) => ({ ...current, displayName: value }))
                    }
                    placeholder="Chen Yu-Xin"
                  />
                  <label className="block text-sm text-white/65">
                    Gender
                    <select
                      value={draft.gender}
                      disabled={!canEdit}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          gender: event.target.value as ModelGender,
                        }))
                      }
                      className="mt-2 w-full border border-white/20 bg-slate-950 px-3 py-3 text-white outline-none focus:border-white/60"
                    >
                      <option value="women">Women</option>
                      <option value="men">Men</option>
                    </select>
                  </label>
                  <Field
                    label="Category"
                    value={draft.category}
                    disabled={!canEdit}
                    onChange={(value) => setDraft((current) => ({ ...current, category: value }))}
                    placeholder="Editorial"
                  />
                  <Field
                    label="Height (cm)"
                    value={draft.height}
                    disabled={!canEdit}
                    onChange={(value) => setDraft((current) => ({ ...current, height: value }))}
                    placeholder="178"
                    type="number"
                  />
                  <Field
                    label="Nationality / market"
                    value={draft.nationality}
                    disabled={!canEdit}
                    onChange={(value) =>
                      setDraft((current) => ({ ...current, nationality: value }))
                    }
                    placeholder="Taiwan"
                  />
                  <Field
                    label="Languages (comma separated)"
                    value={draft.languages}
                    disabled={!canEdit}
                    onChange={(value) => setDraft((current) => ({ ...current, languages: value }))}
                    placeholder="Mandarin, English"
                  />
                  <label className="block text-sm text-white/65">
                    Status
                    <select
                      value={draft.status}
                      disabled={!canEdit}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          status: event.target.value as ModelStatus,
                        }))
                      }
                      className="mt-2 w-full border border-white/20 bg-slate-950 px-3 py-3 text-white outline-none focus:border-white/60"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="archived">Archived</option>
                    </select>
                  </label>
                </div>
                <label className="mt-5 block text-sm text-white/65">
                  Bio
                  <textarea
                    value={draft.bio}
                    disabled={!canEdit}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, bio: event.target.value }))
                    }
                    rows={4}
                    className="mt-2 w-full resize-y border border-white/20 bg-slate-950 px-3 py-3 text-white outline-none focus:border-white/60"
                    placeholder="Short casting and editorial notes"
                  />
                </label>
              </section>

              <section className="border border-white/15 bg-white/[0.03] p-5 md:p-7">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="label-xs text-white/45">MEDIA PAIR</p>
                    <h3 className="mt-2 text-2xl font-light">Primary + hover frame</h3>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">
                      The primary image is sort order 0. The optional second pose is sort order 1.
                      Both use the same fixed card geometry on the public surface; files are cropped
                      with cover rather than letterboxed.
                    </p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.16em] text-white/40">
                    JPG / PNG / WEBP · 50 MB max
                  </span>
                </div>
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <UploadSlot
                    label="01 / Primary profile photo"
                    hint="Shown before hover"
                    preview={previewPrimary}
                    disabled={!canEdit}
                    onFile={setPrimaryFile}
                  />
                  <UploadSlot
                    label="02 / Hover photo (optional)"
                    hint="Shown after hover when uploaded"
                    preview={previewHover}
                    disabled={!canEdit}
                    onFile={setHoverFile}
                  />
                </div>
              </section>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6">
                <p className="max-w-xl text-xs leading-6 text-white/40">
                  Saving writes only through authenticated client calls. Admin can delete records
                  later; Editor can create and update profiles and media.
                </p>
                {canEdit && (
                  <button
                    type="submit"
                    disabled={saving}
                    className="label-xs bg-white px-6 py-4 text-slate-950 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save profile + media"}
                  </button>
                )}
              </div>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
}) {
  return (
    <label className="block text-sm text-white/65">
      {label}
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full border border-white/20 bg-slate-950 px-3 py-3 text-white outline-none placeholder:text-white/25 focus:border-white/60 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </label>
  );
}

function UploadSlot({
  label,
  hint,
  preview,
  disabled,
  onFile,
}: {
  label: string;
  hint: string;
  preview: string | undefined;
  disabled: boolean;
  onFile: (file: File | null) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm text-white/80">{label}</p>
        <span className="text-xs text-white/35">{hint}</span>
      </div>
      <label
        className={`mt-3 block overflow-hidden border border-dashed border-white/25 bg-black/20 ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-white/65"}`}
      >
        <div className="aspect-[3/4] w-full">
          {preview ? (
            <img
              src={preview}
              alt="Selected model media preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-center text-sm leading-6 text-white/35">
              Choose a portrait that fills the frame.
              <br />
              No black matte or baked borders.
            </div>
          )}
        </div>
        <div className="border-t border-white/15 px-4 py-3 text-xs uppercase tracking-[0.16em] text-white/50">
          {preview ? "Replace file" : "Choose image"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={disabled}
            className="sr-only"
            onChange={(event) => onFile(event.target.files?.[0] ?? null)}
          />
        </div>
      </label>
    </div>
  );
}
