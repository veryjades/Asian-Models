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
- Migration: `20260815170000_phase2_security_policies.sql` (applied to the linked project).

## Verification evidence

- Supabase policy advisors: no RLS or Storage policy lints after migration. Free-plan Auth hardening is configured and verified with a 12-character minimum plus lowercase/uppercase/digit/symbol requirements. The remaining `auth_leaked_password_protection` warning is a documented plan limitation: Supabase exposes leaked-password checks on Pro and above, outside the SQL policy boundary.
- Viewer probe: `SELECT` returned zero rows on the empty table; an attempted insert was rejected by RLS.
- Editor probe: a transaction-scoped insert succeeded and was rolled back; no probe data remains.
- Extended SQL probes also verified invalid roles fall back to `viewer`, viewer client writes are rejected, and an admin model insert/delete succeeds inside a rollback transaction.
- Anonymous probe: `anon` received `permission denied` on `public.models` because no table grant exists.
- All five public tables report `rls_enabled = true`; the policy catalog contains table and Storage policies for the authenticated role.
- Live SQL snapshot on 2026-08-15: 5/5 public tables with RLS, 20 public policies, 4 `model-media` Storage policies, private bucket with a 50 MiB limit and the four approved MIME types. Three disposable Auth sessions were created for the live matrix and all probe accounts/rows were cleaned afterward.
- Live Data API/Storage matrix: viewer model/portfolio/media reads succeeded while client/booking reads and writes were denied; editor insert/update succeeded and delete was denied; admin deletes succeeded. Viewer download succeeded and upload was denied; editor upload/update succeeded and delete was denied; admin delete succeeded. Anonymous table access returned `401/permission denied`; anonymous download of a controlled private object returned `400 Object not found`. All probe objects were removed.

## Phase 2 verification result

The live Auth-session, Data API, Storage API, role-provisioning, and token-refresh
requirements are complete. The remaining work is the separately tracked UX-010
asset review and the later Phase 3 decision to connect public routes; no new
RLS or Storage policy change is required for this gate.

If the project later moves to Pro, enable leaked-password protection in
Authentication → Attack Protection. The current Free-plan mitigation is the
verified 12-character minimum and strongest character requirements. Supabase
documents the plan-gated setting at
https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection.

The browser-side implementation is now bounded in `src/lib/supabase/auth.ts`:
it uses `getUser()` for the server-confirmed identity, reads only
`app_metadata.role`, and never accepts a role or service credential from the
browser. Public routes remain disconnected until the Phase 3 connection review
is approved.

`src/lib/supabase/media.ts` provides the matching private Storage boundary:
fixed `model-media` bucket, validated owner paths, and client-side MIME/size
guards before the database-enforced Storage policies run.

Role assignment is isolated in the deployed `provision-user` Edge Function;
its JWT gate and in-function admin check prevent viewer/editor callers from
using the service-role admin client.
