# Asia Model Agency Website

A Storm Management-inspired agency site: minimal, editorial, image-first. Bilingual English / 繁體中文 with a header toggle. Content managed by your admin assistant through a private backend. Built so the database, auth, and storage providers can each be swapped without rewriting the site.

## Visual direction

Storm's discipline — full-bleed portrait grids, tiny uppercase letter-spaced nav, sharp corners, no shadows, generous whitespace — but warmed with color instead of Storm's pure black-on-white.

From your mood board:

- **Morandi palette as the base.** Soft muted blue-greys (#D6DDD9, #BFCCD4, #9FB5C3, #8A9DA8, #6D7B86) on a warm off-white paper ground, with deep slate as the text color rather than pure black. Calm, editorial, distinctly not Storm.
- **Gradient as an accent, not a background.** The pastel mesh gradient (mint → yellow → coral) appears in restrained places only: the division/board title bands, the language-toggle active state, hover wash over a portrait, and the Get Scouted call to action. Never behind body text.
- **Halftone dot texture** used as a section divider and behind the About / Contact headers — a fine dot field fading edge to edge, giving the print-magazine feel while keeping the grids clean.
- **Type**: a light-weight geometric sans for names and nav; Traditional Chinese set in a matching Noto Sans TC weight so both languages sit at the same visual density.
- Motion stays restrained: slow fades and image swaps, no bouncing or heavy animation.

All of this lives as design tokens, so the accent gradient and palette can be re-tuned globally without touching page code.


## Pages

- **Home** — full-bleed hero image, minimal nav, links into the boards.
- **Boards** — Women, Men, and additional divisions (New Faces, Talent). Each is a responsive portrait grid, filterable, with model name captions.
- **Model profile** — hero portrait, portfolio gallery (click to enlarge), stats block (height, bust/waist/hips, shoes, hair, eyes), digitals/polaroids, and a contact line.
- **News** — editorial posts with cover image, title, date, and article page.
- **About** — agency story and offices.
- **Contact** — office locations, emails, phone.
- **Get Scouted** — application form: name, age, city, contact, measurements, and photo uploads. Submissions land in the backend for review.

## Languages

Header toggle switching EN / 繁中, remembered in the browser. Every UI label is translated. Model bios, news articles, and page copy each have an English and a Traditional Chinese field; if a Chinese translation is missing, English is shown as fallback.

## Stack flexibility (per your requirement)

The site is built against three thin internal interfaces, not against any one vendor:

```text
  Pages / components
        |
   data layer  ──►  ContentRepository   ──► Supabase adapter (your project)
   auth layer  ──►  AuthProvider        ──► your SSO / identity server adapter
   media layer ──►  MediaStore          ──► Supabase Storage or S3 / CDN adapter
```

- **Database — your own Supabase project.** Connected via environment variables (project URL + keys), not Lovable Cloud provisioning. Schema ships as plain SQL migration files in the repo, so it can also be applied to any Postgres host. No Lovable-specific SQL.
- **Auth — your service server.** Admin sign-in goes through an `AuthProvider` interface. The adapter validates a token/session issued by your identity server (OIDC / SAML / JWT — whichever your server speaks) and maps it to an `admin` role. Nothing in the page or admin code calls a vendor SDK directly, so replacing the provider is one adapter file.
- **Storage — pluggable.** Image uploads go through a `MediaStore` interface; the initial adapter targets Supabase Storage, and an S3/Cloudflare R2 adapter can drop in for an Asia-region CDN later.
- **Hosting.** Standard TanStack Start app — runs on Cloudflare Workers, Node, or any container host.

To keep the build moving, v1 can start with a temporary local admin gate while your identity server details are confirmed; swapping in the real adapter does not touch any page.

## Admin backend

A private admin area at `/admin`, reachable only by accounts your identity server marks as agency staff:

- Add / edit / delete models, set their board, reorder them, mark featured.
- Upload portrait, portfolio, and polaroid images (drag to reorder).
- Enter measurements and both-language bios.
- Write and publish news posts in both languages.
- Review "Get Scouted" submissions with their uploaded photos.

Row-level security on the Supabase side: public read of published rows only; all writes require the admin role. Roles live in a separate `user_roles` table checked by a security-definer function — never on the profile row.

## Content for v1

Ships with realistic placeholder models across each board using generated editorial imagery, plus sample news posts — so the layout is fully populated and real talent can be swapped in through the admin panel.

## Technical notes

- Routes: `/`, `/models/$board`, `/models/$board/$slug`, `/news`, `/news/$slug`, `/about`, `/contact`, `/scouted`, `/admin/*`.
- All server work runs in TanStack server functions; no vendor-specific edge functions.
- Config entirely through env vars, so dev / staging / production can point at different Supabase projects.
- Language state in a React context + localStorage; UI dictionary for labels, per-row `_en` / `_zh` columns for content.
- Per-route head metadata for SEO, hreflang-ready.

## Suggested build order

1. Design system, layout shell, language toggle, home + boards + profile with seeded data.
2. News, About, Contact.
3. Define the repository / auth / media interfaces and wire the Supabase adapter to your project credentials.
4. Admin panel behind the auth adapter.
5. Get Scouted form with uploads and admin review.

## What I need from you before step 3

- Your Supabase project URL and keys (stored as secrets, never in code).
- Which protocol your identity server uses for admin sign-in (OIDC, SAML, or signed JWT) and its issuer URL.
