# Asian Stars Agency — Status

**Phase:** Phase 2 — Application Foundation (with authorised mock-asset experience iteration)
**Status:** IN_PROGRESS
**Current phase:** Phase 2 — Application Foundation
**Current task:** Implement Auth role provisioning and end-to-end role tests before browser exposure.
**Last heartbeat:** 2026-08-15 +08:00
**Completion date:** 2026-08-10

## Completed items

- Project-control documents and agent protocol are active on `feature/baseline`.
- The baseline lint audit found 46 Prettier errors in 17 existing files and no other error-level lint rules; those files were formatted with the repository configuration.
- `npm run lint` now exits 0 with 0 errors and 9 existing React-refresh warnings.
- `npm run build` completes successfully; Vite/Nitro warnings are non-fatal.
- Test baseline inspected: no test files, runner, or `test` script exists. The minimum recommended future approach is unit coverage for pure content/repository/i18n behavior before route/workflow integration tests.
- Package manager resolved: Bun 1.x is canonical; setup is `bun install --frozen-lockfile`, with a pinned Bun version required in CI. npm was used only because Bun is unavailable in this environment.
- PR [#2](https://github.com/veryjades/Asian-Models/pull/2) merged into `main` as `875f9eb`.
- ADR-001, Supabase configuration, `.env.example`, initial migration, typed client/adapter, and RLS policy plan are established and the migration is applied to the linked Phase 2 project.

## In-progress items

- Foundation review and migration validation are complete. No public route is connected to Supabase until the Phase 2 policy tests pass.
- The authorised D-008/D-009 mock-asset experience iteration documents source/licensing requirements and now includes a reusable safe-presentation component.
- Draft PR [#5](https://github.com/veryjades/Asian-Models/pull/5) contains the mock-asset guide and image-presentation foundation; it targets `feature/phase-1-foundation` and remains unmerged.
- The Golden Mock Asset Set is complete: 18 reviewed fictional adult assets for three desktop heroes, five Women/Men portrait/full-body pairs, two New Faces digitals, and three portfolio scenes. See `docs/GOLDEN_MOCK_ASSET_SET.md`.
- Isolated Preview review passed for desktop and a 390px viewport: three hero CTAs route to their intended boards; desktop arrows change slides; the Women board and Chen Yu-Xin profile load their mapped fictional media. Preview: `https://asian-models-gxon1hn2t-asian-models.vercel.app`.
- Homepage asset audit found Golden assets in the Hero and Featured Models sections, but legacy `model-05`, `model-02`, and `model-03` covers in News. The minimal replacement maps each News post to a compositionally suitable existing Golden portfolio asset; no new media or dependency was needed. Build and lint passed before Preview validation.
- Visual-consistency Preview passed at desktop and 390px: Hero → Featured Models → News now stays within the Golden asset set, News has a reviewed 3:2 non-cropping presentation, and no browser console errors were observed. Preview: `https://asian-models-p2kd962ta-asian-models.vercel.app`.
- Local verification for the missed-requirements iteration passed: J_J favicon route/link, homepage Keyword Dynamic Runway with 15 active taxonomy entries, keyword result page with models/portfolio/news/Quick Booking, model-specific Quick Booking modal payload, recruitment 2-photo gate, and Golden model profile identity cleanup. `bun run lint` passed with 0 errors and 9 existing warnings; `bun run build` passed.
- The final UX recovery iteration now renders Quick Booking through a top-level portal overlay, locks background scroll, marks header/main/footer inert while open, and hides the generic header booking CTA on model profile pages so the profile exposes one model-specific 「快速預約」 action. Local desktop and 390px browser verification passed for modal layering and console errors.
- The 390px Keyword Dynamic Runway was tightened so active keywords remain readable instead of collapsing into an overlapping text cluster; keyword destination pages continue to surface tagged models, portfolio signals, news, and Quick Booking.
- Recruitment gate regression verification passed locally: 0 photos keeps submit disabled, one required photo keeps submit disabled, and half-body plus full-body enables submit; the optional third photo and optional video remain non-required.
- The final Keyword Dynamic Runway correction is complete locally: the runway is now a 40px strip directly below Hero, consumes the top 15 active canonical keywords, moves LEFT↔RIGHT instead of as a one-direction ticker, gives the C-position keyword highest opacity/sharpness/z-order, fades and blurs keywords after C into the rear depth plane, keeps controlled overlap, and avoids horizontal overflow on desktop and 390px. Local click verification reached `/keywords/editorial-model` with Models/Portfolio/News/Quick Booking content. `bun run lint` passed with 0 errors and 9 existing warnings; `bun run build` passed.
- The focus-interaction correction now separates the moving runway element from its nested text label: automatic C-state scales the label to 2.4× without relocating the keyword, while desktop hover/focus pauses the runway where it is and applies the same 2.4× label scale above neighboring keywords. The focus treatment has no background, inversion, padding, or colour change. Preview verification on commit `d136c69` passed: real desktop pointer hover reported a frozen non-zero runway transform, 2.4× label scale, z-index 20, transparent background, unchanged text colour, and no horizontal overflow; automatic C-state remained in place at the same scale. The 390px browser surface passed 40px height, 15 items, one line, no horizontal overflow, and no console errors.
- Profile data and interaction corrections are ready locally: every fictional model now has a weight, culturally inconsistent city/name combinations have been corrected (including Hina Chinen for Okinawa and Kim Do-yun for Busan), and model-specific Quick Booking is fixed to the bottom-left viewport rather than the profile content flow. The reusable model-card component is wired for a white shutter flash and a separate `hoverPortrait` second frame on homepage, category, and keyword discovery cards; no invalid existing image is used as a substitute.
- Chen Yu-Xin's category and keyword cards now use `women-aya-look-02.webp` as the reviewed same-person, same-studio, same-wardrobe hover frame. Its changed shoulders, torso, arm line, stance, and leg separation make the shutter transition visually distinct while the two image layers keep identical geometry. Deployed Chrome pointer QA confirmed `:hover`, primary opacity `0`, hover-layer opacity `1`, and the shutter animation; category, keyword, and profile routes passed at desktop and 390px with no horizontal overflow or console errors. The profile still exposes its existing portrait, editorial gallery, and digitals.
- Supplied hover assets now expose three reviewed editorial pairs: Chen Yu-Xin, Aoi Takahashi, and Lin Wei-Jie. Tanya Lim and Han Min-jae retain same-person full-body extensions while stronger pose variants are sourced. The audit removed Lin's unrelated beach image, Hina's identity-mismatched hover/gallery images, and cross-person legacy gallery images from six talent profiles. Profile gallery media now uses a clipped `cover` frame to prevent letterboxing. Remaining cards intentionally have no `hoverPortrait` until genuine same-person pose frames are available.
- J Assistant now performs deterministic, repository-backed candidate retrieval instead of telling visitors to browse on their own. It combines reviewed gender, language, market, tag, portfolio, and News signals, and renders a direct profile plus model-specific Quick Booking action for each recommendation. `docs/ASSISTANT_RETRIEVAL.md` records the current boundary and the later Supabase/pgvector replacement path; the five required Chinese queries were executed against the actual content set.
- Execution started for UX-010: removed the Hina/Kim cross-person hover imports and mixed-identity gallery entries from the new-faces seed. Those cards now render only their verified primary digital until a genuine same-person second frame is reviewed.
- Supabase project `asian-models` is provisioned and `ACTIVE_HEALTHY` in `ap-southeast-1` (ref `cajkkxustehtzyymlopm`, URL `https://cajkkxustehtzyymlopm.supabase.co`). Auth, Storage, browser grants, and role policies remain pending P2-002/P2-003.
- Supabase pre-migration smoke check passed before Phase 2; the migration was then applied and the post-migration table/advisor verification is recorded below.
- Phase 2 approved by the project owner. Migration `20260814163450_initial_platform_foundation` is now applied to `cajkkxustehtzyymlopm`; five public tables are present with RLS enabled, and `src/lib/supabase/database.types.ts` has been regenerated from the live schema.
- P2-002 is complete: migration `20260814164022_phase2_security_policies` adds trusted `app_metadata.role` evaluation, authenticated-only grants, Admin/Editor/Viewer policies, private `model-media` Storage bucket/path policies, and was verified by security advisors plus viewer/editor transaction probes.
- `.env.example` now points to the approved public project URL; the publishable key remains a local-only placeholder and no service-role secret is committed.
- The J Assistant control no longer collides with the Vercel Preview Toolbar: its trigger is positioned clear of the toolbar and its opened conversation temporarily hides that toolbar. The latest Preview was clicked directly; it opened J Assistant and returned four candidate profiles for `我要找男模`. The 390px surface had no horizontal overflow or console errors.

## Blockers

- Security advisors are clean after P2-002. Performance advisors report only unused indexes on the empty database. P2-003 remains active for Auth role provisioning and end-to-end tests; local Docker remains unavailable.
- `bunx tsc --noEmit` remains a separate baseline issue: 10 pre-existing strict errors in AskAssistant, QuickBooking, and assistantRetrieval. `bun run lint` and `bun run build` are still passing.
- No deployment blocker remains. Product acceptance is pending review of the isolated Preview. The production keyword/tag admin and CMS backing remain future Phase 5/admin work; this iteration only adds the content boundary and documents the future requirement.
- Identity-consistent hover photography remains in progress for the remaining models. No other-person photo may be substituted or duplicated; the Lin hover derivative only trims the supplied frame's baked black matte while preserving the subject.

## Phase 0 readiness

**Phase 0: COMPLETE.** PR [#2](https://github.com/veryjades/Asian-Models/pull/2) is merged and its checks remain green.

## Phase 2 prerequisites

- Phase 1 foundation is applied and verified. Before connecting application routes, P2-002 must define and test Auth claims, Storage paths, and RLS policies.
- Product/domain scope, user journeys, content ownership, and acceptance criteria must be approved and recorded before implementation.
- A Phase 1 architecture note must be created under `docs/architecture/` if the approved design requires one.
- Supabase, AI, Messenger/Facebook webhook, Admin, and backend implementation remain prohibited until their planned phases.

## Next action

Source and review genuine same-session paired images for the remaining models. Keep PR #5 draft/open/not merged.
