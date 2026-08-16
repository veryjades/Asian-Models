# Asian Stars Agency — Decision Log

**Status:** active project control record  
**Last updated:** 2026-08-16
**How to use:** Record approved, durable choices here before implementation. Do not silently edit a decision's outcome; supersede it with a new decision that links to the prior ID.

## Decision register

| ID    | Status   | Decision                                                                                                                                                                                                                                               | Rationale                                                                                                                                                                                 | Consequence / boundary                                                                                                                                                                                                                         |
| ----- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-001 | Approved | Use **Supabase** as the initial production application platform for database, authentication, and storage.                                                                                                                                             | Provides a coherent managed base for the first production release.                                                                                                                        | No Supabase code, schema, migrations, credentials, or policies may be added until Phase 2 is active.                                                                                                                                           |
| D-002 | Approved | Keep AI behind a **provider abstraction**; the first permitted provider may be **Azure OpenAI**.                                                                                                                                                       | Prevents product logic from being coupled to one AI vendor.                                                                                                                               | No provider SDK, secrets, prompts, or AI user flow may be added until Phase 6 is active.                                                                                                                                                       |
| D-003 | Approved | Use **Facebook deep links first**; evaluate webhook integration later.                                                                                                                                                                                 | Keeps the first contact path simple while Meta permissions and webhook scope are deferred.                                                                                                | No Messenger/Facebook webhook, token, or event-processing implementation before Phase 7.                                                                                                                                                       |
| D-004 | Approved | First-release RBAC roles are **Admin**, **Editor**, and **Viewer**.                                                                                                                                                                                    | Establishes a small, understandable permission model.                                                                                                                                     | Role semantics and enforcement are designed in Phase 2; no admin UI before Phase 5.                                                                                                                                                            |
| D-005 | Approved | Use **feature branches and pull requests**; `main` is protected from direct implementation commits.                                                                                                                                                    | Creates reviewable, recoverable collaboration between agents and humans.                                                                                                                  | Work must be scoped to a branch and include verification evidence in its PR/task record.                                                                                                                                                       |
| D-006 | Approved | **Bun** is the canonical package-manager workflow. Bun 1.x is required; CI must pin an explicit Bun version, while local setup must use a compatible current Bun 1.x release until that pin is recorded.                                               | The repository has the only lockfile (`bun.lock`) and Bun-specific configuration (`bunfig.toml`); npm can run the existing checkout but is not the supported dependency-install workflow. | Run `bun install --frozen-lockfile`, then `bun run dev`, `bun run lint`, or `bun run build`. Do not add another lockfile or switch package managers. CI should use a pinned Bun setup action/version, run frozen install, then lint and build. |
| D-007 | Approved | Phase 1 establishes the Supabase architecture foundation: local configuration, migration history, typed browser client, adapter boundary, and RLS policy plan.                                                                                         | Luna approved this bounded foundation before UI, Auth flow, Storage bucket, or operational workflow implementation.                                                                       | Do not connect existing forms/UI, apply a migration to a cloud project, create storage buckets, provision roles, or implement AI, Messenger, model login, automatic casting, or pricing in this task. See ADR-001.                             |
| D-008 | Approved | Use experience-driven, customer-to-business iterations for public mock content: formulate an MVP hypothesis, implement the smallest safe change, validate it on Preview, then observe and iterate.                                                     | The prototype must be judged by believable agency experience rather than a premature exhaustive specification.                                                                            | This is a bounded exception for mock visual assets and presentation components only. Do not alter Supabase architecture, bind the app to Vercel, add AI runtime functionality, use real talent data, or bypass feature-branch/PR review.       |
| D-009 | Approved | Prototype media must be production-quality but fictional and replaceable. Prefer licensed commercial fashion media; otherwise use reviewed AI-generated fictional adults; replace with authorised CMS-managed photography after onboarding.            | Protects talent privacy and rights while preserving a credible premium agency experience.                                                                                                 | No random image search, unlicensed real-person photo, obvious generative artefact, or page-level forced crop. See `docs/MOCK_ASSET_GUIDE.md`.                                                                                                  |
| D-010 | Approved | Provision the empty Supabase production project `asian-models` now, while deferring schema application, Auth, Storage, RLS grants, and role provisioning until Phase 2 approval.                                                                       | The project owner explicitly approved a zero-cost project container so the release work can reserve its production boundary without connecting the application prematurely.               | Historical Phase 1 boundary decision. Project ref `cajkkxustehtzyymlopm` in `ap-southeast-1`; no secrets are committed. Phase 2 approval subsequently authorized the foundation and security migrations recorded in D-011/P2-002. |
| D-011 | Approved | Activate Phase 2 after explicit owner approval; apply the reviewed foundation migration and regenerate the typed database boundary, while keeping Auth, Storage buckets, browser grants, and role policies behind their detailed implementation tasks. | The owner approved “Phase 2 核准”; the schema foundation is now needed for the application foundation, but the RLS plan still requires concrete policy tests before exposing data.        | Migration `20260814163450_initial_platform_foundation` is applied to project `cajkkxustehtzyymlopm`; no application route is connected yet.                                                                                                    |

