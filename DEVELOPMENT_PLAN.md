# Asian Stars Agency — Development Plan

**Current phase:** Phase 2 — Application Foundation
**Phase owner:** Codex implementation agent  
**Control rule:** A phase can advance only after its completion conditions are evidenced in `TASKS.md` and the next phase's prerequisites are met.

## Phase roadmap

| Phase | Scope                                   | Completion conditions                                                                                                                                           | Do not start before this phase                                                                                            |
| ----- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 0     | Baseline engineering audit              | Dependency/tooling path documented; build and lint status captured; test coverage/absence captured; actionable baseline defects are tracked.                    | Supabase, AI, Messenger/Facebook, admin features, production data migration.                                              |
| 1     | Architecture foundation                 | ADR, Supabase configuration, migration history, typed client/adapter boundary, and RLS plan are reviewed; no existing UI is connected.                          | Cloud migration apply, Auth flows, Storage buckets, role provisioning, AI, Messenger, Admin UI, or new product workflows. |
| 2     | Application foundation                  | Apply the approved schema to a linked project; configure Auth, Storage boundaries, and Admin/Editor/Viewer enforcement after their detailed plans are approved. Keep dual-field bilingual, replaceable adapters, and the current development stack (D-018/D-021/D-024). | End-user product features that depend on unfinished permissions or schema. No translation SDK, no Messenger/LINE webhooks, no production promote. Remaining hover frames are not a Phase 2 gate (D-025). |
| 3     | Public experience and content migration | Public routes, content model, media handling, accessibility, and migration plan meet agreed acceptance criteria. **Must solve:** J Agent retrieval from published models/News/About (repository/FTS; D-019/D-022) and specialist deep links + Admin-editable Messenger/LINE OA URLs + in-app enquiry handoff (D-020/D-023). Empty English continues to fall back to Chinese (D-021). | AI-assisted flows, auto-translate SDK, Facebook **or LINE OA** webhooks, admin operations beyond the approved foundation. |
| 4     | Enquiry and operational workflows       | Booking/contact/application workflows persist safely, notify correctly, and have audit/error handling. **Must solve:** `notify-admin` real delivery evidence (D-026). | AI automation and webhook processing. Paid Resend is not the first sender (D-018/D-024). |
| 5     | Admin operations                        | Admin/Editor/Viewer interfaces enforce the approved authorization model and support agreed content/lead operations. Knowledge-document CRUD remains overlay-only (D-019/D-022). | New roles or unapproved permission expansion. Chinese-only Admin + auto-translate belongs to Phase 6 (D-021). |
| 6     | AI capability                           | Provider abstraction, Azure OpenAI integration (if selected), safety/privacy controls, evaluation cases, and fallback behavior are verified. **Must solve:** (1) Chinese-only Admin content with EN auto-translate via a replaceable adapter, cached translations, no vendor locked in the UI (D-021); (2) optional vector/provider RAG quality over published content (D-022). Dual fields remain until this phase. | Direct provider coupling, translation SDK, or production AI actions without evaluation. Do not start this phase now (D-002). |
| 7     | Messenger and LINE OA integration       | Deep-link path is already the D-003/D-020/D-023 first contact. **Must solve:** Facebook Messenger **and** LINE Official Account webhooks, tokens, and event ingestion after approval, verification, idempotency, and monitoring design. | Webhook/event ingestion, page tokens, or LINE Messaging API processing before this phase. D-003 stays deep-link-first until then. |
| 8     | Production readiness                    | Security review, observability, backups/recovery, performance, accessibility, legal/privacy checks, and release runbook are complete. **Must solve:** GitHub Student Pack provisioning of email/SMTP, domain extras, and monitoring before any production promote (D-024); production sender if Student Pack SMTP is used (D-026); DNS/SSL, Sentry/monitoring, backup, and reviewed merge of PR #4 / PR #5 onto `main` (D-027). Current Vercel+Supabase stay development. | Production release before this readiness gate. Do not promote the current development environment. |
| 9     | Launch and iteration                    | Production launch checklist is complete; ownership, support, analytics, and post-launch measurement are operating. Remaining hover second frames may be uploaded through Admin after launch (D-025). | Unreviewed changes directly in production. |

## Must-solve by phase (owner 2026-08-15)

These are durable phase pins. Do not start a later item during the current Phase 2 slice. Existing Approved decisions are not rewritten; new IDs only add the phase split.

| Must solve | Phase | Decision | Do not start now |
| --- | --- | --- | --- |
| Dual stored bilingual fields + `pick()` / i18n; empty EN → Chinese fallback | Keep now (Phase 2/3) | D-021 | Auto-translate SDK |
| Chinese-only Admin + EN auto-translate via replaceable cached adapter | 6 | D-021 | Azure/OpenAI/translation SDK (D-002) |
| J Agent retrieval from published models/News/About (repository, then optional FTS) | 2 authorized slice / 3 | D-019, D-022 | Treating knowledge CRUD as the default corpus |
| Optional vector/provider RAG quality | 6 | D-022 | Phase 6 RAG/provider work |
| Specialist deep links, Admin-editable `m.me` / LINE OA URLs, in-app enquiry/Quick Booking | 3 or current bounded JAgent slice | D-020, D-023 | Fake hardcoded page URLs |
| Messenger **and** LINE OA webhooks, tokens, event ingestion | 7 | D-003, D-023 | Webhooks/tokens/Messaging API now |
| Replaceable adapters / cloud-agnostic cutover | Keep now | D-001, D-018, D-024 | Binding the product to one irreplaceable vendor |
| Student Pack email/SMTP, domain extras, monitoring; then production promote | 8 | D-018, D-024 | Promoting this Vercel+Supabase stack |
| `notify-admin` real delivery evidence | 4 | D-026 | Inventing sender keys; paid Resend first |
| Production sender if Student Pack SMTP is used | 8 | D-024, D-026 | — |
| Remaining hover second frames | Post-launch Admin upload | D-025 | Image generation / mixed-identity substitutes |
| Asana visual board vs repository source of truth | Dashboard now; never the launch gate | D-028 | Duplicate Asana project; treating 12% as truth |

