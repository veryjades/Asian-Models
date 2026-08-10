# Asian Stars Agency — Task Board

**Current phase:** Phase 0 — Baseline engineering audit  
**Last updated:** 2026-08-10

## Phase 0 — COMPLETE

All Phase 0 tasks below are complete. PR #2 is open for review; merging it is a review workflow step, not Phase 1 implementation.

## Phase 0 tasks

| ID | Task | Owner | Status | Dependencies | Evidence / next action |
| --- | --- | --- | --- | --- | --- |
| P0-001 | Capture the current branch, commit, remotes, and worktree state. | Codex | Complete | None | `feature/baseline` at `302a318`; working tree was clean before control-document changes; `origin` is `veryjades/Asian-Models`. |
| P0-002 | Establish repository control documents and agent operating rules. | Codex | Complete | P0-001 | `DECISIONS.md`, `DEVELOPMENT_PLAN.md`, `TASKS.md`, `docs/architecture/README.md`, and `AGENTS.md` now define the shared control system. |
| P0-003 | Establish a reproducible package-manager/toolchain path. | Codex | Complete | D-006 | D-006 approves Bun 1.x as canonical. Setup is `bun install --frozen-lockfile`; CI must pin an explicit Bun version and run frozen install, lint, and build. This environment lacks Bun, so npm was used only for verification and no lockfile was changed. |
| P0-004 | Record lint baseline and bound failures. | Codex | Complete | None | Initial lint had 46 Prettier errors in 17 existing files and no non-Prettier errors. Applied the repository Prettier configuration to those files. `npm run lint` now exits 0 with 9 existing React-refresh warnings and 0 errors. |
| P0-005 | Record production build baseline. | Codex | Complete | P0-004 | `npm run build` completed successfully on 2026-08-10 after the baseline formatting changes; it emitted non-fatal Vite/Nitro warnings. |
| P0-006 | Establish automated-test baseline. | Codex | Complete | None | No test files, test runner dependency, or `test` script exists. Minimum recommended future strategy: first add unit tests for pure content/repository/i18n behavior, then add route/workflow integration tests only when their Phase 1 acceptance criteria exist. No framework was added. |
| P0-007 | Open the control-protocol draft pull request. | Codex | Complete | B-003 | Draft PR [#2](https://github.com/veryjades/Asian-Models/pull/2) is open from `feature/baseline` to `main` with the Phase 0 verification evidence. |

## Decision blockers

| ID | Context | Options | Impact | Proposed owner | Status |
| --- | --- | --- | --- | --- | --- |
| B-001 | This environment has no Bun executable even though the repository's canonical workflow is Bun. | Install Bun 1.x for local/CI execution; do not switch the repository to npm. | This checkout cannot locally reproduce the canonical install command until Bun is installed. | Repository owner / environment maintainer | Resolved by D-006; environment follow-up |
| B-002 | There is no automated test command or runner. | Baseline absence and minimum strategy have been documented in P0-006; select/implement a framework only when a later phase authorizes it. | Future regression confidence, not the current Phase 0 baseline gate. | Tech lead / product owner | Resolved for Phase 0 |
| B-003 | GitHub PR creation initially returned 403 through the connector. | CLI fallback created draft PR [#2](https://github.com/veryjades/Asian-Models/pull/2). | Required review/merge path is now available. | Repository owner / reviewer | Resolved |

## Update protocol

- Set a task to `In progress` before changing its scope; set it to `Complete` only with concrete evidence.
- Use `Blocked` only when the work cannot proceed without an approved decision or external change; create a corresponding decision blocker.
- Do not remove completed tasks or blockers; preserve history and add a new row if the work is reopened.
- The agent should resolve ordinary technical questions from the repository and current decisions. Only decision blockers require a recorded escalation.

## Phase 1 — Planned tasks (not started)

| ID | Planned task | Owner | Status | Dependency | Next step |
| --- | --- | --- | --- | --- | --- |
| P1-001 | Confirm product/domain scope, user journeys, content inventory, and acceptance criteria. | Unassigned | Planned | PR #2 reviewed/merged | Obtain approved product/domain brief. |
| P1-002 | Document data ownership and the boundary between public content and future application data. | Unassigned | Planned | P1-001 | Add an architecture note under `docs/architecture/` if needed. |
| P1-003 | Prepare the Phase 1 exit gate and implementation backlog. | Unassigned | Planned | P1-001, P1-002 | Record approved scope and dependencies before any Phase 2 work. |

No Phase 1 task is in progress, and no Phase 1 feature implementation is included in this branch.