| D-012 | Approved | Owner-authorized Admin UI foundation may begin before the full Phase 5 gate, using only the existing Supabase Auth, `app_metadata.role`, RLS, and private `model-media` boundaries. | The owner explicitly requested a backend UI where Admin/Editor users can create model records and upload the primary and second/hover photo; no image generation is required. | The UI is a bounded Phase 5 preparation slice: no new role, provider, public-route binding, or service-role exposure. Persist photo pair semantics as `media_assets.sort_order` 0 (primary) and 1 (hover). Full operational admin scope remains Phase 5. |
| D-013 | Approved | Extend the owner-authorized admin media slice to support unlimited model gallery media, MP4 uploads, YouTube references, and HTTPS social links per model. | The owner explicitly requested backend-controlled media and profile links, while deferring image generation and public CMS binding. | Add relational link tables with the existing Admin/Editor/Viewer RLS boundary; preserve primary/hover slot semantics and private Storage paths. Public route consumption remains a later verified integration task. |
| D-014 | Approved | Use the owner-created Supabase project `jkhxtuwqmmdetjqymzso` (`Model's Project`, `veryjades's Org Free`, Mumbai) as the current live application project; the earlier `cajkkxustehtzyymlopm` project is historical only. | The owner explicitly directed the implementation to use the newly created project and not the earlier project. The new project is healthy, has the application schema, private media bucket, RLS policies, Auth URL configuration, and the owner invite. | Local and deployment configuration must use the new project URL and publishable key. No service-role key is committed. Existing migration files remain the source of truth and were applied through the new project's SQL Editor. |
| D-015 | Approved | Expand the owner-authorized Admin surface into a content control plane for model records/media, About, News, and a provider-neutral JAgent knowledge/RAG foundation. | The owner explicitly requires a complete backend rather than a model-only form, and requires the existing roster, About content, News, and JAgent knowledge to be manageable without one-off manual edits. | Add narrow relational tables with RLS and published-only anonymous reads. Keep AI provider calls server-side behind an adapter; the first RAG implementation may use Postgres full-text retrieval with an optional vector column, without exposing a provider key or inventing a new CMS provider. |
| D-016 | Approved | Published model media is publicly readable from the `model-media` Storage bucket; database rows remain filtered by `visibility = 'public'`, while authenticated upload/update/delete stays behind the existing Admin/Editor/Viewer policies. | The owner requires Admin uploads to appear on public model profiles, category cards, and keyword pages. A private bucket cannot serve the public frontend without signed URL orchestration and would leave the current media manager disconnected. | Apply an additive grant/policy migration and make only the published bucket public. Do not expose unpublished rows, change role boundaries, or commit service credentials. Reversal is a single migration that restores `public = false` and removes anonymous select policies. |
| D-017 | Approved | Admin access is invitation-first: an Admin chooses `Admin`, `Editor`, or `Viewer` before sending an email invitation; only the server-side role workflow may set trusted `app_metadata.role`, list users, change roles, or delete users. | The owner requires collaborators to authenticate through an invitation and receive a predefined permission set, with full Admin control separated from content editing. | `/admin` exposes an Admin-only Access / invitations panel; `provision-user` validates the caller server-side, sends the invitation to `/admin?reset=1`, assigns the selected role, and prevents self-deletion. The browser never receives a service credential. |
| D-018 | Approved | Current Vercel Preview and Supabase project `jkhxtuwqmmdetjqymzso` are a **development** environment. Production cutover must stay cloud-agnostic. GitHub Student Pack is the first source for go-live resources (email/SMTP, domain extras, monitoring) before any paid SaaS. | The owner confirmed this is not a production stack; Luna's Asana 12% / "production this week" table is not current truth. Data, services, and deploy platform must remain transferable. | Do not promote the current Preview or Supabase project to production. Do not treat D-001's "production platform" wording as meaning the current stack is live. Keep repository/adapter boundaries replaceable. Do not buy a new vendor unless Student Pack cannot provide it. See detailed record below. |
| D-019 | Approved | J Agent retrieves from **already-published** models, News, About, and related public records first. Manual `assistant_knowledge_documents` are an overlay only for special questions that published site content does not cover. Operators must not be required to create knowledge docs as the default path. | The owner rejected “fake RAG” that depends on a small manual corpus. “真 RAG” here means real retrieval over live published content, not a new AI provider. | Do not treat JAG-001 “add a doc then retrieve” as the required product gate. No new AI vendor SDK/secrets; D-002 / Phase 6 remain closed. Prefer repository-backed retrieval, then optional Postgres FTS. Do not invent a new CMS. See detailed record below. |
| D-020 | Approved | J Agent **轉接專人** may open Facebook Messenger and LINE Official Account as human specialist channels, in addition to in-app enquiry / Quick Booking. Deep links only (`m.me` / LINE OA URL) stored in `site_settings`. | The owner asked to 串接 specialist handoff on Messenger and LINE OA without starting Meta/LINE webhooks. | D-003 is unchanged: Facebook deep links first; webhook later. Do not implement Messenger/LINE webhooks, page tokens, or Messaging API event processing (Phase 7). Store official URLs in Admin-editable `site_settings` with empty placeholders until the owner pastes live URLs. No new vendor SDK. |
| D-021 | Approved | Current bilingual is **dual stored fields** plus `pick()` / i18n dictionary. **Not** auto-translate. Phase 6 must solve Chinese-only Admin content with EN auto-translate behind a replaceable adapter (cache translations; no vendor locked in the UI). Until Phase 6, keep dual fields; empty English shows Chinese fallback. | The owner requires a later one-source Chinese workflow without locking a translation vendor now. | Do not add Azure OpenAI, any translation SDK, or auto-translate UI now (D-002). Do not collapse dual fields before Phase 6. See detailed record below. |
| D-022 | Approved | J Agent published-content retrieval is a **Phase 2 authorized slice / Phase 3 public-experience** must-solve (repository, then optional Postgres FTS; no new AI provider). Optional vector / provider RAG quality is **Phase 6**. Admin knowledge CRUD is overlay-only, never the default content path. | D-019 chose published-content-first retrieval but did not split the later vector/provider quality gate from the current repository/FTS gate. | Do not start Phase 6 RAG/provider work now. Do not treat JAG-001 knowledge CRUD as the default operator path. D-019 is not rewritten. See detailed record below. |
| D-023 | Approved | Specialist **deep links**, Admin-editable Messenger/LINE OA URLs, and in-app enquiry/Quick Booking handoff must be solved in **Phase 3** (or the current bounded public/JAgent slice). **Phase 7** must solve Messenger **and** LINE OA webhooks, tokens, and event ingestion. D-003 remains deep-link-first until Phase 7. | D-003 named Facebook webhooks for Phase 7; D-020 added LINE OA as a specialist channel but left Phase 7 Facebook-only in the plan table. | Do not implement webhooks, page tokens, or LINE Messaging API events now. Extend Phase 7 scope to LINE OA; do not silently rewrite D-003. See detailed record below. |
| D-024 | Approved | Portability boundaries (replaceable repository/adapters, cloud-agnostic cutover) must be **kept now**. GitHub Student Pack provisioning of email/SMTP, domain extras, and monitoring must be solved in **Phase 8**, before any production promote. Current Vercel + Supabase stay development. | D-018 named Student Pack first and blocked production, but did not pin Student Pack provisioning to Phase 8. | Do not promote this environment to production. Do not buy paid SaaS first. D-018 is not rewritten. See detailed record below. |
| D-025 | Approved | Remaining hover **second frames** are **post-launch Admin uploads**, not a Phase 2 completion blocker. | Missing same-person hover pairs must not stall News, J Agent retrieval, or specialist-handoff work. | Do not generate images, mix identities, or treat empty hover slots as a Phase 2 fail. UX-010 remaining frames wait for authorised Admin media after launch. See detailed record below. |
| D-026 | Approved | `notify-admin` **real delivery** evidence belongs to **Phase 4** (enquiry/operational notify). If GitHub Student Pack SMTP is the production sender, that sender is provisioned in **Phase 8**. | Outbox and function dispatch exist; live secrets do not. B-005 must not pull paid Resend into the current development environment as the first move. | Do not invent API keys. Do not treat missing production SMTP as a Phase 2 fail. Student Pack remains first (D-018/D-024). See detailed record below. |
| D-027 | Approved | Landing PR #4 / PR #5 onto `main`, plus production DNS/SSL, Sentry/monitoring, and backup/recovery, are **Phase 8 / Phase 9**. Not now. | These are production-cutover gates, not current development-slice work. | Do not retarget PR #5 to `main` until PR #4 is reviewed/merged. Do not promote production, buy Sentry, or configure live DNS/SSL in this environment. See detailed record below. |
| D-029 | Approved | Admin authors **Chinese as the source of truth**. Public EN uses stored English when present, otherwise falls back to Chinese. A **replaceable translation adapter** may fill English later; the default adapter does not call a vendor SDK. | Owner required Chinese-only Admin plus EN as Admin completeness now, without locking a translation vendor. | Dual fields remain. No Azure/OpenAI/translation SDK. Phase 6 may swap the adapter for a cached provider. D-021 is not rewritten; only the “do not start the adapter now” timing is superseded for this no-SDK adapter. |
| D-030 | Approved | Model profiles allow **unlimited** gallery photos and uploaded videos (no count cap). Photos max **10 MiB**; videos max **50 MiB**. YouTube URLs are a separate link/embed field. | Owner required unlimited media with file-size limits. 50 MiB videos stay within typical Storage defaults. | Enforce in Admin UI and Storage adapter. Do not generate images. Hover extra poses remain D-025. |
| D-031 | Approved | Public media slots are a single spec: hero 16:9 1920×1080; model card/hover/profile/gallery 2:3 800×1200; news cover 3:2 1600×1067; video 16:9 1280×720. Display uses **object-fit: cover** and **object-position: center**. | Owner required neat layout and center-crop of mismatched uploads. | Constants live in `src/lib/content/mediaSlots.ts`. Do not add ad-hoc aspect ratios on pages. About has no image slot. |

