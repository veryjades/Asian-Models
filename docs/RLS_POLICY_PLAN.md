# RLS Policy Plan

**Status:** Planning record — no browser policy is enabled in Phase 1  
**Related:** ADR-001, D-004

## Baseline posture

- RLS is enabled on every Phase 1 `public` table.
- No browser-access grants or permissive policies are created in the initial migration.
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

## Implementation requirements for a later policy task

1. Explicitly grant only the table operations needed by the browser audience.
2. Create `SELECT` policies alongside any `UPDATE` policy, and use both `USING` and `WITH CHECK` for updates.
3. Test each role and unauthenticated request against the policy matrix.
4. Define bucket names, object path ownership, MIME limits, and visibility before adding Storage policies.
5. Record the role-provisioning process and token-refresh behavior before relying on role claims.
