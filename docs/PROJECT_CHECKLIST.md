# Asian Models — Master Delivery Checklist

This is the single acceptance checklist for the project. Every work unit must
update its status and attach evidence here or in the linked task before moving
to the next unit. A task is not complete because its UI exists; the persisted
data path, public consumption, responsive behavior, and verification must also
be checked.

Status markers: `[x]` verified complete · `[~]` in progress · `[ ]` not started · `[!]` blocked

## 1. Backend foundation and identity

- [x] Use the owner-created Supabase project `jkhxtuwqmmdetjqymzso` as the only current target.
- [x] Keep publishable browser configuration local/ignored; never commit service-role secrets.
- [x] Apply foundation, Auth/RLS, Storage, and model-media-link schema migrations.
- [x] Configure Auth Site URL and local/Preview redirect URLs.
- [x] Create the owner Auth account and verify trusted `app_metadata.role=admin`.
- [x] Verify invitation/recovery delivery in Auth Logs (`/invite`, `/recover`, `/verify`).
- [ ] Verify Vercel Preview environment variables point to the new Supabase project.
- [ ] Confirm custom domain, DNS, SSL, and deployment protection/SSO behavior.

## 2. Model records and media

- [x] Seed all existing roster records into Supabase (13 models, not zero rows). Live SQL count on 2026-08-15: `model_count=13`.
- [~] Verify every model appears in `/admin` and can be edited without data loss. The authenticated UI and live table are present; a full authenticated browser save/refresh pass remains.
- [~] **Hard gate:** a model created/updated in Admin must be read from the same Supabase row by the public board/profile/keyword surfaces after refresh; the adapter is connected and public routes return 200, but an edit/refresh proof row remains.
- [x] Create/update model fields: name, bilingual name, slug, board, gender, city, languages, bio, measurements, status, featured, tags.
- [x] Upload primary portrait and optional second/hover portrait.
- [x] Upload unlimited gallery images and MP4 files.
- [x] Add and delete YouTube links and social links per model.
- [ ] Upload/associate the existing reviewed media set for every seeded model where available.
- [ ] Verify every image uses fixed geometry, shortest-edge ratio crop, centered focal point, and no baked black border.
- [~] Verify model data is visible in public category, keyword, profile, and hover surfaces. Local route probes return Chen and the live model count is 13; full board/profile/hover sweep remains.

## 3. Content CMS

- [~] Add editable About page content (bilingual copy, offices, contact metadata, publish state). Schema, RLS, editor, and public binding exist; authenticated save verification remains.
- [~] Add News CRUD (slug, date, bilingual title/excerpt/body, cover media, tags, publish state, ordering). Publish/list/delete are implemented; edit and cover upload UI remain.
- [ ] Add News media upload/replace/delete with the same crop and private-storage rules.
- [x] Bind public About and News routes to published Supabase content with a safe seed fallback. Live counts: `news_count=3`, `settings_count=1`; local `/about` and `/news` return 200.
- [ ] **Hard gate:** an About or News item created/published in Admin must appear on the matching public route from Supabase after refresh.
- [ ] Verify draft content is never exposed to anonymous visitors.
- [ ] Verify News appears on homepage, News index, News detail, keyword results, and JAgent context.

## 4. JAgent / RAG

- [~] Add Admin knowledge-document CRUD (title, bilingual content, source, tags, locale, publish state). Create/list/delete are implemented; edit and source URL fields remain.
- [~] Add protected retrieval function using full-text search and an optional embedding column for future vectors. The current adapter performs published-document retrieval; a server-side RPC/vector path remains.
- [x] Make anonymous JAgent retrieval use only published knowledge and public model/news records. RLS and published-only query are in place.
- [ ] **Hard gate:** a published knowledge document added in Admin must be retrievable by JAgent without a code or deploy change.
- [ ] Keep provider calls server-side and behind an abstraction; no API key in browser code.
- [x] Show retrieved context/source signals in the JAgent response and define a safe fallback when no match exists.
- [ ] Verify Chinese and English queries for models, booking, About, News, and agency policy.
- [ ] Record RAG security, relevance, latency, and no-answer checks.