## Decision lifecycle

- `Proposed`: options are known but implementation must not depend on it.
- `Approved`: implementation may proceed only when its phase is active.
- `Superseded`: retained for history; link to the replacing decision.
- `Rejected`: recorded to prevent the same option from being reopened without new evidence.

## Required record for a new decision

Add an ID, date, status, owner, context, options considered, final decision, rationale, affected phase, and migration/reversal note. Also link the related task or blocker in `TASKS.md`.

## D-018 — Development environment and portable go-live resources

- **Date:** 2026-08-15
- **Status:** Approved
- **Owner:** Project owner (Joseph Chang), recorded by Manager
- **Context:** D-001 named Supabase as the initial production application platform. D-010/D-014 reserved cloud projects. Asana 模特經紀網站發佈計畫 still shows ~12% and a production-readiness cadence that is not the current engineering truth. The owner confirmed the current Vercel Preview + Supabase project are development, not a locked production stack, and that later cutover must remain portable.
- **Options considered:** (1) Treat current Vercel/Supabase as production and buy Resend/Sentry/domain extras now. (2) Keep the current stack as development, preserve replaceable adapters, and source go-live extras from GitHub Student Pack first.
- **Decision:** Option 2. Current Vercel Preview and Supabase `jkhxtuwqmmdetjqymzso` are development. Production cutover must stay cloud-agnostic (data, services, deploy platform transferable). GitHub Student Pack is the first source for go-live resources such as email/SMTP, domain extras, and monitoring. Do not purchase a new SaaS unless Student Pack cannot provide it.
- **Rationale:** Avoids vendor lock-in, avoids spending before Student Pack benefits are applied, and stops Asana/release tables from driving a false production promotion.
- **Affected phase:** Phase 2 continues. Phase 8/9 production readiness stays blocked until a real production target is chosen.
- **Supersedes:** Only the implication in D-001/D-010 that the *current* linked project and Preview are production. D-001 remains the first-platform choice for the development application; it is not rewritten.
- **Migration / reversal:** No schema change. Reversal would require a new decision that names a production target and an approved paid vendor after Student Pack is exhausted.
- **Related tasks:** B-005 (email), REL-001, GOV-003 Asana snapshot.

