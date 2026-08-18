import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createAuthAdapter, type AuthIdentity } from "@/lib/supabase/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  createModelMediaAdapter,
  createModelMediaPath,
  type ModelMediaMimeType,
} from "@/lib/supabase/media";
import type { Database } from "@/lib/supabase/database.types";
import { seedKeywords, normalizeStoredTags } from "@/lib/content/keywords";
import { MODEL_CATEGORY_OPTIONS, normalizeModelCategory } from "@/lib/content/modelCategories";
import { NEWS_TAGS, searchNewsTags, type NewsTag } from "@/lib/content/newsTags";
import { canonicalYouTubeUrl } from "@/lib/content/media";
import { englishFromChinese } from "@/lib/i18n/translationAdapter";
import { PUBLIC_MEDIA_SLOTS, slotHint } from "@/lib/content/mediaSlots";
import { assertAllowedModelMedia } from "@/lib/supabase/media";

type ModelRow = Database["public"]["Tables"]["models"]["Row"];
type MediaRow = Database["public"]["Tables"]["media_assets"]["Row"];
type VideoLinkRow = Database["public"]["Tables"]["model_video_links"]["Row"];
type SocialLinkRow = Database["public"]["Tables"]["model_social_links"]["Row"];
type ModelStatus = ModelRow["status"];
type ModelGender = "women" | "men";
type ModelBoard = "women" | "men" | "new-faces" | "talent";

type ModelDraft = {
  slug: string;
  name: string;
  displayName: string;
  nameZh: string;
  gender: ModelGender;
  board: ModelBoard;
  category: string;
  city: string;
  cityZh: string;
  height: string;
  nationality: string;
  languages: string;
  bioEn: string;
  bioZh: string;
  weight: string;
  bust: string;
  waist: string;
  hips: string;
  shoes: string;
  hair: string;
  hairZh: string;
  eyes: string;
  eyesZh: string;
  tags: string;
  featured: boolean;
  status: ModelStatus;
};

type Notice = { tone: "error" | "success"; text: string };
type WorkspaceUser = {
  id: string;
  email: string | null;
  role: "admin" | "editor" | "viewer";
  created_at: string;
  last_sign_in_at: string | null;
  confirmed_at: string | null;
};
type AccessState = "loading" | "config" | "signed-out" | "forbidden" | "ready";
type PreviewState = { primary: string | undefined; hover: string | undefined };
type AdminSection = "models" | "inbox" | "about" | "news" | "knowledge" | "access";
type OperationsSection = Exclude<AdminSection, "models">;

const EMPTY_DRAFT: ModelDraft = {
  slug: "",
  name: "",
  displayName: "",
  nameZh: "",
  gender: "women",
  board: "women",
  category: "editorial",
  city: "",
  cityZh: "",
  height: "",
  nationality: "",
  languages: "Mandarin, English",
  bioEn: "",
  bioZh: "",
  weight: "",
  bust: "",
  waist: "",
  hips: "",
  shoes: "",
  hair: "",
  hairZh: "",
  eyes: "",
  eyesZh: "",
  tags: "",
  featured: false,
  status: "active",
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function invalidatePublicContent(queryClient: ReturnType<typeof useQueryClient>) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["board"] }),
    queryClient.invalidateQueries({ queryKey: ["model"] }),
    queryClient.invalidateQueries({ queryKey: ["home"] }),
    queryClient.invalidateQueries({ queryKey: ["keyword"] }),
    queryClient.invalidateQueries({ queryKey: ["news"] }),
    queryClient.invalidateQueries({ queryKey: ["site-settings"] }),
  ]);
}

function readJsonString(
  record: Database["public"]["Tables"]["models"]["Row"]["stats"],
  key: string,
) {
  if (!record || typeof record !== "object" || Array.isArray(record)) return "";
  const value = (record as Record<string, unknown>)[key];
  return value == null ? "" : String(value);
}

const SOCIAL_PLATFORMS = [
  ["instagram", "Instagram"],
  ["tiktok", "TikTok"],
  ["youtube", "YouTube"],
  ["facebook", "Facebook"],
  ["x", "X"],
  ["website", "Website"],
  ["other", "Other"],
] as const;

export const Route = createFileRoute("/admin")({ component: AdminRoute });

