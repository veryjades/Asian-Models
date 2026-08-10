# Asian Stars Agency — Decision Log

**Status:** active project control record  
**Last updated:** 2026-08-10  
**How to use:** Record approved, durable choices here before implementation. Do not silently edit a decision's outcome; supersede it with a new decision that links to the prior ID.

## Decision register

| ID | Status | Decision | Rationale | Consequence / boundary |
| --- | --- | --- | --- | --- |
| D-001 | Approved | Use **Supabase** as the initial production application platform for database, authentication, and storage. | Provides a coherent managed base for the first production release. | No Supabase code, schema, migrations, credentials, or policies may be added until Phase 2 is active. |
| D-002 | Approved | Keep AI behind a **provider abstraction**; the first permitted provider may be **Azure OpenAI**. | Prevents product logic from being coupled to one AI vendor. | No provider SDK, secrets, prompts, or AI user flow may be added until Phase 6 is active. |
| D-003 | Approved | Use **Facebook deep links first**; evaluate webhook integration later. | Keeps the first contact path simple while Meta permissions and webhook scope are deferred. | No Messenger/Facebook webhook, token, or event-processing implementation before Phase 7. |
| D-004 | Approved | First-release RBAC roles are **Admin**, **Editor**, and **Viewer**. | Establishes a small, understandable permission model. | Role semantics and enforcement are designed in Phase 2; no admin UI before Phase 5. |
| D-005 | Approved | Use **feature branches and pull requests**; `main` is protected from direct implementation commits. | Creates reviewable, recoverable collaboration between agents and humans. | Work must be scoped to a branch and include verification evidence in its PR/task record. |
| D-006 | Approved | **Bun** is the canonical package-manager workflow. Bun 1.x is required; CI must pin an explicit Bun version, while local setup must use a compatible current Bun 1.x release until that pin is recorded. | The repository has the only lockfile (`bun.lock`) and Bun-specific configuration (`bunfig.toml`); npm can run the existing checkout but is not the supported dependency-install workflow. | Run `bun install --frozen-lockfile`, then `bun run dev`, `bun run lint`, or `bun run build`. Do not add another lockfile or switch package managers. CI should use a pinned Bun setup action/version, run frozen install, then lint and build. |
| D-007 | Approved | Phase 1 establishes the Supabase architecture foundation: local configuration, migration history, typed browser client, adapter boundary, and RLS policy plan. | Luna approved this bounded foundation before UI, Auth flow, Storage bucket, or operational workflow implementation. | Do not connect existing forms/UI, apply a migration to a cloud project, create storage buckets, provision roles, or implement AI, Messenger, model login, automatic casting, or pricing in this task. See ADR-001. |

## Decision lifecycle

- `Proposed`: options are known but implementation must not depend on it.
- `Approved`: implementation may proceed only when its phase is active.
- `Superseded`: retained for history; link to the replacing decision.
- `Rejected`: recorded to prevent the same option from being reopened without new evidence.

## Required record for a new decision

Add an ID, date, status, owner, context, options considered, final decision, rationale, affected phase, and migration/reversal note. Also link the related task or blocker in `TASKS.md`.
