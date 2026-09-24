# J Assistant retrieval — prototype boundary

## Purpose

J Assistant must retrieve candidates instead of instructing visitors to search
the boards themselves. The current implementation is a small deterministic
retrieval layer designed for the prototype's content volume; it is not an LLM
or a production security boundary.

## Implemented now

`src/lib/content/assistantRetrieval.ts` reads published models, News, and About
through the existing repository / public `site_settings` path first (D-019 / D-022).
Manual knowledge documents are overlay-only. Specialist handoff (D-020 / D-023)
offers in-app enquiry, Quick Booking, and Admin-editable Messenger / LINE OA
deep links. Webhooks stay Phase 7. Dual-field bilingual stays until Phase 6 (D-021).

`src/lib/content/assistantRetrieval.ts` reads only through the existing
`ContentRepository` boundary and returns a stable result shape containing:

- up to four ranked model candidates;
- the matching gender, language, market and keyword/tag signals;
- portfolio availability;
- relevant news signals; and
- direct profile and model-specific Quick Booking actions in J Assistant.

The searchable sources are models/model profiles (including language metadata),
portfolio availability, News tags, keyword taxonomy, and the existing booking
and recruitment FAQ answers. Agency information remains available through the
same J Assistant knowledge-base answer set.

Current deterministic intents include Men/Women, Japanese-speaking talent,
Japan/Tokyo market, Show Girl, Beauty, advertising/commercial, fashion/runway,
and host/presenter. The same repository boundary is already consumed by board,
keyword, profile, and news pages, so the assistant does not maintain a second
unreviewed roster.

## Example outcomes

| Query                      | Current retrieval result                                    |
| -------------------------- | ----------------------------------------------------------- |
| `我要找男模`               | Lin Wei-Jie, Noah Castellanos, Han Min-jae, Kim Do-yun      |
| `有沒有會日文的男模？`     | Noah Castellanos, Ravi Iskandar                             |
| `我要找 Show Girl`         | Ravi Iskandar, Yang Shu-Fen                                 |
| `我要找適合美妝廣告的女模` | Amara Okonkwo, Aoi Takahashi, Priya Raghunathan, Tanya Lim  |
| `誰適合日本品牌廣告？`     | Aoi Takahashi, Chen Yu-Xin, Noah Castellanos, Ravi Iskandar |

## Supabase / pgvector evolution

When a Supabase project is approved and connected, retain the UI result shape
and replace only the retrieval implementation with a server-side adapter:

1. Store reviewed model, portfolio, news, keyword, agency, booking, and
   recruitment content in Supabase.
2. Apply RLS so public search exposes only intentionally public data.
3. Build embeddings and pgvector search server-side for semantic queries.
4. Enforce booking, rate-limiting, and any model-provider keys server-side.

No service-role key, model-provider key, or search credential is used by the
current browser retrieval path.