function AdminRoute() {
  const [client, setClient] = useState<SupabaseClient<Database> | null>(null);
  const [identity, setIdentity] = useState<AuthIdentity | null>(null);
  const [access, setAccess] = useState<AccessState>("loading");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [passwordSetup, setPasswordSetup] = useState(false);
  const handleSignedOut = useCallback(() => {
    setIdentity(null);
    setAccess("signed-out");
  }, []);

  useEffect(() => {
    let disposed = false;
    let unsubscribe: (() => void) | undefined;

    try {
      const nextClient = getSupabaseBrowserClient();
      setClient(nextClient);
      const recoveryHash = new URLSearchParams(window.location.hash.slice(1)).get("type");
      const recoveryType = recoveryHash ?? new URLSearchParams(window.location.search).get("type");
      const searchParams = new URLSearchParams(window.location.search);
      const recoveryQuery = searchParams.get("reset");
      const resetError = searchParams.get("reset_error");
      if (resetError) {
        setNotice({
          tone: "error",
          text:
            resetError === "otp_expired" || resetError === "invite_expired"
              ? "This password link has expired or was already used. Enter your email below to request a fresh link."
              : "This password link is invalid. Enter your email below to request a fresh link.",
        });
      }
      setPasswordSetup(
        !resetError &&
          (recoveryType === "recovery" || recoveryType === "invite" || recoveryQuery === "1"),
      );
      const auth = createAuthAdapter(nextClient);

      const refreshIdentity = async () => {
        const { data, error } = await auth.getIdentity();
        if (disposed) return;
        if (error) {
          setIdentity(null);
          if (!/session missing/i.test(error.message)) {
            setNotice({ tone: "error", text: error.message });
          }
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
      unsubscribe = auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY") setPasswordSetup(true);
        void refreshIdentity();
      }).unsubscribe;
      const revalidate = () => {
        if (document.visibilityState === "hidden") return;
        void refreshIdentity();
      };
      window.addEventListener("focus", revalidate);
      document.addEventListener("visibilitychange", revalidate);

      return () => {
        disposed = true;
        unsubscribe?.();
        window.removeEventListener("focus", revalidate);
        document.removeEventListener("visibilitychange", revalidate);
      };
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
  if (passwordSetup && client) {
    return (
      <AdminPasswordSetup
        client={client}
        onComplete={() => {
          setPasswordSetup(false);
          setIdentity(null);
          setAccess("signed-out");
          setNotice({
            tone: "success",
            text: "Password updated. Sign in with your new password.",
          });
        }}
        onExpired={() => {
          window.history.replaceState({}, "", "/admin");
          setPasswordSetup(false);
          setNotice({
            tone: "error",
            text: "Request a new password link below. The old link cannot be reused.",
          });
        }}
      />
    );
  }
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
  return <AdminDashboard client={client} identity={identity} onSignedOut={handleSignedOut} />;
}

function AdminPasswordSetup({
  client,
  onComplete,
  onExpired,
}: {
  client: SupabaseClient<Database>;
  onComplete: () => void;
  onExpired: () => void;
}) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Notice | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmation) {
      setMessage({ tone: "error", text: "Passwords do not match." });
      return;
    }
    setBusy(true);
    setMessage(null);
    const { error } = await createAuthAdapter(client).updatePassword(password);
    if (error) {
      const expired = /expired|invalid|session|token/i.test(error.message);
      setMessage({
        tone: "error",
        text: expired
          ? "This password link is expired or invalid. Request a new link from the sign-in screen."
          : error.message,
      });
      if (expired) onExpired();
    } else {
      window.history.replaceState({}, "", "/admin");
      await createAuthAdapter(client).signOut();
      setMessage({
        tone: "success",
        text: "Password updated. You can now sign in to the workspace.",
      });
      setPassword("");
      setConfirmation("");
      onComplete();
    }
    setBusy(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="w-full max-w-md border border-white/15 bg-white/5 p-8">
        <p className="label-xs text-white/50">J&J / ADMIN</p>
        <h1 className="mt-4 text-3xl font-light">Set your workspace password</h1>
        <p className="mt-4 text-sm leading-7 text-white/65">
          Use a new password that meets the workspace policy. Supabase Auth validates the configured
          minimum and character requirements when you save it.
        </p>
        <form className="mt-8 space-y-5" onSubmit={submit}>
          <label className="block text-sm text-white/70">
            New password
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete="new-password"
              required
              className="mt-2 w-full border border-white/20 bg-black/20 px-3 py-3 text-white outline-none focus:border-white/60"
            />
          </label>
          <label className="block text-sm text-white/70">
            Confirm password
            <input
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              type="password"
              autoComplete="new-password"
              required
              className="mt-2 w-full border border-white/20 bg-black/20 px-3 py-3 text-white outline-none focus:border-white/60"
            />
          </label>
          {message && (
            <p
              className={
                message.tone === "error"
                  ? "border border-red-300/30 bg-red-300/10 p-3 text-sm text-red-100"
                  : "border border-emerald-300/30 bg-emerald-300/10 p-3 text-sm text-emerald-100"
              }
            >
              {message.text}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="label-xs w-full bg-white px-4 py-3 text-slate-950 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Updating…" : "Set password"}
          </button>
          <button
            type="button"
            onClick={onExpired}
            className="w-full text-center text-xs text-white/55 underline underline-offset-4 hover:text-white"
          >
            Request a new link
          </button>
        </form>
      </div>
    </div>
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
  const [resetSent, setResetSent] = useState(false);

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

  const sendReset = async () => {
    if (!client || !email.trim()) {
      setError("Enter your email first.");
      return;
    }
    setBusy(true);
    setError(null);
    setResetSent(false);
    const { error: resetError } = await createAuthAdapter(client).resetPasswordForEmail(
      email.trim(),
      `${window.location.origin}/admin?reset=1`,
    );
    if (resetError) setError(resetError.message);
    else setResetSent(true);
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
          <button
            type="button"
            onClick={() => void sendReset()}
            disabled={busy || !client}
            className="w-full text-center text-xs text-white/55 underline underline-offset-4 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Forgot password / first-time setup
          </button>
          {resetSent && (
            <p className="border border-emerald-300/30 bg-emerald-300/10 p-3 text-sm text-emerald-100">
              Check your email for a secure password setup link.
            </p>
          )}
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
  const queryClient = useQueryClient();
  const canEdit = identity.role === "admin" || identity.role === "editor";
  const [activeSection, setActiveSection] = useState<AdminSection>("models");
  const [models, setModels] = useState<ModelRow[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ModelDraft>(EMPTY_DRAFT);
  const bioEnManualRef = useRef(false);
  const [primaryFile, setPrimaryFile] = useState<File | null>(null);
  const [hoverFile, setHoverFile] = useState<File | null>(null);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [mediaRows, setMediaRows] = useState<MediaRow[]>([]);
  const [videoLinks, setVideoLinks] = useState<VideoLinkRow[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLinkRow[]>([]);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [socialPlatform, setSocialPlatform] = useState("instagram");
  const [socialLabel, setSocialLabel] = useState("");
  const [socialUrl, setSocialUrl] = useState("");
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
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [previousModelId, setPreviousModelId] = useState<string | null>(null);

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

  const loadRelations = useCallback(
    async (modelId: string) => {
      const [mediaResult, videosResult, socialResult] = await Promise.all([
        client
          .from("media_assets")
          .select("*")
          .eq("owner_type", "model")
          .eq("owner_id", modelId)
          .order("sort_order"),
        client.from("model_video_links").select("*").eq("model_id", modelId).order("sort_order"),
        client.from("model_social_links").select("*").eq("model_id", modelId).order("sort_order"),
      ]);
      const firstError = mediaResult.error ?? videosResult.error ?? socialResult.error;
      if (firstError) setNotice({ tone: "error", text: firstError.message });
      setMediaRows(mediaResult.data ?? []);
      setVideoLinks(videosResult.data ?? []);
      setSocialLinks(socialResult.data ?? []);
    },
    [client],
  );

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
    bioEnManualRef.current = false;
  }, [selectedModelId, createModalOpen]);

  useEffect(() => {
    if (!canEdit) return;
    const zh = draft.bioZh.trim();
    if (!zh || bioEnManualRef.current) return;

    const timer = window.setTimeout(() => {
      void englishFromChinese(zh, "").then((translated) => {
        if (!bioEnManualRef.current && translated) {
          setDraft((current) => ({ ...current, bioEn: translated }));
        }
      });
    }, 700);

    return () => window.clearTimeout(timer);
  }, [canEdit, draft.bioZh]);

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
    setCreateModalOpen(false);
    setPreviousModelId(null);
    setSelectedModelId(model.id);
    const heightStat = readJsonString(model.stats, "height").replace(/\s*cm$/i, "");
    setDraft({
      slug: model.slug,
      name: model.name,
      displayName: model.display_name,
      nameZh: model.name_zh ?? "",
      gender: model.gender === "men" ? "men" : "women",
      board: (model.board as ModelBoard) ?? (model.gender === "men" ? "men" : "women"),
      category: normalizeModelCategory(model.category),
      city: model.city ?? "",
      cityZh: model.city_zh ?? "",
      height: model.height?.toString() ?? heightStat,
      nationality: model.nationality ?? "",
      languages: model.languages.join(", "),
      bioEn: model.bio_en ?? model.bio ?? "",
      bioZh: model.bio_zh ?? "",
      weight: readJsonString(model.stats, "weight"),
      bust: readJsonString(model.stats, "bust"),
      waist: readJsonString(model.stats, "waist"),
      hips: readJsonString(model.stats, "hips"),
      shoes: readJsonString(model.stats, "shoes"),
      hair: readJsonString(model.stats, "hair"),
      hairZh: readJsonString(model.stats, "hairZh"),
      eyes: readJsonString(model.stats, "eyes"),
      eyesZh: readJsonString(model.stats, "eyesZh"),
      tags: model.tags.join(", "),
      featured: model.featured,
      status: model.status,
    });
    setPrimaryFile(null);
    setHoverFile(null);
    setAdditionalFiles([]);
    setVideoTitle("");
    setVideoUrl("");
    setSocialLabel("");
    setSocialUrl("");
    setNotice(null);
    await loadRelations(model.id);
  };

  const newModel = () => {
    setPreviousModelId(selectedModelId);
    setSelectedModelId(null);
    setDraft(EMPTY_DRAFT);
    setMediaRows([]);
    setVideoLinks([]);
    setSocialLinks([]);
    setPrimaryFile(null);
    setHoverFile(null);
    setAdditionalFiles([]);
    setNotice(null);
    setCreateModalOpen(true);
  };

  const cancelNewModel = () => {
    setCreateModalOpen(false);
    setPrimaryFile(null);
    setHoverFile(null);
    setAdditionalFiles([]);
    setNotice(null);
    const previous = previousModelId ? models.find((model) => model.id === previousModelId) : null;
    setPreviousModelId(null);
    if (previous) {
      void selectModel(previous);
    } else {
      setSelectedModelId(null);
      setDraft(EMPTY_DRAFT);
      setMediaRows([]);
      setVideoLinks([]);
      setSocialLinks([]);
    }
  };

  useEffect(() => {
    if (!createModalOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [createModalOpen]);

  const persistMedia = async (modelId: string, file: File, sortOrder: number, replace = false) => {
    assertAllowedModelMedia(file);
    const mime = file.type as ModelMediaMimeType;
    const extension =
      mime === "image/jpeg"
        ? "jpg"
        : mime === "image/png"
          ? "png"
          : mime === "video/mp4"
            ? "mp4"
            : "webp";
    const slot =
      sortOrder === 0
        ? "primary"
        : sortOrder === 1
          ? "hover"
          : `gallery-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const path = createModelMediaPath("models", modelId, `${slot}.${extension}`);
    const mediaType = mime === "video/mp4" ? "video" : "image";
    const media = createModelMediaAdapter(client);
    const { error: uploadError } = await media.upload(path, file, {
      cacheControl: "3600",
      upsert: replace,
    });
    if (uploadError) throw new Error(uploadError.message);

    if (replace) {
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
          .update({ file_url: path, type: mediaType, visibility: "public" })
          .eq("id", existing.id);
        if (error) throw new Error(error.message);
        return;
      }
    }

    {
      const { error } = await client.from("media_assets").insert({
        owner_type: "model",
        owner_id: modelId,
        file_url: path,
        type: mediaType,
        sort_order: sortOrder,
        visibility: "public",
      });
      if (error) throw new Error(error.message);
    }
  };

  const addVideoLink = async () => {
    if (!canEdit || !selectedModelId) {
      setNotice({ tone: "error", text: "Save the model profile before adding links." });
      return;
    }
    const title = videoTitle.trim();
    const url = canonicalYouTubeUrl(videoUrl);
    if (!title || !url) {
      setNotice({
        tone: "error",
        text: "Enter a title and a valid YouTube URL (watch, youtu.be, Shorts, or mobile).",
      });
      return;
    }
    const { error } = await client.from("model_video_links").insert({
      model_id: selectedModelId,
      title,
      youtube_url: url,
      sort_order: videoLinks.length,
    });
    if (error) {
      setNotice({ tone: "error", text: error.message });
      return;
    }
    setVideoTitle("");
    setVideoUrl("");
    await loadRelations(selectedModelId);
    await invalidatePublicContent(queryClient);
    setNotice({ tone: "success", text: "YouTube link added." });
  };

  const addSocialLink = async () => {
    if (!canEdit || !selectedModelId) {
      setNotice({ tone: "error", text: "Save the model profile before adding links." });
      return;
    }
    const url = socialUrl.trim();
    if (!url.startsWith("https://")) {
      setNotice({ tone: "error", text: "Social links must use HTTPS." });
      return;
    }
    const platform = socialPlatform as SocialLinkRow["platform"];
    const { error } = await client.from("model_social_links").insert({
      model_id: selectedModelId,
      platform,
      label: socialLabel.trim() || platform,
      url,
      sort_order: socialLinks.length,
    });
    if (error) {
      setNotice({ tone: "error", text: error.message });
      return;
    }
    setSocialLabel("");
    setSocialUrl("");
    await loadRelations(selectedModelId);
    setNotice({ tone: "success", text: "Social link added." });
  };

  const deleteVideoLink = async (id: string) => {
    if (identity.role !== "admin") return;
    const { error } = await client.from("model_video_links").delete().eq("id", id);
    if (error) setNotice({ tone: "error", text: error.message });
    else if (selectedModelId) await loadRelations(selectedModelId);
  };

  const deleteSocialLink = async (id: string) => {
    if (identity.role !== "admin") return;
    const { error } = await client.from("model_social_links").delete().eq("id", id);
    if (error) setNotice({ tone: "error", text: error.message });
    else if (selectedModelId) await loadRelations(selectedModelId);
  };

  const deleteMedia = async (row: MediaRow) => {
    if (identity.role !== "admin") return;
    const media = createModelMediaAdapter(client);
    const { error: storageError } = await media.remove([row.file_url]);
    if (storageError) {
      setNotice({ tone: "error", text: storageError.message });
      return;
    }
    const { error } = await client.from("media_assets").delete().eq("id", row.id);
    if (error) setNotice({ tone: "error", text: error.message });
    else if (selectedModelId) await loadRelations(selectedModelId);
  };

  const saveModel = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canEdit) return;
    const creating = !selectedModelId;
    const nameZh = draft.nameZh.trim();
    const name = (draft.name.trim() || (await englishFromChinese(nameZh)) || nameZh).trim();
    const displayName = (
      draft.displayName.trim() ||
      (await englishFromChinese(nameZh)) ||
      name
    ).trim();
    const category = normalizeModelCategory(draft.category.trim() || draft.board);
    if (!nameZh) {
      setNotice({ tone: "error", text: "請先填寫繁體中文姓名。" });
      return;
    }
    if (!name || !displayName || !category) {
      setNotice({ tone: "error", text: "Name, display name, and category are required." });
      return;
    }
    const slug = slugify(draft.slug || name) || `model-${Date.now().toString(36)}`;
    setSaving(true);
    setNotice(null);
    const height = draft.height.trim() ? Number.parseInt(draft.height, 10) : null;
    const stats = {
      height: height ? `${height} cm` : "",
      weight: draft.weight.trim(),
      bust: draft.bust.trim(),
      waist: draft.waist.trim(),
      hips: draft.hips.trim(),
      shoes: draft.shoes.trim(),
      hair: draft.hair.trim(),
      hairZh: draft.hairZh.trim(),
      eyes: draft.eyes.trim(),
      eyesZh: draft.eyesZh.trim(),
    };
    const measurements = {
      bust: draft.bust.trim(),
      waist: draft.waist.trim(),
      hips: draft.hips.trim(),
    };
    const cityZh = draft.cityZh.trim();
    const bioZh = draft.bioZh.trim();
    const tags = normalizeStoredTags([...draft.tags.split(","), draft.board, draft.gender]);
    const payload = {
      slug,
      name,
      display_name: displayName,
      name_zh: nameZh || null,
      gender: draft.gender,
      board: draft.board,
      category,
      city: (await englishFromChinese(cityZh, draft.city)) || cityZh || null,
      city_zh: cityZh || null,
      height,
      nationality: draft.nationality.trim() || null,
      languages: draft.languages
        .split(",")
        .map((language) => language.trim())
        .filter(Boolean),
      bio: bioZh || draft.bioEn.trim() || null,
      bio_en: (await englishFromChinese(bioZh, draft.bioEn)) || null,
      bio_zh: bioZh || null,
      featured: draft.featured,
      tags,
      stats,
      measurements,
      status: draft.status,
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
      if (primaryFile) await persistMedia(saved.id, primaryFile, 0, true);
      if (hoverFile) await persistMedia(saved.id, hoverFile, 1, true);
      let nextSortOrder = Math.max(1, ...mediaRows.map((media) => media.sort_order)) + 1;
      for (const file of additionalFiles) {
        await persistMedia(saved.id, file, nextSortOrder);
        nextSortOrder += 1;
      }
      setSelectedModelId(saved.id);
      setPreviousModelId(null);
      if (creating) setCreateModalOpen(false);
      setPrimaryFile(null);
      setHoverFile(null);
      setAdditionalFiles([]);
      await loadModels();
      await loadRelations(saved.id);
      await invalidatePublicContent(queryClient);
      setNotice({
        tone: draft.status === "active" ? "success" : "error",
        text:
          draft.status === "active"
            ? "Model profile and selected media saved. It is public after the frontend refreshes."
            : "Model profile saved as inactive. Change Status to Active and save again before it can appear on public boards.",
      });
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
  const isCreating = !selectedModelId;
  const adminSections: Array<readonly [AdminSection, string, string]> = [
    ["models", "模特檔案", "Models"],
    ["inbox", "需求收件匣", "Inbox"],
    ["about", "關於我們", "About"],
    ["news", "新聞", "News"],
    ["knowledge", "JAgent 知識庫", "JAgent RAG"],
    ...(identity.role === "admin" ? [["access", "管理員與協作者", "Access"] as const] : []),
  ];

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
          <div className="flex flex-wrap items-center justify-end gap-3 text-sm text-white/55">
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

        <nav
          aria-label="Admin sections"
          className="mt-6 flex flex-wrap gap-2 border-y border-white/15 py-3"
        >
          {adminSections.map(([value, label, english]) => (
            <button
              key={value}
              type="button"
              aria-current={activeSection === value ? "page" : undefined}
              onClick={() => setActiveSection(value)}
              className={`px-4 py-3 text-left text-xs tracking-[0.1em] transition-colors ${
                activeSection === value
                  ? "bg-white text-slate-950"
                  : "border border-white/20 text-white/65 hover:border-white/60 hover:text-white"
              }`}
            >
              <span className="block">{label}</span>
              <span className="mt-1 block text-[10px] tracking-normal opacity-60">{english}</span>
            </button>
          ))}
        </nav>

        <div
          className={`mt-8 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] ${activeSection === "models" ? "" : "hidden"}`}
        >
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
                aria-label="新增模特檔案 / New model profile"
                className="label-xs w-full border border-white/50 px-4 py-3 text-left hover:bg-white hover:text-slate-950"
              >
                ＋ 新增模特檔案
                <span className="mt-1 block text-[10px] normal-case tracking-normal text-white/45">
                  New model profile
                </span>
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
                          {model.gender} / {model.category} / {model.status}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>

          {createModalOpen && (
            <div className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm" aria-hidden="true" />
          )}
          <main
            role={createModalOpen ? "dialog" : undefined}
            aria-modal={createModalOpen ? true : undefined}
            aria-labelledby={createModalOpen ? "new-model-dialog-title" : undefined}
            className={
              createModalOpen
                ? "fixed inset-4 z-50 overflow-y-auto border border-white/20 bg-slate-950 p-5 shadow-2xl md:inset-8 md:p-8"
                : !selectedModelId
                  ? "hidden"
                  : undefined
            }
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="label-xs text-white/45">
                  {selectedModelId ? "EDIT PROFILE" : "NEW PROFILE / 新增檔案"}
                </p>
                <h2
                  id={createModalOpen ? "new-model-dialog-title" : undefined}
                  className="mt-2 text-3xl font-light"
                >
                  {selectedModelId
                    ? draft.displayName || "Untitled profile"
                    : "新增模特檔案 / Create a model profile"}
                </h2>
              </div>
              <div className="flex items-center gap-4">
                {createModalOpen && (
                  <button
                    type="button"
                    onClick={cancelNewModel}
                    className="label-xs border border-white/35 px-4 py-3 text-white/70 hover:border-white hover:text-white"
                  >
                    取消新增
                  </button>
                )}
                <Link to="/" className="label-xs text-white/45 hover:text-white">
                  View public site ↗
                </Link>
              </div>
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
                    label="繁體中文姓名（必填，前台主顯示）"
                    value={draft.nameZh}
                    disabled={!canEdit}
                    onChange={(value) => setDraft((current) => ({ ...current, nameZh: value }))}
                    placeholder="陳妤欣"
                  />
                  <Field
                    label="Public slug（可留空自動產生）"
                    value={draft.slug}
                    disabled={!canEdit}
                    onChange={(value) => setDraft((current) => ({ ...current, slug: value }))}
                    placeholder="chen-yu-xin"
                  />
                  <Field
                    label="城市／市場（繁中）"
                    value={draft.cityZh}
                    disabled={!canEdit}
                    onChange={(value) => setDraft((current) => ({ ...current, cityZh: value }))}
                    placeholder="台北"
                  />
                  <label className="block text-sm text-white/65">
                    類目 Category
                    <select
                      value={
                        MODEL_CATEGORY_OPTIONS.some((option) => option.value === draft.category)
                          ? draft.category
                          : normalizeModelCategory(draft.category)
                      }
                      disabled={!canEdit}
                      onChange={(event) =>
                        setDraft((current) => ({ ...current, category: event.target.value }))
                      }
                      className="mt-2 w-full border border-white/20 bg-slate-950 px-3 py-3 text-white outline-none focus:border-white/60"
                    >
                      {MODEL_CATEGORY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
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
                  <label className="block text-sm text-white/65">
                    Public board
                    <select
                      value={draft.board}
                      disabled={!canEdit}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          board: event.target.value as ModelBoard,
                        }))
                      }
                      className="mt-2 w-full border border-white/20 bg-slate-950 px-3 py-3 text-white outline-none focus:border-white/60"
                    >
                      <option value="women">Women / 女模</option>
                      <option value="men">Men / 男模</option>
                      <option value="new-faces">New Faces / 新面孔</option>
                      <option value="talent">Talent / 藝人</option>
                    </select>
                  </label>
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
                    狀態 Status（Active＝前台可見；Inactive / Archived＝下架）
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
                      <option value="active">Active / 上架</option>
                      <option value="inactive">Inactive / 下架</option>
                      <option value="archived">Archived / 封存</option>
                    </select>
                  </label>
                  <label className="flex items-center gap-3 self-end pb-3 text-sm text-white/65">
                    <input
                      type="checkbox"
                      checked={draft.featured}
                      disabled={!canEdit}
                      onChange={(event) =>
                        setDraft((current) => ({ ...current, featured: event.target.checked }))
                      }
                      className="h-4 w-4 accent-white"
                    />
                    首頁精選區顯示（不控制上下架；上下架請改 Status）
                  </label>
                </div>
                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <label className="block text-sm text-white/65">
                    個人簡介（繁中，前台主文）
                    <textarea
                      value={draft.bioZh}
                      disabled={!canEdit}
                      onChange={(event) => {
                        bioEnManualRef.current = false;
                        setDraft((current) => ({ ...current, bioZh: event.target.value }));
                      }}
                      rows={5}
                      className="mt-2 w-full resize-y border border-white/20 bg-slate-950 px-3 py-3 text-white outline-none focus:border-white/60"
                      placeholder="模特簡介、工作經驗與風格描述"
                    />
                  </label>
                  <label className="block text-sm text-white/65">
                    English bio（可手動修改；前台 EN 會自動翻譯中文）
                    <textarea
                      value={draft.bioEn}
                      disabled={!canEdit}
                      onChange={(event) => {
                        bioEnManualRef.current = true;
                        setDraft((current) => ({ ...current, bioEn: event.target.value }));
                      }}
                      rows={5}
                      className="mt-2 w-full resize-y border border-white/20 bg-slate-950 px-3 py-3 text-white outline-none focus:border-white/60"
                      placeholder="Auto-translated from Chinese; edit if needed"
                    />
                  </label>
                </div>
                <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                  {(
                    [
                      ["Weight", "weight", "58 kg"],
                      ["Bust", "bust", "82 cm"],
                      ["Waist", "waist", "60 cm"],
                      ["Hips", "hips", "88 cm"],
                      ["Shoes", "shoes", "24 cm"],
                      ["Hair (English)", "hair", "Black"],
                      ["髮色（繁中）", "hairZh", "黑色"],
                      ["Eyes (English)", "eyes", "Brown"],
                      ["眼睛（繁中）", "eyesZh", "棕色"],
                    ] as const
                  ).map(([label, key, placeholder]) => (
                    <Field
                      key={key}
                      label={label}
                      value={draft[key]}
                      disabled={!canEdit}
                      onChange={(value) => setDraft((current) => ({ ...current, [key]: value }))}
                      placeholder={placeholder}
                    />
                  ))}
                </div>
                <div className="mt-5">
                  <p className="text-sm text-white/65">公開標籤（對應 /keywords 頁面）</p>
                  <p className="mt-1 text-xs text-white/40">
                    勾選 Editorial / Beauty / Runway 才會出現在對應關鍵字頁，例如
                    <code className="mx-1 text-white/55">/keywords/editorial-model</code>、
                    <code className="mx-1 text-white/55">/keywords/beauty</code>、
                    <code className="text-white/55">/keywords/runway</code>
                    。儲存時會寫入 canonical slug。
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {seedKeywords
                      .filter((keyword) => keyword.active)
                      .map((keyword) => {
                        const selected = normalizeStoredTags(draft.tags.split(",")).includes(
                          keyword.slug,
                        );
                        return (
                          <label
                            key={keyword.slug}
                            className={`inline-flex items-center gap-2 border px-3 py-2 text-xs ${selected ? "border-white bg-white text-slate-950" : "border-white/20 text-white/70"}`}
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              disabled={!canEdit}
                              onChange={() => {
                                const current = new Set(normalizeStoredTags(draft.tags.split(",")));
                                if (current.has(keyword.slug)) current.delete(keyword.slug);
                                else current.add(keyword.slug);
                                setDraft((draftState) => ({
                                  ...draftState,
                                  tags: [...current].join(", "),
                                }));
                              }}
                              className="h-3.5 w-3.5 accent-white"
                            />
                            {keyword.labelZh} / {keyword.labelEn}
                          </label>
                        );
                      })}
                  </div>
                </div>
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
                    JPG / PNG / WEBP · {slotHint(PUBLIC_MEDIA_SLOTS.modelCard)}
                  </span>
                </div>
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <UploadSlot
                    label="01 / Primary profile photo"
                    hint={slotHint(PUBLIC_MEDIA_SLOTS.modelCard)}
                    preview={previewPrimary}
                    disabled={!canEdit}
                    onFile={setPrimaryFile}
                  />
                  <UploadSlot
                    label="02 / Hover photo (optional, D-025)"
                    hint={slotHint(PUBLIC_MEDIA_SLOTS.modelCard)}
                    preview={previewHover}
                    disabled={!canEdit}
                    onFile={setHoverFile}
                  />
                </div>
              </section>

              <section className="border border-white/15 bg-white/[0.03] p-5 md:p-7">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="label-xs text-white/45">GALLERY / UNLIMITED MEDIA</p>
                    <h3 className="mt-2 text-2xl font-light">Additional photos and video</h3>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">
                      Add as many portfolio files as the profile needs. Images use the public
                      surface&apos;s cover crop, while MP4 files remain private until a signed-in
                      workflow requests them.
                    </p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.16em] text-white/40">
                    可新增多張照片與 MP4，沒有數量上限。照片{" "}
                    {slotHint(PUBLIC_MEDIA_SLOTS.modelGallery)}
                    ；影片 {slotHint(PUBLIC_MEDIA_SLOTS.videoFrame)}。YouTube
                    連結請用下方欄位，與上傳檔案分開。
                  </span>
                </div>
                <div className="mt-6">
                  <MultiUploadSlot
                    disabled={!canEdit}
                    selectedCount={additionalFiles.length}
                    onFiles={(files) => {
                      try {
                        files.forEach(assertAllowedModelMedia);
                        setAdditionalFiles(files);
                      } catch (error) {
                        setNotice({
                          tone: "error",
                          text:
                            error instanceof Error
                              ? error.message
                              : "One or more files exceed the size or type limit.",
                        });
                      }
                    }}
                  />
                </div>
                {mediaRows.filter((row) => row.sort_order > 1).length > 0 && (
                  <ul className="mt-6 divide-y divide-white/10 border border-white/10">
                    {mediaRows
                      .filter((row) => row.sort_order > 1)
                      .map((row) => (
                        <li
                          key={row.id}
                          className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
                        >
                          <span className="text-white/70">
                            {row.type === "video" ? "MP4 video" : "Image"} · gallery #
                            {row.sort_order - 1}
                          </span>
                          {identity.role === "admin" && (
                            <button
                              type="button"
                              onClick={() => void deleteMedia(row)}
                              className="text-xs uppercase tracking-[0.14em] text-red-200/70 hover:text-red-100"
                            >
                              Delete
                            </button>
                          )}
                        </li>
                      ))}
                  </ul>
                )}
              </section>

              <section className="grid gap-8 lg:grid-cols-2">
                <div className="border border-white/15 bg-white/[0.03] p-5 md:p-7">
                  <p className="label-xs text-white/45">VIDEO LINKS</p>
                  <h3 className="mt-2 text-2xl font-light">YouTube references</h3>
                  <p className="mt-2 text-sm leading-6 text-white/50">
                    Store interviews or reels as a YouTube URL (watch, youtu.be, Shorts, m.youtube).
                    This is separate from uploaded MP4 files.
                  </p>
                  <div className="mt-5 space-y-4">
                    <Field
                      label="Title"
                      value={videoTitle}
                      disabled={!canEdit || !selectedModelId}
                      onChange={setVideoTitle}
                      placeholder="Editorial film"
                    />
                    <Field
                      label="YouTube URL"
                      value={videoUrl}
                      disabled={!canEdit || !selectedModelId}
                      onChange={setVideoUrl}
                      placeholder="https://youtu.be/..."
                    />
                    <button
                      type="button"
                      disabled={!canEdit || !selectedModelId}
                      onClick={() => void addVideoLink()}
                      className="label-xs border border-white/40 px-4 py-3 transition-colors hover:bg-white hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      + Add YouTube link
                    </button>
                  </div>
                  {videoLinks.length > 0 && (
                    <ul className="mt-6 divide-y divide-white/10 border border-white/10">
                      {videoLinks.map((link) => (
                        <li
                          key={link.id}
                          className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                        >
                          <a
                            href={link.youtube_url}
                            target="_blank"
                            rel="noreferrer"
                            className="min-w-0 truncate text-white/75 underline decoration-white/20 underline-offset-4 hover:text-white"
                          >
                            {link.title}
                          </a>
                          {identity.role === "admin" && (
                            <button
                              type="button"
                              onClick={() => void deleteVideoLink(link.id)}
                              className="shrink-0 text-xs text-red-200/70 hover:text-red-100"
                            >
                              Delete
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="border border-white/15 bg-white/[0.03] p-5 md:p-7">
                  <p className="label-xs text-white/45">SOCIAL LINKS</p>
                  <h3 className="mt-2 text-2xl font-light">Profile channels</h3>
                  <p className="mt-2 text-sm leading-6 text-white/50">
                    Keep each model&apos;s social presence attached to the record for casting and
                    editorial follow-up.
                  </p>
                  <div className="mt-5 space-y-4">
                    <label className="block text-sm text-white/65">
                      Platform
                      <select
                        value={socialPlatform}
                        disabled={!canEdit || !selectedModelId}
                        onChange={(event) => setSocialPlatform(event.target.value)}
                        className="mt-2 w-full border border-white/20 bg-slate-950 px-3 py-3 text-white outline-none focus:border-white/60"
                      >
                        {SOCIAL_PLATFORMS.map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <Field
                      label="Label (optional)"
                      value={socialLabel}
                      disabled={!canEdit || !selectedModelId}
                      onChange={setSocialLabel}
                      placeholder="Official Instagram"
                    />
                    <Field
                      label="HTTPS URL"
                      value={socialUrl}
                      disabled={!canEdit || !selectedModelId}
                      onChange={setSocialUrl}
                      placeholder="https://instagram.com/..."
                    />
                    <button
                      type="button"
                      disabled={!canEdit || !selectedModelId}
                      onClick={() => void addSocialLink()}
                      className="label-xs border border-white/40 px-4 py-3 transition-colors hover:bg-white hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      + Add social link
                    </button>
                  </div>
                  {socialLinks.length > 0 && (
                    <ul className="mt-6 divide-y divide-white/10 border border-white/10">
                      {socialLinks.map((link) => (
                        <li
                          key={link.id}
                          className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                        >
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="min-w-0 truncate text-white/75 underline decoration-white/20 underline-offset-4 hover:text-white"
                          >
                            {link.label} · {link.platform}
                          </a>
                          {identity.role === "admin" && (
                            <button
                              type="button"
                              onClick={() => void deleteSocialLink(link.id)}
                              className="shrink-0 text-xs text-red-200/70 hover:text-red-100"
                            >
                              Delete
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
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
                    {saving
                      ? isCreating
                        ? "新增中…"
                        : "Saving…"
                      : isCreating
                        ? "確認新增模特檔案"
                        : "Save profile + media"}
                  </button>
                )}
              </div>
            </form>
          </main>
          {!selectedModelId && !createModalOpen && (
            <main className="border border-white/15 bg-white/[0.03] p-7 md:p-10">
              <p className="label-xs text-white/45">MODEL PROFILES / 模特檔案</p>
              <h2 className="mt-3 text-3xl font-light">選擇模特檔案開始編輯</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">
                從左側選取現有模特檔案，或按「＋ 新增模特檔案」開啟一個完全空白的建立視窗。
                其他內容功能請使用上方的需求收件匣、關於我們、新聞、JAgent
                知識庫與管理員／協作者分頁。
              </p>
            </main>
          )}
        </div>
        {activeSection !== "models" && (
          <AdminOperationsPanel
            activeTab={activeSection}
            client={client}
            canEdit={canEdit}
            canDelete={identity.role === "admin"}
            canManageAccess={identity.role === "admin"}
            onSessionExpired={onSignedOut}
          />
        )}
      </div>
    </div>
  );
}

type NewsBodyBlock = { type: "text" | "image"; content: string; caption?: string };

function NewsTagAutocomplete({
  selectedTags,
  onAdd,
  onRemove,
  disabled,
}: {
  selectedTags: string[];
  onAdd: (slug: string) => void;
  onRemove: (slug: string) => void;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const suggestions = useMemo(() => (query ? searchNewsTags(query).slice(0, 8) : []), [query]);

  return (
    <div className="relative">
      <p className="text-sm text-white/65">標籤 Tags（輸入首字母或中文觸發建議）</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {selectedTags.map((slug) => {
          const tag = NEWS_TAGS.find((t) => t.slug === slug);
          return (
            <span
              key={slug}
              className="inline-flex items-center gap-1 border border-white/30 bg-white/10 px-2 py-1 text-xs text-white"
            >
              {tag ? `${tag.labelZh} / ${tag.labelEn}` : slug}
              {!disabled && (
                <button type="button" onClick={() => onRemove(slug)} className="ml-1 text-white/60 hover:text-white">
                  ×
                </button>
              )}
            </span>
          );
        })}
      </div>
      <input
        type="text"
        value={query}
        disabled={disabled}
        placeholder="輸入標籤搜尋…"
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        className="mt-2 w-full border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-white/60"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto border border-white/30 bg-slate-900 shadow-lg">
          {suggestions
            .filter((tag) => !selectedTags.includes(tag.slug))
            .map((tag) => (
              <li key={tag.slug}>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onAdd(tag.slug);
                    setQuery("");
                    setOpen(false);
                  }}
                >
                  {tag.labelZh} / {tag.labelEn}
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

function NewsBlockEditor({
  blocks,
  onChange,
  onUploadImage,
  disabled,
}: {
  blocks: NewsBodyBlock[];
  onChange: (blocks: NewsBodyBlock[]) => void;
  onUploadImage: (file: File) => Promise<string | null>;
  disabled?: boolean;
}) {
  const addTextBlock = () => onChange([...blocks, { type: "text", content: "" }]);
  const addImageBlock = async (file: File) => {
    const url = await onUploadImage(file);
    if (url) onChange([...blocks, { type: "image", content: url, caption: "" }]);
  };
  const updateBlock = (index: number, patch: Partial<NewsBodyBlock>) => {
    const next = blocks.map((b, i) => (i === index ? { ...b, ...patch } : b));
    onChange(next);
  };
  const removeBlock = (index: number) => onChange(blocks.filter((_, i) => i !== index));
  const moveBlock = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    const tmp = next[index]!;
    next[index] = next[target]!;
    next[target] = tmp;
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-white/65">內文區塊（段落與圖片交替排列）</p>
      {blocks.map((block, index) => (
        <div key={index} className="group relative border border-white/10 bg-black/20 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-white/40">
              {block.type === "text" ? `段落 #${index + 1}` : `圖片 #${index + 1}`}
            </span>
            <div className="flex gap-2">
              <button type="button" onClick={() => moveBlock(index, -1)} disabled={disabled || index === 0} className="text-xs text-white/50 hover:text-white disabled:opacity-30">↑</button>
              <button type="button" onClick={() => moveBlock(index, 1)} disabled={disabled || index === blocks.length - 1} className="text-xs text-white/50 hover:text-white disabled:opacity-30">↓</button>
              <button type="button" onClick={() => removeBlock(index)} disabled={disabled} className="text-xs text-red-300/70 hover:text-red-200 disabled:opacity-30">刪除</button>
            </div>
          </div>
          {block.type === "text" ? (
            <textarea
              value={block.content}
              disabled={disabled}
              onChange={(e) => updateBlock(index, { content: e.target.value })}
              rows={3}
              className="w-full resize-y border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-white/50"
              placeholder="段落文字（中文）"
            />
          ) : (
            <div>
              {block.content && (
                <img src={block.content} alt="block" className="mb-2 max-h-40 rounded object-contain" />
              )}
              <input
                type="text"
                value={block.caption ?? ""}
                disabled={disabled}
                onChange={(e) => updateBlock(index, { caption: e.target.value })}
                placeholder="圖片說明（選填）"
                className="w-full border border-white/15 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-white/50"
              />
            </div>
          )}
        </div>
      ))}
      <div className="flex gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={addTextBlock}
          className="border border-white/20 px-3 py-2 text-xs text-white/70 hover:bg-white/5 disabled:opacity-40"
        >
          + 段落
        </button>
        <label className={`border border-white/20 px-3 py-2 text-xs text-white/70 hover:bg-white/5 ${disabled ? "pointer-events-none opacity-40" : "cursor-pointer"}`}>
          + 圖片
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={disabled}
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void addImageBlock(file);
              e.target.value = "";
            }}
          />
        </label>
      </div>
    </div>
  );
}