## D-019 — J Agent retrieves published site content first

- **Date:** 2026-08-15
- **Status:** Approved
- **Owner:** Project owner (Joseph Chang), recorded by Manager
- **Context:** D-015 authorized a provider-neutral JAgent knowledge/RAG foundation and an Admin knowledge-document table. The current operator path treated manual docs as the corpus, which the owner called fake RAG because the information scope is small.
- **Options considered:** (1) Keep JAG-001 “create a knowledge document then retrieve” as the next hard gate. (2) Retrieve from already-published models, News, About, and related public records first; keep manual docs only for uncovered special questions.
- **Decision:** Option 2. J Agent answers visitor questions from live published site content. Manual knowledge documents are an overlay, not the default corpus. Operators should not have to create docs for ordinary About / News / model / policy questions.
- **Rationale:** The site already holds the roster and editorial content. Retrieval must use that public record. “真 RAG” means real retrieval over that content, not Azure OpenAI or a new vendor.
- **Affected phase:** Phase 2. Phase 6 remains closed unless a new decision records a provider.
- **Supersedes:** Only the implication in D-015 that Admin knowledge CRUD is the primary J Agent corpus. D-015 is not rewritten.
- **Migration / reversal:** No provider change. Reversal would require a new decision restoring manual docs as the default corpus.
- **Related tasks:** JAG-001 (overlay only), JAG-002 (published-content retrieval).

