# Admin information architecture and public-field mapping

This is the source-of-truth map for the Admin UI. A field is not considered
complete until it has all four links: Admin input, Supabase storage, public
repository mapping, and a named frontend consumer.

Status markers:

- **Connected** — schema, Admin control, adapter, and public consumer exist.
- **Partial** — some of the path exists, but an editor, upload, or verification
  gate is still missing.
- **Planned** — the current application has no persisted/admin path yet.

## 1. Models and talent

### 1.1 Identity and routing

| Field | Supabase column | Admin control | Public consumers | Status |
| --- | --- | --- | --- | --- |
| Public slug | `models.slug` | Text; generated from English name when blank | Model profile URL, cards, keyword result, JAgent booking link | Partial |
| English name | `models.name` | Text | Cards, profile, booking, JAgent | Connected |
| Chinese name | `models.name_zh` | Text | Cards, profile, JAgent | Partial |
| Card/display name | `models.display_name` | Text | Admin list, fallback card title | Connected |
| Gender | `models.gender` | Select | Board filtering, JAgent matching | Connected |
| Board | `models.board` | Select: Women / Men / New Faces / Talent | Category routes and navigation | Partial |
| Category | `models.category` | Select/text | Admin list and board metadata | Connected |
| Status | `models.status` | Select: active / inactive / archived | Anonymous published model query | Connected |
| Featured | `models.featured` | Checkbox | Homepage featured models | Partial |

### 1.2 Casting profile

| Field | Supabase column | Admin control | Public consumers | Status |
| --- | --- | --- | --- | --- |
| City (English) | `models.city` | Text | Cards, profile, JAgent | Partial |
| City (中文) | `models.city_zh` | Text | Bilingual cards/profile | Partial |
| Nationality / market | `models.nationality` | Text | Profile/casting context | Connected |
| Languages | `models.languages` | Comma-separated input | Profile, JAgent matching | Connected |
| Tags / keywords | `models.tags` | Comma-separated slugs | Keyword routes, JAgent, News relation | Partial |
| English bio | `models.bio_en` (fallback `models.bio`) | Multiline text | Profile and JAgent | Partial |
| Chinese bio | `models.bio_zh` | Multiline text | Profile | Partial |

### 1.3 Measurements and appearance

The public `Model.stats` object is the presentation contract. The Admin form
must edit these keys rather than forcing operators to edit opaque JSON.

| Field | Supabase storage | Public consumer |
| --- | --- | --- |
| Height | `models.height` plus `models.stats.height` | Profile stats |
| Weight | `models.stats.weight` | Profile stats |
| Bust / waist / hips | `models.stats.bust`, `.waist`, `.hips` and `models.measurements` | Profile stats |
| Shoes | `models.stats.shoes` | Profile stats |
| Hair / hair (中文) | `models.stats.hair`, `.hairZh` | Profile stats |
| Eyes / eyes (中文) | `models.stats.eyes`, `.eyesZh` | Profile stats |

### 1.4 Media and external links

| Subcategory | Storage/table | Admin controls | Public consumers | Status |
| --- | --- | --- | --- | --- |
| Primary portrait | `media_assets` sort `0` | One image upload/replace | Cards, profile | Connected |
| Hover portrait | `media_assets` sort `1` | Optional second image upload/replace | Cards, keyword hover | Partial across roster |
| Portfolio gallery | `media_assets` sort `>1` | Unlimited image upload/delete | Profile portfolio | Partial public binding |
| MP4 media | `media_assets.type=video` | Unlimited MP4 upload/delete | Profile video gallery | Partial public binding |
| YouTube references | `model_video_links` | Title + HTTPS YouTube URL + delete | Profile video gallery | Partial public binding |
| Social links | `model_social_links` | Platform + label + HTTPS URL + delete | Profile/social actions | Partial public binding |

## 2. Agency and About

