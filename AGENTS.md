<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Project control protocol

The repository is the shared source of truth for project direction. Before planning,
implementing, reviewing, or changing task state, read these files in order:

1. `DECISIONS.md` — approved product and architecture decisions.
2. `DEVELOPMENT_PLAN.md` — the current phase, completion gate, and work that is out of scope.
3. `TASKS.md` — the active work, owner, dependency, evidence, and next action.
4. Any phase-specific documents under `docs/architecture/` that the files above reference.

## Operating rules

- Do not change architecture, providers, data boundaries, roles, integrations, or the phase plan unless a new approved decision is recorded in `DECISIONS.md`.
- Do not start work from a later phase. Respect the current phase and the explicit "Do not start" list in `DEVELOPMENT_PLAN.md`.
- When a decision is missing or blocked, add a concise entry to the **Decision blockers** table in `TASKS.md` (context, options, impact, proposed owner). Continue with unrelated in-scope work; do not ask the end user to relay a question between agents.
- Keep `TASKS.md` current when work starts, completes, becomes blocked, or changes owner. Include verification evidence where applicable.
- Use a focused `feature/<short-name>` branch for every change. Do not commit directly to `main`; open a pull request for review and merge only after its required checks pass.
- In this checkout, `origin` (`veryjades/Asian-Models`) is the project-control remote. The `lovable` remote points to a separate repository; do not push to it unless the task explicitly asks for a Lovable sync.
- Preserve the Lovable history rule above: never force-push, rebase, amend, or otherwise rewrite published history.
- Keep changes narrow. Do not implement product features while performing governance, audit, or baseline work unless the active task explicitly authorizes them.