## 5. Admin UX and permissions

- [x] Admin sign-in, first-time password setup, recovery route, and Admin/Editor/Viewer gate.
- [~] Admin navigation exposes Models, Inbox, About, News, JAgent Knowledge, media, and Admin-only Access as top-level sections. The implementation is present; authenticated role-by-role navigation regression remains.
- [~] Admin and Editor can create/update content; only Admin can delete or manage roles. Admin-only invitation, role-change, and guarded-delete controls are live and verified; authenticated Editor write and Admin CRUD refresh proof remains.
- [ ] Viewer can read published content only and cannot write or access private media.
- [~] All forms have validation, loading, success/error states, and refresh persistence. Public forms and admin content forms have these states; authenticated end-to-end refresh verification remains.

## 6. QA and release gate

- [~] Verify `/models/women`, `/models/men`, `/models/new-faces`, `/models/talent`. Local HTTP probes pass; visual and authenticated data-path review remains.
- [~] Verify `/keywords/*`, `/about`, `/news`, News detail, model profiles, and `/admin`. Local route probes pass; full visual/refresh review remains.
- [~] Hover QA: Chen's paired transition passed earlier pointer QA; remaining model pairs, no scale-only effect, geometry, and black-edge sweep remain.
- [~] Mobile QA at 390px and desktop QA; earlier 390px surfaces passed, but the current Admin/content release still needs the final full sweep.
- [x] Verify Auth, Storage, RLS, Data API grants, and cleanup of test rows/objects. Live role/storage matrix and the current trigger transaction probe passed; test records/objects were removed or rolled back.
- [x] Run `bunx tsc --noEmit`, `bun run lint`, `bun run build`, and `git diff --check` for the exact work unit. GOV-001 corrected the six Markdown whitespace groups; all commands and `git diff --check origin/main` exit 0 on `feature/release-governance` (lint: 0 errors, 9 existing warnings). The same checks are now encoded in pinned-Bun GitHub CI and must pass again on the pushed commit.
- [~] Deploy Preview, inspect routes in the deployed build, and record URL/commit. The branch Preview responds 200; current-commit route/hover inspection remains.
- [~] Reconcile PR #4/#5 before review. PR #5 metadata now describes its actual stacked scope; PR #6/#7 add passing pinned-Bun CI without rewriting history, and `main` protection requires that CI plus one approval. Human review/merge of PR #6/#7 and then PR #4 remains before PR #5 can safely retarget `main`.

## 7. Project operations

- [x] Keep this checklist, `TASKS.md`, and `docs/STATUS.md` synchronized after each work session.
- [ ] Keep the Asana launch plan aligned with these acceptance gates and completion percentages. The recorded 2/17 status was not independently reverified during GOV-001 because the project requires authentication.
- [ ] Keep Notion/launch documentation linked to the same source-of-truth checklist.

## 8. Enquiries, applications, and administrator notifications

- [x] Contact and Quick Booking forms persist `inquiries` rows in Supabase.
- [x] Scouting form persists `scout_applications` rows and uploads attachments to the private `scout-submissions` bucket.
- [x] Database triggers enqueue one `admin_notifications` row addressed to `site_settings.admin_email` (`menscheck@gmail.com` by default); a live transactional probe confirmed the row and rolled back its temporary test records.
- [x] Admin Inbox lists enquiries, applications, and notification status, and allows Editor/Admin status updates.
- [x] Edge Function `notify-admin` is implemented in the repository, deployed through the Supabase dashboard, and called by public forms after insert; the Admin retry action sends the notification reference id.
- [!] Actual email delivery requires a configured provider secret (`RESEND_API_KEY` and `RESEND_FROM`, or an approved SMTP sender). No provider credential exists in this workspace, so no email is claimed as sent.
