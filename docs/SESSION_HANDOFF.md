# Session handoff — paste into a new Cursor chat

**Date:** 2026-09-24  
**Control order:** `DECISIONS.md` → `DEVELOPMENT_PLAN.md` → `TASKS.md` → `docs/STATUS.md`.

## Role

- Owner: Joseph. Relays between agents.
- Cursor agent: **PM / supervisor** + can execute Phase 2 tickets. Switch to Plan when delivery needs design trade-offs (owner standing OK).
- Messenger/LINE deep links: anytime (owner paste). Webhooks = Phase 7. Student Pack domain/email = Phase 8.

## Git / Preview

- Branch: `feature/dev-env-news-gate` (CI green on PR #11).
- Public Preview (no Vercel login): https://asian-models-git-feature-dev-env-news-gate-asian-models.vercel.app/
- Local Admin: `http://127.0.0.1:8091/admin` (`bunx vite dev --host 127.0.0.1 --port 8091 --strictPort`)
- Do not commit `rest-site.json`.

## Just shipped (News)

- Admin timeline + category filters + draft/publish/archive + heading/text/image blocks + SEO auto-tags.
- Public `/news` month timeline + category chips.
- `body_blocks` live; Storage `news/` policies — apply SQL if cover upload fails.

## Owner next evidence

1. Sign in Admin → save draft → publish → confirm public `/news`.
2. Cover upload once (confirms Storage RLS).
3. Optional: paste m.me / LINE OA URLs.

## Do not start

Translation SDK, Messenger/LINE webhooks, production promote, paid Resend first.
