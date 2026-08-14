# Phase 2 Auth and Storage Runbook

**Project:** `asian-models` (`cajkkxustehtzyymlopm`)
**Status:** P2-003 complete

## Role provisioning

- The only authorization source is `auth.jwt() -> 'app_metadata' ->> 'role'`.
- Supported values are `admin`, `editor`, and `viewer`.
- A missing or invalid role is treated as `viewer` by `public.current_app_role()`.
- Never use `raw_user_meta_data` / `user_metadata` for authorization; users can edit it.
- Create users through Supabase Auth Dashboard or the server-only `provision-user` Edge Function. If a role must be assigned programmatically, use the service-role API only from that server/Edge workflow and write `app_metadata.role`.
- Never put a service-role key in `VITE_*`, browser code, `.env.example`, or a client bundle.
- After changing `app_metadata`, force a session refresh before testing the new role because existing JWT claims can be stale.

The deployed `provision-user` function (version 2, `verify_jwt = true`) accepts
`POST { user_id, role }`, requires the caller's server-confirmed
`app_metadata.role = admin`, merges existing target metadata, and writes only
the validated role. It returns no user metadata and never exposes the
service-role key. It reads the current JSON key variables when available and
falls back to legacy key variables during rotation. Missing bearer tokens
return 401; anonymous/non-admin JWTs return 403; invalid roles return 400.

## Browser Auth boundary

`src/lib/supabase/auth.ts` is the only browser-facing Auth adapter. It exposes
session lookup, server-confirmed `getUser()` identity lookup, password sign-in,
sign-out, and auth-state subscriptions. It derives the UI role from the
trusted `app_metadata.role` claim and defaults invalid or missing values to
`viewer`, matching the database function. It does not create users or assign
roles; those operations stay in the Supabase Dashboard or a server/Edge
workflow that holds the service-role secret.

The adapter is exported from `src/lib/supabase/index.ts` and is intentionally
not mounted by public routes until the real-session checklist below has been
completed.

## Storage boundary

- Bucket: private `model-media`.
- Accepted MIME types: JPEG, PNG, WebP, MP4.
- Maximum object size: 50 MiB.
- Object paths must start with `models/<model-id>/` or `portfolios/<portfolio-id>/`.
- Viewer: read approved paths only.
- Editor: read, upload, and update approved paths.
- Admin: full management, including delete.
- There is no anonymous bucket access.

`src/lib/supabase/media.ts` is the browser-safe Storage adapter. It fixes the
bucket name, permits only `models/<id>/` and `portfolios/<id>/` paths, rejects
traversal/slash-containing segments, and checks the MIME/50 MiB limits before
upload or update. Supabase Storage RLS remains authoritative for every
operation.

## Verification checklist

1. Create a test user with `app_metadata.role = viewer`; refresh its session; verify model/portfolio/media SELECT works and clients/bookings INSERT/SELECT is denied.
2. Create a test user with `app_metadata.role = editor`; refresh its session; verify model/portfolio/media/client/booking INSERT and UPDATE work, while DELETE is denied.
3. Create a test user with `app_metadata.role = admin`; refresh its session; verify the approved DELETE operations and Storage object deletion.
4. Verify an anonymous request receives no table or Storage data.
5. Run Supabase security advisors after each policy or bucket change.

## Live-session execution matrix — executed 2026-08-15

Three disposable users were created in the Supabase Auth Dashboard. Roles were
assigned through trusted `app_metadata` (admin bootstrap plus the server-only
`provision-user` function for editor/viewer), then sessions were refreshed so
the JWT contained the expected claim. No credentials are stored in the repo.

| Session | Live result |
| --- | --- |
| viewer | Model/portfolio/media reads succeeded; client/booking reads and all writes were denied. Download succeeded; upload was denied. |
| editor | Model/portfolio/media/client/booking insert/update succeeded; deletes were denied. Upload/update succeeded; delete was denied. |
| admin | Approved application-row deletes and Storage object deletion succeeded. |

For each session, verify the browser adapter in `src/lib/supabase/auth.ts`
returns the expected role from `getUser()`, then run
`await supabase.auth.refreshSession()` after any Dashboard role change. Test an
invalid role claim and confirm the adapter displays `viewer`; the database
function applies the same fallback. Finally, repeat one anonymous Data API
request and one anonymous Storage API request with the publishable key and
confirm both are denied.

The controlled live-session probes are recorded in `docs/RLS_POLICY_PLAN.md`;
all probe rows and objects were removed after verification. The public routes
remain cloud-agnostic until the Phase 3 connection review.

Local boundary probes passed on 2026-08-15: the Auth adapter returned the
trusted editor identity, downgraded a tampered role to viewer, and registered
an auth-state subscription; the Storage adapter accepted a valid path and
WebP payload while rejecting traversal and slash-containing path segments.
