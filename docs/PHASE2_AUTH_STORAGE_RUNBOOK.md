# Phase 2 Auth and Storage Runbook

**Project:** `asian-models` (`cajkkxustehtzyymlopm`)
**Status:** P2-003 in progress

## Role provisioning

- The only authorization source is `auth.jwt() -> 'app_metadata' ->> 'role'`.
- Supported values are `admin`, `editor`, and `viewer`.
- A missing or invalid role is treated as `viewer` by `public.current_app_role()`.
- Never use `raw_user_meta_data` / `user_metadata` for authorization; users can edit it.
- Create users through Supabase Auth Dashboard or a server-only admin workflow. If a role must be assigned programmatically, use the service-role API only from a server/Edge Function and write `app_metadata.role`.
- Never put a service-role key in `VITE_*`, browser code, `.env.example`, or a client bundle.
- After changing `app_metadata`, force a session refresh before testing the new role because existing JWT claims can be stale.

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

The SQL policy probes already run against the empty database are recorded in
`docs/RLS_POLICY_PLAN.md`; they are not a substitute for real Auth-session
tests, which remain the next P2-003 evidence.

Local boundary probes passed on 2026-08-15: the Auth adapter returned the
trusted editor identity, downgraded a tampered role to viewer, and registered
an auth-state subscription; the Storage adapter accepted a valid path and
WebP payload while rejecting traversal and slash-containing path segments.