## D-020 — J Agent specialist handoff via enquiry, Messenger, and LINE OA

- **Date:** 2026-08-15
- **Status:** Approved
- **Owner:** Project owner (Joseph Chang), recorded by Manager
- **Context:** The owner requires 轉接專人 / 串接 so a visitor can reach a human specialist. D-003 already chose Facebook deep links first and deferred webhooks to Phase 7.
- **Options considered:** (1) Implement Messenger/LINE webhooks and event ingestion now. (2) Offer in-app enquiry/Quick Booking only. (3) Offer in-app enquiry/Quick Booking plus deep links to Facebook Messenger and LINE Official Account, with official URLs stored in `site_settings`.
- **Decision:** Option 3. J Agent handoff opens existing booking/enquiry (Admin Inbox) and may open `m.me` / LINE OA URLs from Admin-editable `site_settings`. Placeholders are allowed until live URLs exist. Do not hardcode a fake page.
- **Rationale:** Matches the owner’s specialist channels without starting Phase 7 webhook work or a new chat vendor.
- **Affected phase:** Phase 2 UI + `site_settings`. Phase 7 remains the webhook/token/event boundary.
- **Supersedes:** Nothing in D-003. D-003 remains Facebook deep links first; webhook later.
- **Migration / reversal:** Additive `messenger_url` and `line_oa_url` on `site_settings`. Reversal drops those columns and the handoff deep-link UI.
- **Related tasks:** JAG-002, OPS-001, D-003/Phase 7.

## D-021 — Dual-field bilingual now; replaceable auto-translate in Phase 6

- **Date:** 2026-08-15
- **Status:** Approved
- **Owner:** Project owner (Joseph Chang), recorded by Manager
- **Context:** The site currently stores English and Chinese as dual fields and selects copy with `pick()` plus an i18n dictionary. The owner wants a later workflow where Admin authors Chinese only and clicking EN auto-translates, without locking a vendor into the UI.
- **Options considered:** (1) Add Azure OpenAI or another translation SDK now. (2) Collapse to a single Chinese field immediately. (3) Keep dual fields until Phase 6, then introduce a replaceable translation adapter with cached EN output and Chinese fallback when English is empty.
- **Decision:** Option 3. Current bilingual remains dual stored fields + `pick()` / i18n dictionary; not auto-translate. Phase 6 must solve Chinese-only Admin content and EN auto-translate via a replaceable adapter (cache translations; no vendor locked in the UI). Until Phase 6, empty English shows Chinese fallback.
- **Rationale:** Preserves D-002 (no provider SDK until Phase 6) while recording the owner’s required later authoring model.
- **Affected phase:** Keep dual fields now (Phase 2/3 content). Must solve auto-translate adapter in **Phase 6**.
- **Supersedes:** Nothing in D-002. D-002 remains provider-abstraction / Azure OpenAI first-permitted; it is not rewritten.
- **Migration / reversal:** No schema collapse now. Phase 6 may add a translation-cache table behind an adapter; reversal restores dual-field authoring.
- **Related tasks:** CMS-005 (current dual fields), future Phase 6 translation adapter. Do not start the adapter now.

