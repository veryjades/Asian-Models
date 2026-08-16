# Asian Models — Release Operating Plan

**Current date:** 2026-08-15
**Current phase:** Phase 2 — Application Foundation
**Asana project:** [模特經紀網站發佈計畫](https://app.asana.com/1/1217499298982275/project/1217499223559383)

This document is the layer above individual implementation tasks. Asana is the
owner-facing visual progress board (D-028). GitHub owns source history and review;
the repository control docs own architecture decisions and evidence. Asana
completion percentage is not the launch gate.

## Tool ownership

| Concern                                 | System                                                              | What it controls                                                              |
| --------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Visual progress the owner watches       | Asana 模特經紀網站發佈計畫                                          | Phase-aligned dashboard only. Not source of truth (D-028).                    |
| Decisions and engineering evidence      | `DECISIONS.md`, `DEVELOPMENT_PLAN.md`, `TASKS.md`, `docs/STATUS.md` | Approved boundaries, phase gates, blockers, verification evidence             |
| Code and review                         | GitHub / PR #5                                                      | Feature branches, commits, review, merge history                              |
| Database, Auth, Storage, Edge Functions | Supabase project `jkhxtuwqmmdetjqymzso`                             | SQL schema, RLS, roles, `model-media`, `provision-user`, `notify-admin`, logs |
| Preview and production deploy           | Vercel                                                              | Preview URLs, production promotion, environment variables, rollback           |
| Browser acceptance                      | In-app Browser / Playwright                                         | Route, interaction, responsive, console, crop, hover, and admin smoke tests   |
| Error monitoring                        | Sentry (planned)                                                    | Production exceptions, release health, alerting                               |
| Transactional email                     | Resend or approved SMTP (planned)                                   | Admin notifications, invitations, password recovery delivery                  |
| Domain and TLS                          | DNS registrar + Vercel/Supabase configuration                       | DNS cutover, HTTPS/SSL, media/storage subdomain                               |

## Lifecycle and schedule

| Stage                          | Current schedule        | Primary tools                                           | Exit gate                                                                                      |
| ------------------------------ | ----------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 1. Plan and scope              | 2026-08-14 → 2026-08-18 | Asana, decision log, development plan                   | Scope, success metrics, dependencies, and “do not build” list approved                         |
| 2. Architecture and foundation | 2026-08-19 → 2026-08-27 | GitHub, Supabase SQL/RLS, typed adapters                | Auth, Storage, RLS, role matrix, and adapter boundary verified                                 |
| 3. Product build and migration | 2026-08-23 → 2026-09-01 | React/TanStack, Supabase, Storage, GitHub PR            | Public routes and Admin content controls read/write the approved data boundary                 |
| 4. Preview acceptance          | 2026-08-28 → 2026-09-01 | Vercel Preview, Browser/Playwright                      | Hover pair, crop/black-edge, category/tag/profile/mobile, and console QA pass                  |
| 5. Production readiness        | 2026-09-02 → 2026-09-07 | Vercel, DNS, SSL, Sentry, Supabase logs, email provider | Domain/TLS, secrets, backup/recovery, accessibility, performance, and notification checks pass |
| 6. Launch and handoff          | 2026-09-06 → 2026-09-10 | Vercel production, Asana, GitHub, runbook               | Production smoke/regression, rollback drill, support handoff, and release checklist complete   |
| 7. Operate and iterate         | After launch            | Asana, Sentry, Supabase logs, GitHub PRs                | Incidents, content changes, and follow-up releases remain traceable                            |

## Operating sequence

1. Convert a request into an Asana task with owner, due date, dependency, acceptance evidence, and risk.
2. Record architecture or scope decisions before changing providers, data boundaries, roles, or phase.
3. Implement on `feature/<short-name>`; keep `main` protected and use a PR.
4. Run TypeScript, lint, build, and focused browser checks locally.
5. Deploy a Vercel Preview and validate desktop, mobile, console, data refresh, and visual geometry.
6. Attach evidence to `TASKS.md`, `docs/STATUS.md`, and the matching Asana task; only then mark the gate complete.
7. Before production, verify DNS/SSL, environment variables, email provider, monitoring, backups, and rollback.
8. Promote the reviewed commit, run production smoke/regression, and hand the runbook and Asana status to the owner.

## Current release position

- Asana 模特經紀網站發佈計畫 is the visual board only (D-028). The old **2/17 (12%)** snapshot is not current engineering truth. Sync sections to the recorded phase map; do not invent a parallel Luna-style mashup.
- Current Vercel Preview + Supabase `jkhxtuwqmmdetjqymzso` are **development** (D-018/D-024). Do not promote production here.
- The recorded completed Asana gates are Supabase Auth/Storage/RLS and Admin UI login/roles/permissions; treat them as historical until the project is opened and reconciled.
- The repository already contains additional Admin content controls, model media mapping, public QA, and the section-first Admin workspace, but those items remain open in Asana until their acceptance evidence is formally closed.
- PR #5 is open/draft from `feature/mock-assets` into `feature/phase-1-foundation`; verified HEAD is `c84ee24`. It contains 84 commits and 96 changed files, has no reviewer approval, and currently exposes only Vercel checks.
- PR #4 is the still-open draft dependency from `feature/phase-1-foundation` into `main`; it has no checks or reviews. The PR chain must be repaired without rebasing, force-pushing, amending, or otherwise rewriting published history.
- No image-generation work is in the release plan. Remaining second-frame assets are intended to be uploaded through Admin.

## PR chain recovery

1. Add pinned Bun CI for frozen install, TypeScript, lint, and build on pull requests.
2. Land the governance reconciliation on a focused branch and review its complete diff.
3. Validate PR #4 as the foundation dependency; do not merge it until CI and reviewer approval exist.
4. Retitle and rewrite PR #5 so its description matches the actual public UX, Supabase, Admin, CMS, RAG, and notification scope.
5. Keep PR #5 stacked on PR #4 until PR #4 is approved and merged. After that merge, change PR #5's base to `main`; do not rebase or force-push the published branch.
6. Require current-commit CI, Preview evidence, and reviewer approval before either merge.

## Evidence classification

- **Verified in GOV-001:** local Git state, branch/HEAD/remotes, PR #4/#5 metadata, GitHub checks/reviews, repository files, and branch whitespace results.
- **Documented but not independently reverified:** Supabase live counts/policies/Auth logs, authenticated CRUD, Asana progress, Vercel route behavior, and browser QA.
- **Blocked on authenticated access or external configuration:** platform dashboards, actual email delivery, production DNS/SSL, monitoring, backup/recovery, and production promotion.