## Phase 0 gate — current work

### Required evidence

- Record the package manager/toolchain available to the agent and any mismatch with the repository lockfile. Bun is canonical per D-006; a local environment without Bun is an onboarding/tooling gap, not permission to switch to npm.
- Run and record `lint` and `build` results using a reproducible command path.
- Record whether automated tests exist, how they would run, or explicitly record their absence.
- Record the recommended minimum test strategy without introducing a test framework unless it is separately approved.
- Turn every failure into a bounded task with an owner and next action.
- Make no application feature, data-platform, AI, Messenger, or admin implementation changes.

### Explicitly prohibited while Phase 0 is active

- Adding Supabase SDK/configuration, schema, migrations, Auth, Storage, RLS, or credentials.
- Adding Azure OpenAI or any AI-provider SDK, API key, prompt flow, or assistant feature.
- Adding Facebook/Messenger OAuth, webhooks, tokens, event processors, or Meta configuration.
- Building admin screens or RBAC enforcement.

## Phase 1 gate — current work

### Completion conditions

- ADR-001 records the approved platform, database, Auth, role, Storage, and future-AI boundaries.
- Supabase configuration, `.env.example`, typed client, and adapter boundary are present without secrets or UI wiring.
- The initial migration creates the approved data foundation and enables RLS on every exposed table.
- The RLS policy plan defines the intended audiences before any browser grants or policies are implemented.
- Lint and build pass; cloud/local migration application is tracked separately until a Supabase project or local database is available.

### Explicitly prohibited while Phase 1 is active

- Connecting existing UI forms or routes to Supabase.
- Creating a Supabase cloud project, applying migrations to it, or committing any secret.
- Implementing model login, Messenger webhooks, AI workflows, automatic casting, pricing, Admin UI, or production role provisioning.

### Authorised experience-validation exception

Under D-008 and D-009, a focused public mock-asset/presentation iteration may
run on an isolated feature branch while Phase 1 foundation review remains open.
It may add fictional, rights-safe media documentation, presentation metadata,
and reusable image rendering components, then validate them on a Preview
deployment. It must not wire UI to Supabase, alter the data architecture, add
an AI product runtime, provision cloud resources, or expand into unrelated
public-feature work.

## Phase 2 gate — current work

### Completion conditions

- The approved foundation migration is applied to the linked Supabase project and generated types match the live schema.
- Auth configuration, Storage bucket/path boundaries, and Admin/Editor/Viewer role claims are documented and tested.
- RLS policies and explicit Data API grants match the approved audience matrix; unauthenticated and each authenticated role have verification evidence.
- Existing public routes remain cloud-agnostic until the policy and adapter tests pass.

### Explicitly prohibited while Phase 2 is active

- Exposing `service_role` or any secret in browser code or committed environment files.
- Connecting public forms/routes to tables before RLS and Data API grant tests pass.
- Adding AI, translation SDKs, Azure OpenAI, or auto-translate UI (D-002 / D-021). Phase 6 only.
- Adding Messenger/Facebook **or LINE OA** webhooks, page tokens, or event processing (D-003 / D-023). Phase 7 only. Deep links in the current JAgent slice are allowed.
- Promoting the current Vercel Preview or Supabase project to production, buying paid go-live SaaS before Student Pack, or configuring production DNS/SSL/Sentry/backup (D-018 / D-024 / D-027). Phase 8/9 only.
- Treating remaining hover second frames as a Phase 2 fail or generating substitute photos (D-025).
- Making Admin knowledge-document CRUD the default J Agent content path (D-019 / D-022).

### Authorised current slice (still Phase 2; do not jump to Phase 6/7/8)

On `feature/dev-env-news-gate`, continue News public binding, published-content J Agent retrieval, and Messenger/LINE OA **deep-link** handoff plus in-app enquiry. That work is the D-019/D-020/D-022/D-023 Phase 2/3 slice. It is not permission to start translation adapters or webhooks.

## Control documents

- Decisions: `DECISIONS.md`
- Current work and blockers: `TASKS.md`
- Architecture notes: `docs/architecture/`
- Agent operating rules: `AGENTS.md`
- Latest heartbeat: `docs/STATUS.md`

## Canonical local and CI workflow

- Requirement: Bun 1.x; CI must pin an explicit Bun version.
- Install: `bun install --frozen-lockfile`
- Development: `bun run dev`
- Verification: `bun run lint` and `bun run build`
- CI recommendation: install the pinned Bun version, run the frozen install, then run lint and build. Do not generate or commit another lockfile.
