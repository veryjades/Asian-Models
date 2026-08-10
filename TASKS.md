# Asian Stars Agency — Task Board

**Current phase:** Phase 0 — Baseline engineering audit  
**Last updated:** 2026-08-10

## Active tasks

| ID | Task | Owner | Status | Dependencies | Evidence / next action |
| --- | --- | --- | --- | --- | --- |
| P0-001 | Capture the current branch, commit, remotes, and worktree state. | Codex | Complete | None | `feature/baseline` at `302a318`; working tree was clean before control-document changes; `origin` is `veryjades/Asian-Models`. |
| P0-002 | Establish repository control documents and agent operating rules. | Codex | Complete | P0-001 | `DECISIONS.md`, `DEVELOPMENT_PLAN.md`, `TASKS.md`, `docs/architecture/README.md`, and `AGENTS.md` now define the shared control system. |
| P0-003 | Establish a reproducible package-manager/toolchain path. | Codex | Blocked | D-006 / B-001 | Inspection confirms Bun is the only represented workflow (`bun.lock` and `bunfig.toml`); this environment lacks Bun while Node `v25.0.0` and npm `11.18.0` are available. D-006 records the required confirmation; no package-manager change was made. |
| P0-004 | Record lint baseline and bound failures. | Codex | Complete | None | Initial lint had 46 Prettier errors in 17 existing files and no non-Prettier errors. Applied the repository Prettier configuration to those files. `npm run lint` now exits 0 with 9 existing React-refresh warnings and 0 errors. |
| P0-005 | Record production build baseline. | Codex | Complete | P0-004 | `npm run build` completed successfully on 2026-08-10 after the baseline formatting changes; it emitted non-fatal Vite/Nitro warnings. |
| P0-006 | Establish automated-test baseline. | Codex | Complete | None | No test files, test runner dependency, or `test` script exists. Minimum recommended future strategy: first add unit tests for pure content/repository/i18n behavior, then add route/workflow integration tests only when their Phase 1 acceptance criteria exist. No framework was added. |
| P0-007 | Open the control-protocol draft pull request. | Codex | Blocked | B-003 | Branch `feature/baseline` was pushed, but GitHub rejected draft PR creation with account-suspension error 403. Retry after account access is restored. |

## Decision blockers

| ID | Context | Options | Impact | Proposed owner | Status |
| --- | --- | --- | --- | --- | --- |
| B-001 | The repository carries `bun.lock` and `bunfig.toml`, but the current environment has no Bun executable; npm can run installed dependencies. | Approve D-006 and document a supported Bun version/CI/local command; or explicitly change the canonical workflow through a superseding decision. | Reproducible dependency installation and baseline verification. | Tech lead / repository maintainer | Open |
| B-002 | There is no automated test command or runner. | Baseline absence and minimum strategy have been documented in P0-006; select/implement a framework only when a later phase authorizes it. | Future regression confidence, not the current Phase 0 baseline gate. | Tech lead / product owner | Resolved for Phase 0 |
| B-003 | GitHub API returned `403` stating that the `veryjades` account is suspended when opening a draft PR. | Restore account access, then create the PR from `feature/baseline`; or have an authorized maintainer open the PR. | The branch is pushed, but the required review/merge path cannot start. | Repository owner / GitHub Support | Open |

## Update protocol

- Set a task to `In progress` before changing its scope; set it to `Complete` only with concrete evidence.
- Use `Blocked` only when the work cannot proceed without an approved decision or external change; create a corresponding decision blocker.
- Do not remove completed tasks or blockers; preserve history and add a new row if the work is reopened.
- The agent should resolve ordinary technical questions from the repository and current decisions. Only decision blockers require a recorded escalation.
