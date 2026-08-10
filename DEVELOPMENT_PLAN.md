# Asian Stars Agency — Development Plan

**Current phase:** Phase 0 — Baseline engineering audit  
**Phase owner:** Codex implementation agent  
**Control rule:** A phase can advance only after its completion conditions are evidenced in `TASKS.md` and the next phase's prerequisites are met.

## Phase roadmap

| Phase | Scope | Completion conditions | Do not start before this phase |
| --- | --- | --- | --- |
| 0 | Baseline engineering audit | Dependency/tooling path documented; build and lint status captured; test coverage/absence captured; actionable baseline defects are tracked. | Supabase, AI, Messenger/Facebook, admin features, production data migration. |
| 1 | Product and domain design | User journeys, content/domain inventory, data ownership, and acceptance criteria approved; architecture notes created as needed. | Production schema, auth implementation, external integrations. |
| 2 | Application foundation | Approved Supabase project/config strategy, initial schema/migrations, Auth setup, Storage boundaries, and Admin/Editor/Viewer authorization design are verified. | End-user product features that depend on unfinished permissions or schema. |
| 3 | Public experience and content migration | Public routes, content model, media handling, accessibility, and migration plan meet agreed acceptance criteria. | AI-assisted flows, Facebook webhooks, admin operations beyond the approved foundation. |
| 4 | Enquiry and operational workflows | Booking/contact/application workflows persist safely, notify correctly, and have audit/error handling. | AI automation and webhook processing. |
| 5 | Admin operations | Admin/Editor/Viewer interfaces enforce the approved authorization model and support agreed content/lead operations. | New roles or unapproved permission expansion. |
| 6 | AI capability | Provider abstraction, Azure OpenAI integration (if selected), safety/privacy controls, evaluation cases, and fallback behavior are verified. | Direct provider coupling or production AI actions without evaluation. |
| 7 | Facebook/Messenger integration | Deep-link path is verified; webhook scope, Meta approval, verification, idempotency, and monitoring are approved before webhook implementation. | Webhook/event ingestion before approval and security design. |
| 8 | Production readiness | Security review, observability, backups/recovery, performance, accessibility, legal/privacy checks, and release runbook are complete. | Production release before readiness gate. |
| 9 | Launch and iteration | Production launch checklist is complete; ownership, support, analytics, and post-launch measurement are operating. | Unreviewed changes directly in production. |

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
