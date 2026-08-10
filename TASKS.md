# Asian Stars Agency — Task Board

**Current phase:** Phase 0 — Baseline engineering audit  
**Last updated:** 2026-08-10

## Active tasks

| ID | Task | Owner | Status | Dependencies | Evidence / next action |
| --- | --- | --- | --- | --- | --- |
| P0-001 | Capture the current branch, commit, remotes, and worktree state. | Codex | Complete | None | `feature/baseline` at `302a318`; working tree was clean before control-document changes; `origin` is `veryjades/Asian-Models`. |
| P0-002 | Establish repository control documents and agent operating rules. | Codex | Complete | P0-001 | `DECISIONS.md`, `DEVELOPMENT_PLAN.md`, `TASKS.md`, `docs/architecture/README.md`, and `AGENTS.md` now define the shared control system. |
| P0-003 | Establish a reproducible package-manager/toolchain path. | Codex | Blocked | Local executable availability | Repository has `bun.lock`, but Bun is not installed in this environment. Node `v25.0.0` and npm `11.18.0` are available. Decide/document the supported CI and local package-manager command without changing product code. |
| P0-004 | Record lint baseline and bound failures. | Codex | Blocked | P0-003 | `npm run lint` runs but fails on existing Prettier errors across source files; split/track remediation after the toolchain path is confirmed. |
| P0-005 | Record production build baseline. | Codex | Complete | None | `npm run build` completed successfully on 2026-08-10; it emitted non-fatal Vite/Nitro warnings. |
| P0-006 | Establish automated-test baseline. | Codex | Blocked | None | `package.json` has no `test` script or test runner dependency. Record whether tests must be introduced before Phase 1 or accept this as an explicit Phase 0 exception. |
| P0-007 | Open the control-protocol draft pull request. | Codex | Blocked | B-003 | Branch `feature/baseline` was pushed, but GitHub rejected draft PR creation with account-suspension error 403. Retry after account access is restored. |

## Decision blockers

| ID | Context | Options | Impact | Proposed owner | Status |
| --- | --- | --- | --- | --- | --- |
| B-001 | The repository carries `bun.lock`, but the current environment has no Bun executable; npm can run installed dependencies. | Install/use Bun in CI and local onboarding; or formally support npm with a generated lockfile; or document another supported runtime. | Reproducible dependency installation and baseline verification. | Tech lead / repository maintainer | Open |
| B-002 | There is no automated test command or runner. | Add a test strategy in a later approved phase; or explicitly waive tests for the current static-site baseline with documented acceptance criteria. | Phase 0 exit criteria and future regression confidence. | Tech lead / product owner | Open |
| B-003 | GitHub API returned `403` stating that the `veryjades` account is suspended when opening a draft PR. | Restore account access, then create the PR from `feature/baseline`; or have an authorized maintainer open the PR. | The branch is pushed, but the required review/merge path cannot start. | Repository owner / GitHub Support | Open |

## Update protocol

- Set a task to `In progress` before changing its scope; set it to `Complete` only with concrete evidence.
- Use `Blocked` only when the work cannot proceed without an approved decision or external change; create a corresponding decision blocker.
- Do not remove completed tasks or blockers; preserve history and add a new row if the work is reopened.
- The agent should resolve ordinary technical questions from the repository and current decisions. Only decision blockers require a recorded escalation.
