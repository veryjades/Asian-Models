# RLS Policy Plan

**Status:** Phase 2 implementation record — policies applied and verified on `asian-models`
**Related:** ADR-001, D-004

## Baseline posture

- RLS is enabled on every Phase 1 `public` table.
- The initial migration keeps browser access closed; the Phase 2 security migration grants table operations only to `authenticated` and constrains them with role policies.
- `service_role` remains server-only and must never be exposed to the browser.
- Future role checks must use a trusted role source such as Supabase Auth `app_metadata`; never use user-editable `user_metadata`.

## Planned access matrix

| Resource                              | Anon                                                                | Viewer                               | Editor                                       | Admin           |
| ------------------------------------- | ------------------------------------------------------------------- | ------------------------------------ | -------------------------------------------- | --------------- |
| Public model profile and public media | Planned read-only once publication rules are approved               | Read                                 | Create/update within assigned scope          | Full management |
| Portfolio metadata                    | No access until publication rules are approved                      | Read                                 | Create/update within assigned scope          | Full management |
| Client contact data                   | No access                                                           | No access by default                 | Restricted operational access after approval | Full management |
| Bookings                              | No access                                                           | No access by default                 | Restricted operational access after approval | Full management |
| Storage objects                       | No direct access until bucket/path and upload workflow are approved | Read only from approved public paths | Upload/update approved paths                 | Full management |

## Phase 2 implementation

- Trusted role source: `auth.jwt() -> 'app_metadata' ->> 'role'`, defaulting to `viewer` when absent. User-editable `user_metadata` is never consulted.
- `anon` retains no table or Storage object access.
- `viewer` can select models, portfolios, media assets, and approved `model-media` objects; it cannot read clients/bookings or write data.
- `editor` can select and insert/update models, portfolios, media assets, clients, bookings, and objects under `models/<id>/` or `portfolios/<id>/`; deletes remain admin-only.
- `admin` has the editor permissions plus deletes for application tables and approved Storage objects.
- Storage bucket: private `model-media`, 50 MiB object limit, MIME allow-list `image/jpeg`, `image/png`, `image/webp`, `video/mp4`.
- Migration: `20260814164022_phase2_security_policies` (local source: `supabase/migrations/20260815170000_phase2_security_policies.sql`).

## Verification evidence

- Supabase security advisors: no lints after policy migration.
- Viewer probe: `SELECT` returned zero rows on the empty table; an attempted insert was rejected by RLS.
- Editor probe: a transaction-scoped insert succeeded and was rolled back; no probe data remains.
- All five public tables report `rls_enabled = true`; the policy catalog contains table and Storage policies for the authenticated role.

## Implementation requirements for a later policy task

1. Explicitly grant only the table operations needed by the browser audience.
2. Create `SELECT` policies alongside any `UPDATE` policy, and use both `USING` and `WITH CHECK` for updates.
3. Test each role and unauthenticated request against the policy matrix.
4. Define bucket names, object path ownership, MIME limits, and visibility before adding Storage policies.
5. Record the role-provisioning process and token-refresh behavior before relying on role claims.