## D-022 — J Agent retrieval phases: published content now, vector/provider RAG in Phase 6

- **Date:** 2026-08-15
- **Status:** Approved
- **Owner:** Project owner (Joseph Chang), recorded by Manager
- **Context:** D-019 already chose published models/News/About first, with manual knowledge documents only for uncovered special questions. The owner asked to pin *when* each part must be solved.
- **Options considered:** (1) Treat vector/Azure RAG as the next Phase 2 gate. (2) Split: repository/FTS published-content retrieval in the current Phase 2 authorized slice and Phase 3 public experience; optional vector/provider RAG quality in Phase 6.
- **Decision:** Option 2. Must solve retrieval-from-published-content in the current Phase 2 authorized slice / Phase 3 (repository, then optional Postgres FTS; no new AI provider). Must solve optional vector/provider RAG quality in Phase 6. Do not make Admin knowledge CRUD the default content path.
- **Rationale:** “真 RAG” over live published content does not require Phase 6. Provider-quality RAG does.
- **Affected phase:** Phase 2/3 for published-content retrieval. Phase 6 for optional vector/provider RAG. Phase 6 remains closed for provider SDKs (D-002).
- **Supersedes:** Only the unspecified phase split around D-019. D-019’s published-content-first outcome is unchanged.
- **Migration / reversal:** No provider change. Reversal of the overlay rule still requires a new decision as recorded in D-019.
- **Related tasks:** JAG-002 (published-content retrieval), JAG-001 (overlay only).

## D-023 — Specialist handoff phases: deep links now, Messenger and LINE OA webhooks in Phase 7

- **Date:** 2026-08-15
- **Status:** Approved
- **Owner:** Project owner (Joseph Chang), recorded by Manager
- **Context:** D-003 chose Facebook deep links first and deferred webhooks. D-020 added LINE Official Account as a specialist channel alongside Messenger and in-app enquiry. The owner asked to pin must-solve phases and to include LINE OA in the later webhook gate, not Facebook only.
- **Options considered:** (1) Implement Messenger and LINE webhooks now. (2) Leave Phase 7 Facebook-only. (3) Solve deep links + Admin-editable URLs + in-app enquiry in Phase 3 / current bounded JAgent slice; solve Messenger **and** LINE OA webhooks, tokens, and event ingestion in Phase 7.
- **Decision:** Option 3. Deep-link handoff is a Phase 3 (or current bounded public/JAgent slice) must-solve. Phase 7 scope extends to LINE OA as well as Facebook Messenger. D-003 remains deep-link-first until Phase 7.
- **Rationale:** Matches the owner’s specialist channels without starting Phase 7, and prevents LINE OA from being forgotten when webhooks are later designed.
- **Affected phase:** Phase 3 / current slice for deep links. **Phase 7** for Messenger and LINE OA webhooks, tokens, and event ingestion.
- **Supersedes:** Only the Facebook-only implication of the Phase 7 row in `DEVELOPMENT_PLAN.md`. D-003 and D-020 outcomes are not rewritten.
- **Migration / reversal:** Deep-link columns remain additive (`messenger_url`, `line_oa_url`). Webhook processors stay unbuilt until Phase 7.
- **Related tasks:** JAG-002, OPS-001, future Phase 7 webhook design.

## D-024 — Keep portability now; Student Pack go-live extras in Phase 8