function AdminOperationsPanel({
  activeTab,
  client,
  canEdit,
  canDelete,
  canManageAccess,
  onSessionExpired,
}: {
  activeTab: OperationsSection;
  client: SupabaseClient<Database>;
  canEdit: boolean;
  canDelete: boolean;
  canManageAccess: boolean;
  onSessionExpired: () => void;
}) {
  const tab = activeTab;
  const queryClient = useQueryClient();
  const [inquiries, setInquiries] = useState<Database["public"]["Tables"]["inquiries"]["Row"][]>(
    [],
  );
  const [applications, setApplications] = useState<
    Database["public"]["Tables"]["scout_applications"]["Row"][]
  >([]);
  const [notifications, setNotifications] = useState<
    Database["public"]["Tables"]["admin_notifications"]["Row"][]
  >([]);
  const [settings, setSettings] = useState<
    Database["public"]["Tables"]["site_settings"]["Row"] | null
  >(null);
  const [news, setNews] = useState<Database["public"]["Tables"]["news_posts"]["Row"][]>([]);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [newsTitleZh, setNewsTitleZh] = useState("");
  const [newsTitleEn, setNewsTitleEn] = useState("");
  const [newsExcerptZh, setNewsExcerptZh] = useState("");
  const [newsExcerptEn, setNewsExcerptEn] = useState("");
  const [newsSlug, setNewsSlug] = useState("");
  const [newsCoverFile, setNewsCoverFile] = useState<File | null>(null);
  const [newsCoverPreview, setNewsCoverPreview] = useState<string>("");
  const [newsBodyBlocks, setNewsBodyBlocks] = useState<NewsBodyBlock[]>([]);
  const [newsSelectedTags, setNewsSelectedTags] = useState<string[]>([]);
  const newsTitleZhManualEnRef = useRef(false);
  const newsExcerptZhManualEnRef = useRef(false);
  const [knowledge, setKnowledge] = useState<
    Database["public"]["Tables"]["assistant_knowledge_documents"]["Row"][]
  >([]);
  const [busy, setBusy] = useState(false);
  const [sendingNotification, setSendingNotification] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [workspaceUsers, setWorkspaceUsers] = useState<WorkspaceUser[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<WorkspaceUser["role"]>("editor");
  const [accessBusy, setAccessBusy] = useState(false);

  const load = useCallback(async () => {
    const [
      inquiryResult,
      applicationResult,
      notificationResult,
      settingsResult,
      newsResult,
      knowledgeResult,
    ] = await Promise.all([
      client.from("inquiries").select("*").order("created_at", { ascending: false }),
      client.from("scout_applications").select("*").order("created_at", { ascending: false }),
      client.from("admin_notifications").select("*").order("created_at", { ascending: false }),
      client.from("site_settings").select("*").eq("id", "global").maybeSingle(),
      client.from("news_posts").select("*").order("date", { ascending: false }),
      client
        .from("assistant_knowledge_documents")
        .select("*")
        .order("updated_at", { ascending: false }),
    ]);
    setInquiries(inquiryResult.data ?? []);
    setApplications(applicationResult.data ?? []);
    setNotifications(notificationResult.data ?? []);
    setSettings(settingsResult.data ?? null);
    setNews(newsResult.data ?? []);
    setKnowledge(knowledgeResult.data ?? []);
    const authLost = [settingsResult, inquiryResult, applicationResult].some((result) =>
      /session missing|jwt|permission denied for table site_settings/i.test(
        result.error?.message ?? "",
      ),
    );
    if (authLost) {
      setMessage("Auth session missing. Sign in again.");
      onSessionExpired();
    }
  }, [client, onSessionExpired]);

  useEffect(() => {
    void load();
  }, [load]);

  const loadWorkspaceUsers = useCallback(async () => {
    if (!canManageAccess) return;
    const { data, error } = await client.functions.invoke("provision-user", {
      body: { action: "list" },
    });
    if (error) {
      setMessage(error.message);
      return;
    }
    const users = data && Array.isArray(data.users) ? (data.users as WorkspaceUser[]) : [];
    setWorkspaceUsers(users);
  }, [canManageAccess, client]);

  useEffect(() => {
    void loadWorkspaceUsers();
  }, [loadWorkspaceUsers]);

  const inviteWorkspaceUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canManageAccess || !inviteEmail.trim()) return;
    setAccessBusy(true);
    setMessage("");
    const redirectTo = new URL("/admin?reset=1", window.location.origin).toString();
    const { data, error } = await client.functions.invoke("provision-user", {
      body: {
        action: "invite",
        email: inviteEmail.trim(),
        role: inviteRole,
        redirect_to: redirectTo,
      },
    });
    if (error) {
      setMessage(error.message);
    } else {
      setInviteEmail("");
      setMessage(
        `Invitation sent to ${String(data?.email ?? inviteEmail.trim())}. The selected role is ${inviteRole}.`,
      );
      await loadWorkspaceUsers();
    }
    setAccessBusy(false);
  };

  const changeWorkspaceRole = async (userId: string, role: WorkspaceUser["role"]) => {
    if (!canManageAccess) return;
    setAccessBusy(true);
    const { error } = await client.functions.invoke("provision-user", {
      body: { action: "set_role", user_id: userId, role },
    });
    if (error) setMessage(error.message);
    else {
      setMessage(
        "Role updated. The user must sign in again or refresh their session for the new permission to take effect.",
      );
      await loadWorkspaceUsers();
    }
    setAccessBusy(false);
  };

  const deleteWorkspaceUser = async (user: WorkspaceUser) => {
    if (
      !canManageAccess ||
      !window.confirm(`Delete ${user.email ?? "this user"} from the workspace?`)
    )
      return;
    setAccessBusy(true);
    const { error } = await client.functions.invoke("provision-user", {
      body: { action: "delete", user_id: user.id },
    });
    if (error) setMessage(error.message);
    else {
      setMessage("Workspace user deleted.");
      await loadWorkspaceUsers();
    }
    setAccessBusy(false);
  };

  const updateInquiryStatus = async (id: string, status: string) => {
    if (!canEdit) return;
    const { error } = await client.from("inquiries").update({ status }).eq("id", id);
    if (error) setMessage(error.message);
    else await load();
  };

  const updateApplicationStatus = async (id: string, status: string) => {
    if (!canEdit) return;
    const { error } = await client.from("scout_applications").update({ status }).eq("id", id);
    if (error) setMessage(error.message);
    else await load();
  };

  const sendNotification = async (id: string) => {
    setSendingNotification(id);
    const notification = notifications.find((row) => row.id === id);
    if (!notification) {
      setMessage("Notification record was not found.");
      setSendingNotification(null);
      return;
    }
    const { error } = await client.functions.invoke("notify-admin", {
      body: { reference_id: notification.reference_id },
    });
    if (error) setMessage(error.message);
    else setMessage("Notification dispatch attempted.");
    await load();
    setSendingNotification(null);
  };

  const saveSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canEdit || !settings) return;
    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const aboutTitleZh = String(form.get("aboutTitleZh") ?? "").trim();
    const aboutBodyZh = String(form.get("aboutBodyZh") ?? "")
      .split("\n")
      .map((value) => value.trim())
      .filter(Boolean);
    const payload = {
      id: "global" as const,
      admin_email: String(form.get("adminEmail") ?? "").trim(),
      about_published: form.get("aboutPublished") === "on",
      about_title_en:
        String(form.get("aboutTitleEn") ?? "").trim() || (await englishFromChinese(aboutTitleZh)),
      about_title_zh: aboutTitleZh,
      about_body_en: (() => {
        const english = String(form.get("aboutBodyEn") ?? "")
          .split("\n")
          .map((value) => value.trim())
          .filter(Boolean);
        return english.length ? english : aboutBodyZh;
      })(),
      about_body_zh: aboutBodyZh,
      offices: settings.offices,
      messenger_url: String(form.get("messengerUrl") ?? "").trim() || null,
      line_oa_url: String(form.get("lineOaUrl") ?? "").trim() || null,
    };
    let { error } = await client.from("site_settings").upsert(payload);
    if (error && /messenger_url|line_oa_url|schema cache|column/i.test(error.message)) {
      const { messenger_url: _messenger, line_oa_url: _line, ...withoutChannels } = payload;
      ({ error } = await client.from("site_settings").upsert(withoutChannels));
    }
    setBusy(false);
    if (error) {
      setMessage(error.message);
      if (/permission denied|jwt|session missing|not authenticated/i.test(error.message)) {
        onSessionExpired();
      }
      return;
    }
    setMessage("About and notification settings saved.");
    await invalidatePublicContent(queryClient);
    await load();
  };

  const addNews = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canEdit) return;
    setBusy(true);
    setMessage("");

    // Upload cover if a file was selected
    let coverUrl = newsCoverPreview;
    if (newsCoverFile) {
      const uploaded = await uploadNewsImage(newsCoverFile);
      if (uploaded) coverUrl = uploaded;
      else {
        setBusy(false);
        return;
      }
    }

    // Build body_zh from text blocks for legacy compatibility
    const bodyZh = newsBodyBlocks
      .filter((b) => b.type === "text" && b.content.trim())
      .map((b) => b.content.trim());

    // Auto-translate body blocks text to EN
    const bodyEnParts: string[] = [];
    for (const block of newsBodyBlocks) {
      if (block.type === "text" && block.content.trim()) {
        const en = await englishFromChinese(block.content.trim(), "");
        bodyEnParts.push(en || block.content.trim());
      }
    }

    const payload = {
      slug: newsSlug.trim(),
      title_en: newsTitleEn.trim() || (await englishFromChinese(newsTitleZh, "")),
      title_zh: newsTitleZh.trim(),
      excerpt_en: newsExcerptEn.trim() || (await englishFromChinese(newsExcerptZh, "")),
      excerpt_zh: newsExcerptZh.trim(),
      body_en: bodyEnParts,
      body_zh: bodyZh,
      body_blocks: newsBodyBlocks as unknown as never,
      cover_url: coverUrl || null,
      tags: newsSelectedTags,
    };
    const { error } = editingNewsId
      ? await client.from("news_posts").update(payload).eq("id", editingNewsId)
      : await client.from("news_posts").insert({ ...payload, status: "published" });
    setBusy(false);
    if (error) setMessage(error.message);
    else {
      setEditingNewsId(null);
      setMessage(editingNewsId ? "News updated." : "News published.");
      await queryClient.invalidateQueries({ queryKey: ["news"] });
      await invalidatePublicContent(queryClient);
      await load();
    }
  };

  const addKnowledge = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canEdit) return;
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setBusy(true);
    setMessage("");
    const { error } = await client.from("assistant_knowledge_documents").insert({
      title_en: String(form.get("knowledgeTitleEn") ?? "").trim(),
      title_zh: String(form.get("knowledgeTitleZh") ?? "").trim(),
      content_en: String(form.get("knowledgeContentEn") ?? "").trim(),
      content_zh: String(form.get("knowledgeContentZh") ?? "").trim(),
      tags: String(form.get("knowledgeTags") ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      source_type: "manual",
      published: true,
    });
    setBusy(false);
    if (error) setMessage(error.message);
    else {
      formElement.reset();
      setMessage("JAgent knowledge published.");
      await load();
    }
  };

  const deleteNews = async (id: string) => {
    if (!canDelete) return;
    const { error } = await client.from("news_posts").delete().eq("id", id);
    if (error) setMessage(error.message);
    else {
      if (editingNewsId === id) setEditingNewsId(null);
      setMessage("News item deleted.");
      await load();
    }
  };

  const deleteKnowledge = async (id: string) => {
    if (!canDelete) return;
    const { error } = await client.from("assistant_knowledge_documents").delete().eq("id", id);
    if (error) setMessage(error.message);
    else {
      setMessage("Knowledge document deleted.");
      await load();
    }
  };

  const editingNews = news.find((row) => row.id === editingNewsId) ?? null;

  // Populate news form when editing
  useEffect(() => {
    if (editingNews) {
      setNewsTitleZh(editingNews.title_zh);
      setNewsTitleEn(editingNews.title_en);
      setNewsExcerptZh(editingNews.excerpt_zh);
      setNewsExcerptEn(editingNews.excerpt_en);
      setNewsSlug(editingNews.slug);
      setNewsCoverPreview(editingNews.cover_url ?? "");
      setNewsCoverFile(null);
      const raw = editingNews as unknown as Record<string, unknown>;
      const rawBlocks = raw["body_blocks"];
      const blocks = Array.isArray(rawBlocks) && rawBlocks.length > 0
        ? (rawBlocks as NewsBodyBlock[])
        : editingNews.body_zh.map((p) => ({ type: "text" as const, content: p }));
      setNewsBodyBlocks(blocks);
      setNewsSelectedTags(editingNews.tags);
      newsTitleZhManualEnRef.current = true;
      newsExcerptZhManualEnRef.current = true;
    } else {
      setNewsTitleZh("");
      setNewsTitleEn("");
      setNewsExcerptZh("");
      setNewsExcerptEn("");
      setNewsSlug("");
      setNewsCoverPreview("");
      setNewsCoverFile(null);
      setNewsBodyBlocks([{ type: "text", content: "" }]);
      setNewsSelectedTags([]);
      newsTitleZhManualEnRef.current = false;
      newsExcerptZhManualEnRef.current = false;
    }
  }, [editingNewsId]);

  // Auto-translate title ZH → EN
  useEffect(() => {
    if (newsTitleZhManualEnRef.current || !newsTitleZh.trim()) return;
    const timer = window.setTimeout(() => {
      void englishFromChinese(newsTitleZh, "").then((t) => {
        if (!newsTitleZhManualEnRef.current && t) setNewsTitleEn(t);
      });
    }, 700);
    return () => window.clearTimeout(timer);
  }, [newsTitleZh]);

  // Auto-translate excerpt ZH → EN
  useEffect(() => {
    if (newsExcerptZhManualEnRef.current || !newsExcerptZh.trim()) return;
    const timer = window.setTimeout(() => {
      void englishFromChinese(newsExcerptZh, "").then((t) => {
        if (!newsExcerptZhManualEnRef.current && t) setNewsExcerptEn(t);
      });
    }, 700);
    return () => window.clearTimeout(timer);
  }, [newsExcerptZh]);

  const uploadNewsImage = async (file: File): Promise<string | null> => {
    const id = editingNewsId ?? `draft-${Date.now()}`;
    const path = `news/${id}/${Date.now()}-${file.name}`;
    const { error } = await client.storage.from("model-media").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (error) {
      setMessage(`Image upload failed: ${error.message}`);
      return null;
    }
    return client.storage.from("model-media").getPublicUrl(path).data.publicUrl;
  };

  const inputClass =
    "mt-2 w-full border border-white/15 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-white/50";
  const sectionHeading =
    tab === "inbox"
      ? "需求收件匣 / Inbox"
      : tab === "about"
        ? "關於我們 / About"
        : tab === "news"
          ? "新聞 / News"
          : tab === "knowledge"
            ? "JAgent 知識庫 / RAG"
            : "管理員與協作者 / Access";
  return (
    <section className="mt-10 border border-white/15 bg-white/[0.03] p-5 md:p-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-xs text-white/45">OPERATIONS / CONTENT CONTROL PLANE</p>
          <h2 className="mt-2 text-3xl font-light">{sectionHeading}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/50">
            Every public form writes to Supabase. New requests also create a notification outbox row
            for the administrator email.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="label-xs border border-white/30 px-4 py-3"
        >
          Refresh
        </button>
      </div>
      {message ? (
        <p className="mt-4 border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm text-emerald-100">
          {message}
        </p>
      ) : null}
      {tab === "inbox" ? (
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-light">Client enquiries ({inquiries.length})</h3>
              <span className="text-xs text-white/40">
                {
                  notifications.filter((row) => row.kind === "inquiry" && row.status === "pending")
                    .length
                }{" "}
                pending email
              </span>
            </div>
            <ul className="mt-4 divide-y divide-white/10 border border-white/10">
              {inquiries.map((row) => (
                <li key={row.id} className="space-y-2 p-4">
                  <div className="flex flex-wrap justify-between gap-3">
                    <strong className="text-sm">
                      {row.name}
                      {row.company ? ` · ${row.company}` : ""}
                    </strong>
                    <select
                      disabled={!canEdit}
                      value={row.status}
                      onChange={(event) => void updateInquiryStatus(row.id, event.target.value)}
                      className="border border-white/20 bg-slate-950 px-2 py-1 text-xs"
                    >
                      <option value="new">New</option>
                      <option value="in_progress">In progress</option>
                      <option value="replied">Replied</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <p className="text-xs text-white/50">
                    {row.email} · {row.enquiry_type} · {new Date(row.created_at).toLocaleString()}
                  </p>
                  <p className="text-sm text-white/70">{row.message}</p>
                </li>
              ))}
              {inquiries.length === 0 ? (
                <li className="p-4 text-sm text-white/45">No enquiries yet.</li>
              ) : null}
            </ul>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-light">Model applications ({applications.length})</h3>
              <span className="text-xs text-white/40">
                {
                  notifications.filter(
                    (row) => row.kind === "application" && row.status === "pending",
                  ).length
                }{" "}
                pending email
              </span>
            </div>
            <ul className="mt-4 divide-y divide-white/10 border border-white/10">
              {applications.map((row) => (
                <li key={row.id} className="space-y-2 p-4">
                  <div className="flex flex-wrap justify-between gap-3">
                    <strong className="text-sm">
                      {row.name} · {row.city}
                    </strong>
                    <select
                      disabled={!canEdit}
                      value={row.status}
                      onChange={(event) => void updateApplicationStatus(row.id, event.target.value)}
                      className="border border-white/20 bg-slate-950 px-2 py-1 text-xs"
                    >
                      <option value="new">New</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="rejected">Rejected</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <p className="text-xs text-white/50">
                    {row.email} · {row.height ?? "height n/a"} ·{" "}
                    {new Date(row.created_at).toLocaleString()}
                  </p>
                  <p className="text-sm text-white/70">{row.message ?? "No note."}</p>
                  <p className="text-xs text-white/40">
                    Attachments: {Array.isArray(row.attachments) ? row.attachments.length : 0}
                  </p>
                </li>
              ))}
              {applications.length === 0 ? (
                <li className="p-4 text-sm text-white/45">No applications yet.</li>
              ) : null}
            </ul>
          </div>
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-light">
                Administrator notification outbox ({notifications.length})
              </h3>
              <span className="text-xs text-white/40">Pending rows can be retried</span>
            </div>
            <ul className="mt-4 divide-y divide-white/10 border border-white/10">
              {notifications.map((row) => (
                <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm">{row.subject}</p>
                    <p className="mt-1 text-xs text-white/45">
                      {row.recipient_email} · {new Date(row.created_at).toLocaleString()} ·{" "}
                      {row.status}
                    </p>
                    {row.error ? (
                      <p className="mt-1 text-xs text-amber-200/80">{row.error}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    disabled={!canEdit || sendingNotification === row.id || row.status === "sent"}
                    onClick={() => void sendNotification(row.id)}
                    className="label-xs border border-white/30 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {sendingNotification === row.id
                      ? "Sending…"
                      : row.status === "sent"
                        ? "Sent"
                        : "Send / retry"}
                  </button>
                </li>
              ))}
              {notifications.length === 0 ? (
                <li className="p-4 text-sm text-white/45">No notification rows yet.</li>
              ) : null}
            </ul>
          </div>
        </div>
      ) : null}
      {tab === "access" && canManageAccess ? (
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <form onSubmit={inviteWorkspaceUser} className="space-y-4 border border-white/10 p-5">
            <div>
              <p className="label-xs text-white/45">ADMIN-ONLY ACCESS CONTROL</p>
              <h3 className="mt-2 text-xl font-light">Invite a collaborator</h3>
              <p className="mt-2 text-sm leading-6 text-white/50">
                The invitation email includes the secure setup link. The role is assigned before the
                user accepts, so the first session starts with the intended permissions.
              </p>
            </div>
            <label className="block text-sm text-white/65">
              Email address
              <input
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                type="email"
                required
                className={inputClass}
                placeholder="editor@example.com"
              />
            </label>
            <label className="block text-sm text-white/65">
              Permission role
              <select
                value={inviteRole}
                onChange={(event) => setInviteRole(event.target.value as WorkspaceUser["role"])}
                className={inputClass}
              >
                <option value="viewer">檢視者 / Viewer — read-only</option>
                <option value="editor">協作者 / Editor — create and edit content</option>
                <option value="admin">完整管理員 / Admin — users, roles, delete</option>
              </select>
            </label>
            <button
              type="submit"
              disabled={accessBusy}
              className="label-xs bg-white px-5 py-3 text-slate-950 disabled:opacity-50"
            >
              {accessBusy ? "Sending…" : "Send invitation"}
            </button>
          </form>
          <div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-light">Workspace users ({workspaceUsers.length})</h3>
                <p className="mt-1 text-xs text-white/45">
                  Only Admin can change roles or remove users.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void loadWorkspaceUsers()}
                disabled={accessBusy}
                className="text-xs text-white/50 underline underline-offset-4 hover:text-white"
              >
                Refresh
              </button>
            </div>
            <ul className="mt-4 divide-y divide-white/10 border border-white/10">
              {workspaceUsers.map((user) => (
                <li key={user.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-white/85">{user.email ?? user.id}</p>
                    <p className="mt-1 text-xs text-white/40">
                      {user.confirmed_at ? "confirmed" : "invited / pending"} · created{" "}
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={user.role}
                      disabled={accessBusy}
                      onChange={(event) =>
                        void changeWorkspaceRole(
                          user.id,
                          event.target.value as WorkspaceUser["role"],
                        )
                      }
                      className="border border-white/20 bg-slate-950 px-2 py-2 text-xs"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      type="button"
                      disabled={accessBusy}
                      onClick={() => void deleteWorkspaceUser(user)}
                      className="text-xs text-red-200/70 underline underline-offset-4 hover:text-red-100 disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
              {workspaceUsers.length === 0 ? (
                <li className="p-4 text-sm text-white/45">
                  No users returned. Refresh after the Edge Function is deployed.
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      ) : null}
      {tab === "about" && settings ? (
        <form onSubmit={saveSettings} className="mt-6 grid gap-5 md:grid-cols-2">
          <label className="text-sm text-white/65">
            Administrator email
            <input
              name="adminEmail"
              type="email"
              defaultValue={settings.admin_email}
              className={inputClass}
              required
            />
          </label>
          <label className="flex items-center gap-3 self-end border border-white/15 px-3 py-3 text-sm text-white/65">
            <input
              name="aboutPublished"
              type="checkbox"
              defaultChecked={Boolean(settings.about_published)}
              className="h-4 w-4 accent-white"
            />
            Published on the public About page
          </label>
          <label className="text-sm text-white/65">
            About title (English)
            <input
              name="aboutTitleEn"
              defaultValue={settings.about_title_en}
              className={inputClass}
            />
          </label>
          <label className="text-sm text-white/65">
            About title (中文)
            <input
              name="aboutTitleZh"
              defaultValue={settings.about_title_zh}
              className={inputClass}
              required
            />
          </label>
          <label className="text-sm text-white/65">
            About copy (English, one paragraph per line)
            <textarea
              name="aboutBodyEn"
              defaultValue={settings.about_body_en.join("\n")}
              rows={6}
              className={inputClass}
            />
          </label>
          <label className="text-sm text-white/65">
            About copy (中文，每行一段)
            <textarea
              name="aboutBodyZh"
              defaultValue={settings.about_body_zh.join("\n")}
              rows={6}
              className={inputClass}
            />
          </label>
          <label className="text-sm text-white/65">
            Facebook Messenger URL (m.me)
            <input
              name="messengerUrl"
              type="url"
              defaultValue={settings.messenger_url ?? ""}
              placeholder="https://m.me/your-page"
              className={inputClass}
            />
          </label>
          <label className="text-sm text-white/65">
            LINE Official Account URL
            <input
              name="lineOaUrl"
              type="url"
              defaultValue={settings.line_oa_url ?? ""}
              placeholder="https://line.me/R/ti/p/@your-oa"
              className={inputClass}
            />
          </label>
          <p className="md:col-span-2 text-xs text-white/45">
            J Agent 轉接專人 uses these HTTPS deep links. Leave blank until the live page exists. Do
            not paste a fake URL. Messenger and LINE webhooks stay Phase 7.
          </p>
          <button
            disabled={!canEdit || busy}
            className="label-xs w-fit bg-white px-5 py-3 text-slate-950 disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save About + email"}
          </button>
        </form>
      ) : null}
      {tab === "news" ? (
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_1.3fr]">
          <form key={editingNewsId ?? "new"} onSubmit={addNews} className="space-y-4">
            <h3 className="text-xl font-light">{editingNewsId ? "編輯新聞" : "發布新聞"}</h3>
            <label className="block text-sm text-white/65">
              Slug（網址路徑）
              <input
                value={newsSlug}
                onChange={(e) => setNewsSlug(e.target.value)}
                className={inputClass}
                required
                placeholder="spring-board-update"
              />
            </label>
            <label className="block text-sm text-white/65">
              標題（中文）
              <input
                value={newsTitleZh}
                onChange={(e) => {
                  newsTitleZhManualEnRef.current = false;
                  setNewsTitleZh(e.target.value);
                }}
                className={inputClass}
                required
                placeholder="春季分類更新"
              />
            </label>
            <label className="block text-sm text-white/65">
              Title (English)（自動翻譯，可手動修改）
              <input
                value={newsTitleEn}
                onChange={(e) => {
                  newsTitleZhManualEnRef.current = true;
                  setNewsTitleEn(e.target.value);
                }}
                className={inputClass}
                placeholder="Auto-translated from Chinese"
              />
            </label>
            <label className="block text-sm text-white/65">
              摘要（中文）
              <input
                value={newsExcerptZh}
                onChange={(e) => {
                  newsExcerptZhManualEnRef.current = false;
                  setNewsExcerptZh(e.target.value);
                }}
                className={inputClass}
                required
                placeholder="簡短摘要…"
              />
            </label>
            <label className="block text-sm text-white/65">
              Excerpt (English)（自動翻譯，可手動修改）
              <input
                value={newsExcerptEn}
                onChange={(e) => {
                  newsExcerptZhManualEnRef.current = true;
                  setNewsExcerptEn(e.target.value);
                }}
                className={inputClass}
                placeholder="Auto-translated from Chinese"
              />
            </label>
            <div>
              <p className="text-sm text-white/65">封面圖片（上傳）</p>
              {(newsCoverPreview || newsCoverFile) && (
                <img
                  src={newsCoverFile ? URL.createObjectURL(newsCoverFile) : newsCoverPreview}
                  alt="cover preview"
                  className="mt-2 max-h-32 rounded object-contain"
                />
              )}
              <label className="mt-2 inline-block cursor-pointer border border-white/20 px-3 py-2 text-xs text-white/70 hover:bg-white/5">
                {newsCoverPreview || newsCoverFile ? "更換封面" : "選擇封面圖片"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={!canEdit}
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setNewsCoverFile(file);
                    if (file) setNewsCoverPreview("");
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
            <NewsBlockEditor
              blocks={newsBodyBlocks}
              onChange={setNewsBodyBlocks}
              onUploadImage={uploadNewsImage}
              disabled={!canEdit}
            />
            <NewsTagAutocomplete
              selectedTags={newsSelectedTags}
              onAdd={(slug) => setNewsSelectedTags((prev) => [...prev, slug])}
              onRemove={(slug) => setNewsSelectedTags((prev) => prev.filter((s) => s !== slug))}
              disabled={!canEdit}
            />
            <div className="flex flex-wrap gap-3">
              <button
                disabled={!canEdit || busy}
                className="label-xs bg-white px-5 py-3 text-slate-950 disabled:opacity-50"
              >
                {busy ? "儲存中…" : editingNewsId ? "儲存變更" : "發布"}
              </button>
              {editingNewsId ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setEditingNewsId(null)}
                  className="label-xs border border-white/20 px-5 py-3 text-white disabled:opacity-50"
                >
                  取消編輯
                </button>
              ) : null}
            </div>
          </form>
          <div>
            <h3 className="text-xl font-light">Published / draft stories ({news.length})</h3>
            <ul className="mt-4 divide-y divide-white/10 border border-white/10">
              {news.map((row) => (
                <li key={row.id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <strong>{row.title_en}</strong>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-white/45">{row.status}</span>
                      <button
                        type="button"
                        disabled={!canEdit || busy}
                        onClick={() => setEditingNewsId(row.id)}
                        className="text-xs text-white/70 underline disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={!canDelete || busy}
                        onClick={() => void deleteNews(row.id)}
                        className="text-xs text-red-200/75 underline disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-white/45">
                    /{row.slug} · {row.date}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
      {tab === "knowledge" ? (
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_1.3fr]">
          <form onSubmit={addKnowledge} className="space-y-4">
            <h3 className="text-xl font-light">Add JAgent knowledge</h3>
            <label className="block text-sm text-white/65">
              Title (English)
              <input name="knowledgeTitleEn" className={inputClass} required />
            </label>
            <label className="block text-sm text-white/65">
              Title (中文)
              <input name="knowledgeTitleZh" className={inputClass} required />
            </label>
            <label className="block text-sm text-white/65">
              Content (English)
              <textarea name="knowledgeContentEn" rows={6} className={inputClass} required />
            </label>
            <label className="block text-sm text-white/65">
              Content (中文)
              <textarea name="knowledgeContentZh" rows={6} className={inputClass} required />
            </label>
            <label className="block text-sm text-white/65">
              Tags
              <input name="knowledgeTags" className={inputClass} />
            </label>
            <button
              disabled={!canEdit || busy}
              className="label-xs bg-white px-5 py-3 text-slate-950 disabled:opacity-50"
            >
              Publish to RAG
            </button>
          </form>
          <div>
            <h3 className="text-xl font-light">Knowledge documents ({knowledge.length})</h3>
            <ul className="mt-4 divide-y divide-white/10 border border-white/10">
              {knowledge.map((row) => (
                <li key={row.id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <strong>{row.title_en}</strong>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-white/45">
                        {row.published ? "published" : "draft"}
                      </span>
                      <button
                        type="button"
                        disabled={!canDelete || busy}
                        onClick={() => void deleteKnowledge(row.id)}
                        className="text-xs text-red-200/75 underline disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm text-white/60">{row.content_en}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </section>
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
        <div className="aspect-[2/3] w-full">
          {preview ? (
            <img
              src={preview}
              alt="Selected model media preview"
              className="h-full w-full object-cover object-center"
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

function MultiUploadSlot({
  disabled,
  selectedCount,
  onFiles,
}: {
  disabled: boolean;
  selectedCount: number;
  onFiles: (files: File[]) => void;
}) {
  return (
    <label
      className={`flex min-h-32 items-center justify-between gap-5 border border-dashed border-white/25 bg-black/20 px-5 py-5 ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-white/65"}`}
    >
      <div>
        <p className="text-sm text-white/80">Choose gallery media</p>
        <p className="mt-2 text-xs leading-5 text-white/40">
          Select multiple images or MP4 files. They will be appended after the primary and hover
          slots.
        </p>
      </div>
      <span className="shrink-0 border border-white/35 px-4 py-3 text-xs uppercase tracking-[0.14em] text-white/65">
        {selectedCount > 0 ? `${selectedCount} selected` : "Choose files"}
      </span>
      <input
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,video/mp4"
        disabled={disabled}
        className="sr-only"
        onChange={(event) => onFiles(Array.from(event.target.files ?? []))}
      />
    </label>
  );
}
