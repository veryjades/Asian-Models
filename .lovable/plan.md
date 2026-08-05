# Asia Model Agency Website

A Storm Management-inspired agency site: minimal, editorial, image-first. Bilingual English / 繁體中文 with a header toggle. Content managed by your admin assistant through a private backend.

## Visual direction

Mirrors the Storm reference: near-white background, black text, tiny uppercase letter-spaced navigation, no rounded corners, no shadows. Full-bleed portrait grids where the image is the entire interface — names appear small beneath each portrait. Generous whitespace, restrained hover (subtle image swap / fade only).

## Pages

- **Home** — full-bleed hero image, minimal nav, links into the boards.
- **Boards** — Women, Men, and additional divisions (New Faces, Talent). Each is a responsive portrait grid, filterable, with model name captions.
- **Model profile** — hero portrait, portfolio gallery (click to enlarge), stats block (height, bust/waist/hips, shoes, hair, eyes), digitals/polaroids, and a downloadable-style contact line.
- **News** — editorial posts with cover image, title, date, and article page.
- **About** — agency story and offices.
- **Contact** — office locations, emails, phone.
- **Get Scouted** — application form: name, age, city, contact, measurements, and photo uploads. Submissions land in the backend for review.

## Languages

Header toggle switching EN / 繁中, remembered in the browser. Every UI label is translated. Model bios, news articles, and page copy each have an English and a Traditional Chinese field in the database; if a Chinese translation is missing, English is shown as fallback.

## Admin backend

A private, password-protected admin area at `/admin` for your assistant:

- Add / edit / delete models, set their board, reorder them, mark featured.
- Upload portrait, portfolio, and polaroid images (drag to reorder).
- Enter measurements and both-language bios.
- Write and publish news posts in both languages.
- Review "Get Scouted" submissions with their uploaded photos.

Access is role-based: only accounts you grant the admin role can reach `/admin`. Everything else is public and read-only.

## Content for v1

Site ships with realistic placeholder models across each board using generated editorial imagery, plus sample news posts — so the layout is fully populated and you can swap in real talent through the admin panel.

## Technical notes

- TanStack Start routes: `/`, `/models/$board`, `/models/$board/$slug`, `/news`, `/news/$slug`, `/about`, `/contact`, `/scouted`, `/admin/*` under an authenticated layout.
- Lovable Cloud (database, auth, storage) enabled for models, images, news, submissions, and admin accounts. Roles stored in a separate `user_roles` table with a security-definer check; RLS grants public read of published rows only, writes restricted to admins.
- Images stored in Cloud storage buckets; public read, admin-only write.
- Language state in a React context + localStorage; translation dictionary for UI strings, per-row `_en` / `_zh` columns for content.
- Per-route head metadata for SEO.

## Suggested build order

1. Design system, layout shell, language toggle, home + boards + profile with seeded data.
2. News, About, Contact.
3. Cloud backend, migrate content to database, admin panel.
4. Get Scouted form with uploads and admin review.