- **Date:** 2026-08-15
- **Status:** Approved
- **Owner:** Project owner (Joseph Chang), recorded by Manager
- **Context:** D-018 already recorded that current Vercel Preview + Supabase `jkhxtuwqmmdetjqymzso` are development, cutover must stay cloud-agnostic, and GitHub Student Pack is first for go-live resources. The owner asked to pin *when* Student Pack provisioning must be solved.
- **Options considered:** (1) Provision paid Resend/Sentry/domain extras in this development environment. (2) Keep replaceable adapters now; provision Student Pack email/SMTP, domain extras, and monitoring in Phase 8 before any production promote.
- **Decision:** Option 2. Must solve portability boundaries now (architecture; D-001 adapters remain replaceable). Must solve Student Pack provisioning of email/domain extras/monitoring in **Phase 8**, before any production promote. Do not promote production in this environment.
- **Rationale:** Avoids locking the development stack as production and avoids buying SaaS before Student Pack is applied.
- **Affected phase:** Portability kept now (Phase 2 architecture). Student Pack extras **Phase 8**. Production promote remains Phase 8/9 after that gate.
- **Supersedes:** Only the unspecified Student Pack timing around D-018. D-018’s development-environment outcome is unchanged.
- **Migration / reversal:** No production cutover in this environment. A later decision must name the production target after Student Pack is applied or exhausted.
- **Related tasks:** B-005, REL-001, Phase 8 production readiness.

## D-025 — Remaining hover second frames are post-launch Admin uploads

- **Date:** 2026-08-15
- **Status:** Approved
- **Owner:** Project owner (Joseph Chang), recorded by Manager
- **Context:** UX-010 / UX-007 still lack genuine same-person hover frames for several models. Empty `model-media` is an open media gate, not a reason to generate or mix identities.
- **Options considered:** (1) Treat remaining hover pairs as a Phase 2 completion blocker and generate substitutes. (2) Defer remaining second frames to post-launch Admin upload.
- **Decision:** Option 2. Remaining hover second frames are post-launch Admin uploads. They are not a Phase 2 blocker.
- **Rationale:** Protects identity/rights rules (D-009) and unblocks News, published-content J Agent retrieval, and specialist-handoff work.
- **Affected phase:** Not Phase 2. Post-launch Admin media (Phase 9 iteration / after launch operations).
- **Supersedes:** Only the implication that UX-010 remaining frames must close Phase 2. D-009/D-012/D-013 media rules are unchanged.
- **Migration / reversal:** No schema change. Cards without a reviewed same-person second frame continue to show primary only.
- **Related tasks:** UX-010, UX-007, CMS-004.

## D-026 — notify-admin real delivery: Phase 4 evidence, Phase 8 production sender

- **Date:** 2026-08-15
- **Status:** Approved
- **Owner:** Project owner (Joseph Chang), recorded by Manager
- **Context:** Enquiry outbox, retry UI, and `notify-admin` dispatch exist. Live Edge Function Secrets have no custom sender. D-018/D-024 forbid paid Resend as the first move.
- **Options considered:** (1) Require a paid Resend account now as a Phase 2 gate. (2) Treat missing live delivery as a Phase 4 operational-workflow evidence item, and provision Student Pack SMTP as the production sender in Phase 8.
- **Decision:** Option 2. Must solve `notify-admin` real delivery evidence in **Phase 4**. If Student Pack SMTP is the production sender, provision it in **Phase 8**.
- **Rationale:** Matches the enquiry-notify completion condition of Phase 4 without promoting this development project or buying SaaS first.
- **Affected phase:** Phase 4 (delivery evidence). Phase 8 (production sender via Student Pack).
- **Supersedes:** Nothing in D-018/D-024. B-005 stays Open until a sender secret exists.
- **Migration / reversal:** No new vendor SDK. Reversal of Student Pack-first still requires a new decision after Student Pack cannot provide SMTP.
- **Related tasks:** OPS-002, B-005.

## D-027 — PR chain, DNS/SSL, monitoring, and backup are Phase 8/9

- **Date:** 2026-08-15
- **Status:** Approved
- **Owner:** Project owner (Joseph Chang), recorded by Manager
- **Context:** Draft PR #4 (`feature/phase-1-foundation` → `main`) and draft PR #5 (`feature/mock-assets` → PR #4 branch) are unreviewed. Production DNS/SSL, Sentry/monitoring, and backup/recovery are unset. Asana 12% is not current engineering truth.
- **Options considered:** (1) Retarget PR #5 to `main`, buy Sentry, and configure live DNS now. (2) Keep these as Phase 8 production-readiness and Phase 9 launch gates.
- **Decision:** Option 2. Landing PR #4 / PR #5 onto `main`, plus DNS/SSL, Sentry/monitoring, and backup/recovery, must be solved in **Phase 8 / Phase 9**. Not now.
- **Rationale:** These are production-cutover gates. This environment is development (D-018/D-024). History must not be rewritten to force them.
- **Affected phase:** Phase 8 (readiness: PR merge onto `main` after review, DNS/SSL, monitoring, backup). Phase 9 (launch once Phase 8 is evidenced).
- **Supersedes:** Nothing in D-005. PR review/merge rules remain. Do not retarget PR #5 to `main` until PR #4 is reviewed and merged.
- **Migration / reversal:** No production promote in this environment.
- **Related tasks:** REL-001, GOV-001/GOV-002 PR chain, Phase 8/9 checklist.

