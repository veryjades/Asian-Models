# Golden Mock Asset Set — Round 1

**Status:** approved fictional prototype media  
**Generated:** 2026-08-11  
**Count:** 18 assets  
**Source:** OpenAI GPT Image via the approved CLI fallback; all people are fictional adults and not real signed talent.

## Quality gate

Every asset passed manual review for natural facial features, credible anatomy, hands and footwear, professional fashion lighting, Asian-market positioning, and no material head/feet crop or obvious generative artifact. They remain replaceable by future authorised CMS uploads.

## Asset map and prompt intent

| Assets                                                                               | Purpose                             | Prompt intent                                                                       |
| ------------------------------------------------------------------------------------ | ----------------------------------- | ----------------------------------------------------------------------------------- |
| `hero-taipei-atelier`, `hero-seoul-tailoring`, `hero-tokyo-evening`                  | Three homepage hero CTAs            | Full-figure luxury Asian fashion campaigns with a reviewed copy-safe area.          |
| `women-aya-*`, `women-mei-*`, `women-sora-*`                                         | Women cards, profiles, digitals     | Three fictional adult women; portrait plus identity-preserving full-body extension. |
| `men-jun-*`, `men-ren-*`                                                             | Men cards, profiles, digitals       | Two fictional adult men; portrait plus identity-preserving full-body extension.     |
| `new-face-nari-digital`, `new-face-dai-digital`                                      | New Faces cards, profiles, digitals | Clean daylight agency digitals with full figure and shoes visible.                  |
| `portfolio-women-editorial`, `portfolio-men-commercial`, `portfolio-beauty-campaign` | Portfolio galleries                 | Editorial fashion, luxury menswear commercial, and restrained beauty campaign.      |

The canonical prompt templates, negative constraints, licences, and replacement process are in [`MOCK_ASSET_GUIDE.md`](./MOCK_ASSET_GUIDE.md). `src/lib/content/mockAssets.ts` records the exact purpose, aspect ratio, and focal presentation metadata for all 18 files.

## Generation controls

- Model: `gpt-image-2`; quality: `high`; output: WebP.
- Heroes: 2048×1152; portraits/digitals: 1024×1536; portfolio: 1536×1024.
- Full-body pairs used their fictional portrait as an identity reference after a local PNG conversion. No real-person input was used.