| Subcategory | Fields | Supabase table | Public consumers | Status |
| --- | --- | --- | --- | --- |
| Administrator routing | `admin_email` | `site_settings` | Notification trigger, Admin About tab | Connected |
| About titles | `about_title_en`, `about_title_zh` | `site_settings` | `/about` | Partial save/refresh QA |
| About copy | `about_body_en[]`, `about_body_zh[]` | `site_settings` | `/about` | Partial save/refresh QA |
| Offices/contact metadata | `offices` JSON | `site_settings` | `/about`, contact/footer (when consumed) | Partial |

## 3. News and editorial publishing

| Subcategory | Fields | Supabase table | Public consumers | Status |
| --- | --- | --- | --- | --- |
| Story identity | `slug`, `date` | `news_posts` | News index/detail | Connected |
| Localized titles | `title_en`, `title_zh` | `news_posts` | News cards/detail | Connected |
| Localized excerpts | `excerpt_en`, `excerpt_zh` | `news_posts` | Homepage/news index/keywords | Connected |
| Localized body | `body_en[]`, `body_zh[]` | `news_posts` | News detail | Connected |
| Cover media | `cover_url` | `news_posts` | Homepage/news/index/detail | Partial: URL input, upload/replace missing |
| Tags | `tags[]` | `news_posts` | Keyword results/JAgent context | Connected |
| Publishing | `status`, `published_at` | `news_posts` | Published-only public query | Partial: publish/list/delete, edit/draft QA missing |

## 4. JAgent knowledge and retrieval

| Field | Supabase column | Admin control | Public/JAgent consumer | Status |
| --- | --- | --- | --- | --- |
| English/Chinese title | `title_en`, `title_zh` | Create form | Source label/context | Partial |
| English/Chinese content | `content_en`, `content_zh` | Create form | Retrieval answer context | Partial |
| Source type | `source_type` | Fixed `manual` today | Source label | Partial |
| Source URL | `source_url` | Missing input | Citation/source link | Planned |
| Tags | `tags[]` | Comma-separated input | Retrieval scoring | Partial |
| Publish state | `published` | Fixed true today | Published-only anonymous retrieval | Partial |
| Retrieval index/vector | Postgres FTS/optional vector | No Admin field | JAgent retrieval | Planned server RPC/vector path |

## 5. Leads, applications, and notification operations

### 5.1 Client enquiries and booking requests

`inquiries`: `kind`, `enquiry_type`, `name`, `company`, `email`, `phone`,
`subject`, `budget`, `message`, `details`, `status`, timestamps.

Admin consumer: Inbox list, status workflow, notification outbox. Public
producers: Contact form and model-specific Quick Booking.

### 5.2 Scout applications

`scout_applications`: `name`, `age`, `city`, `email`, `phone`, `height`,
`measurements`, `instagram`, `social_links`, `message`, `attachments`,
`status`, timestamps.

Admin consumer: Applications Inbox, attachment count, status workflow. Public
producer: Get Scouted form.

### 5.3 Administrator notifications

`admin_notifications`: `kind`, `reference_id`, `recipient_email`, `subject`,
`status`, `error`, `sent_at`, timestamps. The database trigger creates one row
for each enquiry/application. `notify-admin` dispatches it; a provider secret
is still required for actual email delivery.

## 6. Access, storage, and taxonomy controls

- **Access:** Supabase Auth + `app_metadata.role` (`admin`, `editor`, `viewer`).
  Admin/Editor write; Admin-only delete; Viewer read-only.
- **Storage:** `model-media` stores model media by `models/<model-id>/`; the
  `scout-submissions` bucket stores application attachments.
- **Taxonomy:** the current 15 keyword registry is in
  `src/lib/content/keywords.ts` and model/news tags are persisted as slugs.
  A keyword Admin CRUD table is not yet persisted; do not add ad-hoc keyword
  fields to model forms until that source-of-truth decision is made.

## Required implementation order

1. Complete the model identity/casting/measurement fields in Admin and map them
   through `repository.ts`.
2. Bind stored gallery/video/social relations to public model profiles.
3. Complete About save/refresh and News edit/draft/media workflows.
4. Add JAgent source URL, edit/delete, and server-side retrieval verification.
5. Run the role matrix, public refresh checks, responsive/hover QA, and release
   gates.