## D-028 — Asana is the visual board; the repository is source of truth

- **Date:** 2026-08-15
- **Status:** Approved
- **Owner:** Project owner (Joseph Chang), recorded by Manager
- **Context:** Asana project 模特經紀網站發佈計畫 previously showed ~2/17 (12%) and status 存在風險. That Luna-style mashup is not current engineering truth. The owner approved Asana as the dashboard they watch, after the repo already recorded D-018–D-027.
- **Options considered:** (1) Treat Asana completion percentage as the launch gate. (2) Create a second Asana project for the phase map. (3) Keep the existing project as a visual board, sync sections/tasks to the recorded phase map, and keep repository control docs as source of truth.
- **Decision:** Option 3. Asana is the owner-facing visual progress board, not source of truth. Do not create a duplicate project. Prefer renaming, completing, and commenting on existing tasks over mass-deleting history.
- **Rationale:** The owner said 好 / 你做事真讓人放心. Agents and reviewers must follow `DECISIONS.md` / `TASKS.md`, not Asana percentages.
- **Affected phase:** All phases. Board columns should show Now / Phase 2–3, Phase 6, Phase 7, Phase 8, and post-launch hover separately.
- **Supersedes:** Only the implication that Asana 12% is engineering truth. D-018 remains the development-environment decision.
- **Migration / reversal:** No schema change. Reversal would require a new decision making Asana canonical.
- **Related tasks:** GOV-003, REL-001.

## D-029 — Chinese-only Admin authoring; replaceable EN adapter without a vendor SDK

- **Date:** 2026-08-16
- **Status:** Approved
- **Owner:** Project owner (Joseph Chang)
- **Context:** D-021 kept dual fields and deferred auto-translate to Phase 6. The owner now requires Chinese-only Admin plus public EN as Admin completeness.
- **Options considered:** (1) Wait for Phase 6 and a paid provider. (2) Collapse to a single Chinese column. (3) Keep dual fields; Admin writes Chinese; empty English falls back to Chinese; a replaceable adapter may fill English later with no vendor SDK bundled now.
- **Decision:** Option 3.
- **Affected phase:** Current Admin completeness slice (Phase 2/5). Phase 6 still owns paid/provider-quality translation and vector RAG.
- **Supersedes:** Only D-021’s “do not start the adapter now” timing. Dual fields, D-002, and no vendor SDK remain.
- **Related tasks:** CMS-000.

## D-030 — Unlimited model gallery media with size limits

- **Date:** 2026-08-16
- **Status:** Approved
- **Owner:** Project owner (Joseph Chang)
- **Context:** Profiles must accept unlimited photos and videos with file-size limits. YouTube remains a separate URL field.
- **Decision:** No count cap. Photos ≤ 10 MiB. Videos ≤ 50 MiB (MP4). YouTube links are stored on `model_video_links` after canonicalization to `https://www.youtube.com/watch?v=…`.
- **Affected phase:** Current Admin completeness. Hover extra poses remain D-025.
- **Related tasks:** ADM-002, CMS-004, CMS-000.

## D-031 — Public media slot geometry and center-crop

- **Date:** 2026-08-16
- **Status:** Approved
- **Owner:** Project owner (Joseph Chang)
- **Context:** Uploaded photos that do not match frontend slots must be center-cropped, not stretched. Slot sizes must be defined once.
- **Decision:** Single spec in `src/lib/content/mediaSlots.ts`:
  - Hero: 16:9, 1920×1080, cover, center
  - Model card / hover / profile / gallery / digitals: 2:3, 800×1200, cover, center
  - News cover: 3:2, 1600×1067, cover, center
  - Video / YouTube frame: 16:9, 1280×720, cover, center
  - About: no image slot
- **Display:** `object-fit: cover` and `object-position: 50% 50%`. Admin shows the slot hint next to uploads.
- **Related tasks:** CMS-000, UX-002.
