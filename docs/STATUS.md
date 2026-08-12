# Asian Stars Agency — Status

**Phase:** Phase 1 — Architecture Foundation (with authorised mock-asset experience iteration)
**Status:** IN_PROGRESS
**Current phase:** Phase 1 — Architecture Foundation
**Current task:** Keyword Dynamic Runway focus interaction correction complete; retain the same-person four-photo profile asset blocker as separate work.
**Last heartbeat:** 2026-08-12 22:50:00 +08:00
**Completion date:** 2026-08-10

## Completed items

- Project-control documents and agent protocol are active on `feature/baseline`.
- The baseline lint audit found 46 Prettier errors in 17 existing files and no other error-level lint rules; those files were formatted with the repository configuration.
- `npm run lint` now exits 0 with 0 errors and 9 existing React-refresh warnings.
- `npm run build` completes successfully; Vite/Nitro warnings are non-fatal.
- Test baseline inspected: no test files, runner, or `test` script exists. The minimum recommended future approach is unit coverage for pure content/repository/i18n behavior before route/workflow integration tests.
- Package manager resolved: Bun 1.x is canonical; setup is `bun install --frozen-lockfile`, with a pinned Bun version required in CI. npm was used only because Bun is unavailable in this environment.
- PR [#2](https://github.com/veryjades/Asian-Models/pull/2) merged into `main` as `875f9eb`.
- ADR-001, Supabase configuration, `.env.example`, initial migration, typed client/adapter, and RLS policy plan are established on `feature/phase-1-foundation`.

## In-progress items

- Foundation review and migration validation are pending. No Phase 1 UI or product work is in progress.
- The authorised D-008/D-009 mock-asset experience iteration documents source/licensing requirements and now includes a reusable safe-presentation component.
- Draft PR [#5](https://github.com/veryjades/Asian-Models/pull/5) contains the mock-asset guide and image-presentation foundation; it targets `feature/phase-1-foundation` and remains unmerged.
- The Golden Mock Asset Set is complete: 18 reviewed fictional adult assets for three desktop heroes, five Women/Men portrait/full-body pairs, two New Faces digitals, and three portfolio scenes. See `docs/GOLDEN_MOCK_ASSET_SET.md`.
- Isolated Preview review passed for desktop and a 390px viewport: three hero CTAs route to their intended boards; desktop arrows change slides; the Women board and Aya Mori profile load their mapped fictional media. Preview: `https://asian-models-gxon1hn2t-asian-models.vercel.app`.
- Homepage asset audit found Golden assets in the Hero and Featured Models sections, but legacy `model-05`, `model-02`, and `model-03` covers in News. The minimal replacement maps each News post to a compositionally suitable existing Golden portfolio asset; no new media or dependency was needed. Build and lint passed before Preview validation.
- Visual-consistency Preview passed at desktop and 390px: Hero → Featured Models → News now stays within the Golden asset set, News has a reviewed 3:2 non-cropping presentation, and no browser console errors were observed. Preview: `https://asian-models-p2kd962ta-asian-models.vercel.app`.
- Local verification for the missed-requirements iteration passed: J_J favicon route/link, homepage Keyword Dynamic Runway with 15 active taxonomy entries, keyword result page with models/portfolio/news/Quick Booking, model-specific Quick Booking modal payload, recruitment 2-photo gate, and Golden model profile identity cleanup. `bun run lint` passed with 0 errors and 9 existing warnings; `bun run build` passed.
- The final UX recovery iteration now renders Quick Booking through a top-level portal overlay, locks background scroll, marks header/main/footer inert while open, and hides the generic header booking CTA on model profile pages so the profile exposes one model-specific 「快速預約」 action. Local desktop and 390px browser verification passed for modal layering and console errors.
- The 390px Keyword Dynamic Runway was tightened so active keywords remain readable instead of collapsing into an overlapping text cluster; keyword destination pages continue to surface tagged models, portfolio signals, news, and Quick Booking.
- Recruitment gate regression verification passed locally: 0 photos keeps submit disabled, one required photo keeps submit disabled, and half-body plus full-body enables submit; the optional third photo and optional video remain non-required.
- The final Keyword Dynamic Runway correction is complete locally: the runway is now a 40px strip directly below Hero, consumes the top 15 active canonical keywords, moves LEFT↔RIGHT instead of as a one-direction ticker, gives the C-position keyword highest opacity/sharpness/z-order, fades and blurs keywords after C into the rear depth plane, keeps controlled overlap, and avoids horizontal overflow on desktop and 390px. Local click verification reached `/keywords/editorial-model` with Models/Portfolio/News/Quick Booking content. `bun run lint` passed with 0 errors and 9 existing warnings; `bun run build` passed.
- The focus-interaction correction now separates the moving runway element from its nested text label: automatic C-state scales the label to 2.4× without relocating the keyword, while desktop hover/focus pauses the runway where it is and applies the same 2.4× label scale above neighboring keywords. The focus treatment has no background, inversion, padding, or colour change. Preview verification on commit `d136c69` passed: real desktop pointer hover reported a frozen non-zero runway transform, 2.4× label scale, z-index 20, transparent background, unchanged text colour, and no horizontal overflow; automatic C-state remained in place at the same scale. The 390px browser surface passed 40px height, 15 items, one line, no horizontal overflow, and no console errors.

## Blockers

- A local Supabase database is not running, and no cloud Supabase project has been linked. The initial migration is therefore un-applied; this is intentional until local Docker or a project approval is available.
- No deployment blocker remains. Product acceptance is pending review of the isolated Preview. The production keyword/tag admin and CMS backing remain future Phase 5/admin work; this iteration only adds the content boundary and documents the future requirement.
- Model-profile identity depth remains blocked: the current Golden assets do not provide four distinct same-person images per audited model profile. Aya, Mei, Sora, Jun, and Ren have only portrait/full-body pairs; Nari and Dai have a single image reused across profile surfaces. This environment currently has no callable same-identity image generation tool and no `OPENAI_API_KEY`, so the iteration must not duplicate images or mix different faces to claim compliance.

## Phase 0 readiness

**Phase 0: COMPLETE.** PR [#2](https://github.com/veryjades/Asian-Models/pull/2) is merged and its checks remain green.

## Phase 1 prerequisites

- Phase 1 foundation PR must be reviewed before any cloud project is linked or a migration is applied.
- Product/domain scope, user journeys, content ownership, and acceptance criteria must be approved and recorded before implementation.
- A Phase 1 architecture note must be created under `docs/architecture/` if the approved design requires one.
- Supabase, AI, Messenger/Facebook webhook, Admin, and backend implementation remain prohibited until their planned phases.

## Next action

Keep PR #5 draft/open/not merged while stakeholder review continues. Resolve the remaining same-person four-photo blocker only when a real image-generation path or approved model assets are available.
