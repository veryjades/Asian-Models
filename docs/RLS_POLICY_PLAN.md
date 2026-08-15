# RLS Policy Plan

**Status:** Phase 2 implementation record — policies applied and verified on `asian-models`
**Related:** ADR-001, D-004

## Baseline posture

- RLS is enabled on every Phase 1 `public` table.
- The initial migration keeps browser access closed; the Phase 2 security migration grants table operations only to `authenticated` and constrains them with role policies.
- `service_role` remains server-only and must never be exposed to the browser.
- Future role checks must use a trusted role source such as Supabase Auth `app_metadata`; never use user-editable `user_metadata`.

## Current access matrix

| Resource                              | Anon                                                                | Viewer                               | Editor                                       | Admin           |
| ------------------------------------- | ------------------------------------------------------------------- | ------------------------------------ | -------------------------------------------- | --------------- |
| Active model profile and public media | Read active/public rows under D-016                                 | Read                                 | Create/update within assigned scope          | Full management |
| Portfolio metadata                    | No access until publication rules are approved                      | Read                                 | Create/update within assigned scope          | Full management |
| Client contact data                   | No access                                                           | No access by default                 | Restricted operational access after approval | Full management |
| Bookings                              | No access                                                           | No access by default                 | Restricted operational access after approval | Full management |
| `model-media` Storage objects         | Public object delivery; row visibility remains the publication gate | Read                                 | Upload/update approved paths                 | Full management |

## Phase 2 implementation

- Trusted role source: `auth.jwt() -> 'app_metadata' ->> 'role'`, defaulting to `viewer` when absent. User-editable `user_metadata` is never consulted.
- `anon` can select active model rows and `visibility='public'` media rows, plus video/social rows belonging to active models. It has no access to client, booking, draft, or unpublished records.
- `viewer` can select models, portfolios, media assets, and approved `model-media` objects; it cannot read clients/bookings or write data.
- `editor` can select and insert/update models, portfolios, media assets, clients, bookings, and objects under `models/<id>/` or `portfolios/<id>/`; deletes remain admin-only.
- `admin` has the editor permissions plus deletes for application tables and approved Storage objects.
- Storage bucket: public `model-media` under D-016, with a 50 MiB object limit and MIME allow-list `image/jpeg`, `image/png`, `image/webp`, `video/mp4`. Authenticated writes/deletes remain policy-controlled.
- Migrations: `20260815170000_phase2_security_policies.sql` established the private-by-default boundary; `20260815210000_public_content_grants.sql` later added bounded anonymous reads and made only the published-media bucket public.

## Verification evidence

- Historical Supabase policy-advisor evidence reported no RLS or Storage policy lints after migration. The earlier 12-character/complexity statement is superseded by the owner-authorized live setting recorded in ADM-005: minimum 6 characters with no required character classes. This governance pass did not independently re-open the dashboard to verify either historical setting. The remaining `auth_leaked_password_protection` warning is documented as a Free-plan limitation.
- Viewer probe: `SELECT` returned zero rows on the empty table; an attempted insert was rejected by RLS.
- Editor probe: a transaction-scoped insert succeeded and was rolled back; no probe data remains.
- Extended SQL probes also verified invalid roles fall back to `viewer`, viewer client writes are rejected, and an admin model insert/delete succeeds inside a rollback transaction.
- Historical pre-D-016 anonymous probe: `anon` received `permission denied` on `public.models`. The later public-content migration intentionally superseded that result for active/public rows.
- All five public tables report `rls_enabled = true`; the policy catalog contains table and Storage policies for the authenticated role.
- Live SQL snapshot on 2026-08-15: 5/5 public tables with RLS, 20 public policies, 4 `model-media` Storage policies, private bucket with a 50 MiB limit and the four approved MIME types. Three disposable Auth sessions were created for the live matrix and all probe accounts/rows were cleaned afterward.
- Live Data API/Storage matrix: viewer model/portfolio/media reads succeeded while client/booking reads and writes were denied; editor insert/update succeeded and delete was denied; admin deletes succeeded. Viewer download succeeded and upload was denied; editor upload/update succeeded and delete was denied; admin delete succeeded. Anonymous table access returned `401/permission denied`; anonymous download of a controlled private object returned `400 Object not found`. All probe objects were removed.

## Phase 2 verification result

Repository records state that the live Auth-session, Data API, Storage API,
role-provisioning, and token-refresh requirements passed on 2026-08-15. D-015
and D-016 subsequently authorized the bounded public content connection now
implemented by the repository adapter. GOV-001 did not independently re-run the
live Supabase matrix, so these claims remain documented evidence rather than a
fresh verification.

If the project later moves to Pro, enable leaked-password protection in
Authentication → Attack Protection. The currently recorded owner-authorized
Free-plan password policy is a 6-character minimum with no required character
classes; any hardening change requires a fresh dashboard verification and
recovery-flow regression. Supabase documents the plan-gated setting at
https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection.

The browser-side implementation is now bounded in `src/lib/supabase/auth.ts`:
it uses `getUser()` for the server-confirmed identity, reads only
`app_metadata.role`, and never accepts a role or service credential from the
browser. Public model/content reads are connected only through the D-015/D-016
publication boundary.

`src/lib/supabase/media.ts` provides the matching Storage write boundary:
fixed `model-media` bucket, validated owner paths, and client-side MIME/size
guards before the database-enforced Storage policies run. Public object delivery
does not grant anonymous upload/update/delete permission.

Role assignment is isolated in the deployed `provision-user` Edge Function;
its JWT gate and in-function admin check prevent viewer/editor callers from
using the service-role admin client.
