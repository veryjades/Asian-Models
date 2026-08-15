# ADR-001: Platform Architecture Foundation

**Status:** Accepted
**Date:** 2026-08-10
**Phase:** Phase 1 — Architecture Foundation

## Context

Asian Stars Agency needs a production foundation for its agency data and future operations without connecting the existing public UI to live data yet.

## Decision

- **Application platform:** Supabase supplies managed PostgreSQL, Auth, Storage, and the generated Data API.
- **Database:** PostgreSQL data lives in the `public` schema behind migrations in `supabase/migrations/`. Business tables use UUID primary keys, foreign keys for concrete ownership, `timestamptz` audit fields, and narrowly scoped indexes for expected relations and ordering.
- **Browser client:** The app uses `@supabase/supabase-js` through `src/lib/supabase/`. It accepts only `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`; service-role or management secrets never enter browser code or a `VITE_*` variable.
- **Auth:** Supabase Auth is the identity provider. No model-facing login is introduced in this phase.
- **Roles:** The first operational roles are `Admin`, `Editor`, and `Viewer`. A future authorization implementation must use trusted `app_metadata` claims or an approved server-side role source, never user-editable `user_metadata`.
- **Storage:** Supabase Storage will hold approved portfolio media in a private-by-default bucket design. This phase records the boundary and policy plan but does not create buckets or connect uploads.
- **RLS:** Every new table enables RLS. Browser grants and policies are intentionally deferred until their exact user journeys are approved; the policy plan documents the required matrix.

## Consequences

- The foundation is safe to review without exposing agency, client, or booking data through the public site.
- Future UI work must call the typed adapter layer rather than create ad hoc clients or query tables directly.
- A Supabase project must be linked and migrations applied before any live data is used.
- Role provisioning, storage buckets, and executable RLS policies require their own approved implementation task.

## Future AI boundary

AI remains out of scope. Any Azure OpenAI or other provider integration must be behind the approved provider abstraction in a later phase. This foundation stores no prompts, embeddings, AI decisions, or automatic casting output.

## Phase 2 implementation addendum — 2026-08-15

The Phase 1 boundaries above remain the architectural decision; the deferred
pieces are now implemented in the linked zero-cost Supabase project under the
approved Phase 2 tasks:

- `initial_platform_foundation` creates the five typed business tables and
  enables RLS on each table.
- `phase2_security_policies` adds authenticated-only grants, the
  Admin/Editor/Viewer `app_metadata.role` policies, and the private
  `model-media` bucket with path/MIME/size limits.
- `src/lib/supabase/auth.ts` and `src/lib/supabase/media.ts` are the browser
  adapters. They never expose a service-role credential and are not mounted by
  public routes until live Auth-session verification is complete.
