# Asian Stars Agency — Task Board

**Current phase:** Phase 1 — Architecture Foundation
**Last updated:** 2026-08-10

## Phase 0 — COMPLETE

All Phase 0 tasks below are complete. PR #2 merged into `main` as `875f9eb`.

## Phase 0 tasks

| ID     | Task                                                              | Owner | Status   | Dependencies | Evidence / next action                                                                                                                                                                                                                                                                    |
| ------ | ----------------------------------------------------------------- | ----- | -------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0-001 | Capture the current branch, commit, remotes, and worktree state.  | Codex | Complete | None         | `feature/baseline` at `302a318`; working tree was clean before control-document changes; `origin` is `veryjades/Asian-Models`.                                                                                                                                                            |
| P0-002 | Establish repository control documents and agent operating rules. | Codex | Complete | P0-001       | `DECISIONS.md`, `DEVELOPMENT_PLAN.md`, `TASKS.md`, `docs/architecture/README.md`, and `AGENTS.md` now define the shared control system.                                                                                                                                                   |
| P0-003 | Establish a reproducible package-manager/toolchain path.          | Codex | Complete | D-006        | D-006 approves Bun 1.x as canonical. Setup is `bun install --frozen-lockfile`; CI must pin an explicit Bun version and run frozen install, lint, and build. This environment lacks Bun, so npm was used only for verification and no lockfile was changed.                                |
| P0-004 | Record lint baseline and bound failures.                          | Codex | Complete | None         | Initial lint had 46 Prettier errors in 17 existing files and no non-Prettier errors. Applied the repository Prettier configuration to those files. `npm run lint` now exits 0 with 9 existing React-refresh warnings and 0 errors.                                                        |
| P0-005 | Record production build baseline.                                 | Codex | Complete | P0-004       | `npm run build` completed successfully on 2026-08-10 after the baseline formatting changes; it emitted non-fatal Vite/Nitro warnings.                                                                                                                                                     |
| P0-006 | Establish automated-test baseline.                                | Codex | Complete | None         | No test files, test runner dependency, or `test` script exists. Minimum recommended future strategy: first add unit tests for pure content/repository/i18n behavior, then add route/workflow integration tests only when their Phase 1 acceptance criteria exist. No framework was added. |
| P0-007 | Open the control-protocol draft pull request.                     | Codex | Complete | B-003        | PR [#2](https://github.com/veryjades/Asian-Models/pull/2) merged from `feature/baseline` into `main` as `875f9eb`.                                                                                                                                                                        |

## Decision blockers

| ID    | Context                                                                                        | Options                                                                                                                                   | Impact                                                               | Proposed owner                            | Status               |
| ----- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------- | -------------------- |
| B-001 | This environment originally lacked Bun even though the repository's canonical workflow is Bun. | Bun 1.3.14 is now installed locally; CI still needs an explicit version pin.                                                              | `bun install --frozen-lockfile` now succeeds locally.                | Repository owner / environment maintainer | Resolved             |
| B-002 | There is no automated test command or runner.                                                  | Baseline absence and minimum strategy have been documented in P0-006; select/implement a framework only when a later phase authorizes it. | Future regression confidence, not the current Phase 0 baseline gate. | Tech lead / product owner                 | Resolved for Phase 0 |
| B-003 | GitHub PR creation initially returned 403 through the connector.                               | CLI fallback created draft PR [#2](https://github.com/veryjades/Asian-Models/pull/2).                                                     | Required review/merge path is now available.                         | Repository owner / reviewer               | Resolved             |

## Update protocol

- Set a task to `In progress` before changing its scope; set it to `Complete` only with concrete evidence.
- Use `Blocked` only when the work cannot proceed without an approved decision or external change; create a corresponding decision blocker.
- Do not remove completed tasks or blockers; preserve history and add a new row if the work is reopened.
- The agent should resolve ordinary technical questions from the repository and current decisions. Only decision blockers require a recorded escalation.

## Phase 1 — Architecture Foundation

| ID     | Planned task                                                                                  | Owner | Status   | Dependency                                | Next step                                                                                                                                             |
| ------ | --------------------------------------------------------------------------------------------- | ----- | -------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1-001 | Start the approved architecture foundation.                                                   | Codex | Complete | D-007                                     | ADR-001 records the approved scope and boundaries.                                                                                                    |
| P1-002 | Create Supabase local configuration, environment template, and typed browser client boundary. | Codex | Complete | P1-001                                    | `supabase/`, `.env.example`, `src/lib/supabase/client.ts`, and the client package are present without secrets or UI wiring.                           |
| P1-003 | Create initial PostgreSQL migration, database types, and agency adapter layer.                | Codex | Complete | P1-001                                    | Migration `20260810150546_initial_platform_foundation.sql` defines models, portfolios, media assets, clients, bookings, indexes, timestamps, and RLS. |
| P1-004 | Record the first-pass RLS policy plan.                                                        | Codex | Complete | P1-003                                    | `docs/RLS_POLICY_PLAN.md` defines the role/access matrix; no browser policies or grants are enabled.                                                  |
| P1-005 | Apply and validate the migration against a local or linked Supabase project.                  | Codex | Blocked  | Local Docker or approved Supabase project | `supabase migration list --local` cannot connect to local Postgres; do not link or apply to a cloud project without approval.                         |

Phase 1 architecture work is in progress. No existing UI, form, Auth flow, Storage bucket, AI, Messenger, Admin, or other product feature is included in this branch.

## Experience-validation iteration — Mock assets

| ID     | Task                                                                                                                     | Owner | Status   | Dependency            | Evidence / next action                                                                                                                                                                                                                                              |
| ------ | ------------------------------------------------------------------------------------------------------------------------ | ----- | -------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UX-001 | Record the fictional, licensed/AI-first mock asset policy and future CMS replacement path.                               | Codex | Complete | D-009                 | `docs/MOCK_ASSET_GUIDE.md` defines source policy, review checks, prompts, provenance metadata, dimensions, and replacement workflow.                                                                                                                                |
| UX-002 | Add a presentation component that accepts asset-level aspect ratio, focal position, fit, and responsive source metadata. | Codex | Complete | UX-001                | `AgencyImage` is applied to hero, portrait cards, full-body profile, and gallery surfaces. `bun run lint` passes with 0 errors; `bun run build` passes. Asset-specific visual validation remains UX-004.                                                            |
| UX-003 | Generate and review fictional premium-fashion mock assets.                                                               | Codex | Complete | Approved CLI fallback | 18 reviewed fictional adult WebP assets are mapped in `src/lib/content/mockAssets.ts`; provenance, prompt intent, dimensions, and usage are recorded in `docs/GOLDEN_MOCK_ASSET_SET.md`.                                                                            |
| UX-004 | Deploy the resulting branch to an isolated Preview and complete desktop/mobile experience review.                        | Codex | Complete | UX-002, UX-003        | Preview `asian-models-gxon1hn2t-asian-models.vercel.app` is READY for commit `02ab7ea`; desktop and 390px DOM review passed for the three hero CTAs, board/profile mapping, and desktop arrows. Touch swipe is implemented but needs stakeholder device acceptance. |

| UX-005 | Make the homepage image sequence visually consistent from Hero through Featured Models and News. | Codex | In progress | UX-004, D-008, D-009 | **Problem:** legacy News covers break the premium Golden-asset visual flow. **Assumption:** reuse only compositionally suitable Golden assets and add only essential reviewed fictional editorial covers. **Smallest change:** replace the three homepage News cover references without changing routes, copy, architecture, or dependencies. **Preview:** inspect Hero → Featured → News at desktop and 390px. **Observe next:** whether any remaining legacy board content affects the homepage experience. |

### UX-002 iteration card

1. **User-experience problem:** current prototype imagery can read as a placeholder and wide hero framing can crop a model's head or feet.
2. **Assumption:** asset-level presentation metadata and a safe rendering boundary prevent pages from silently imposing an unsafe crop.
3. **Smallest verifiable change:** one reusable `AgencyImage` component plus opt-in use on hero, portrait-card, full-body, and portfolio surfaces.
4. **Preview validation:** inspect the homepage, board, and model profile at desktop and 390px; verify intended focal areas and no crop imposed by page CSS.
5. **Next observation:** determine which generated asset composition requires a separate mobile source rather than a focal-point adjustment.
