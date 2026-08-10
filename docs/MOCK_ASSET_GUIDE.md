# Mock Asset Guide

## Purpose and non-negotiable boundary

All model, campaign, editorial, social, and video content in this prototype is
fictional mock content. It must feel like the public experience of a premium
Asian model agency while remaining disposable and replaceable when authorised
talent and CMS-managed media become available.

Never use real model data, confidential talent information, or photographs of
identifiable people without the documented right to use them. Do not present a
mock identity, biography, booking statistic, or campaign as factual.

## Approved visual direction

**Brand:** Asian Stars Agency  
**Positioning:** premium Asian model agency

- **Women:** Asian fashion models; editorial, beauty campaign, luxury
  commercial, runway, or magazine-quality photography.
- **Men:** Asian male models; luxury menswear, editorial, and premium
  commercial photography.
- **New Faces:** fresh, natural agency-digitals look; clean background and
  realistic casting presentation.
- **Talent:** professional performers or creators photographed with commercial
  brand quality.

Every selected image must pass these checks:

- Does it look like a real agency portfolio?
- Is the person visually credible as professional talent?
- Are the lighting, anatomy, skin texture, and composition professional?
- Does it belong in the Asian fashion industry context?
- Would a casting client trust this page enough to enquire?

Reject cartoons, illustrations, memes, unrelated lifestyle photography,
fantasy styling, exaggerated beauty filters, plastic-looking faces, poor
anatomy, obvious generative artifacts, and low-quality stock.

## Source policy and provenance

1. **Preferred:** licensed professional stock photography or commercial fashion
   libraries. Store the provider, licence/reference ID, permitted uses, and
   expiry/restrictions in the asset manifest before use.
2. **Prototype alternative:** AI-generated, fictional people. Store the prompt,
   generator, generation date, editor/reviewer, and the statement
   `fictional-prototype` in the manifest.
3. **Production replacement:** authorised custom photography after real model
   onboarding. Store the consent/licence reference and CMS asset ID.

Do not use random image-search results as mock assets. Never infer a licence
from a visible watermark-free image.

## Asset manifest contract

Each asset accepted into the project must have metadata equivalent to the
following. This deliberately maps to the future CMS media record rather than
to a vendor-specific image service.

```ts
type MockAssetManifestEntry = {
  id: string;
  sourceType: "licensed-stock" | "ai-fictional" | "authorised-custom";
  provenance: string;
  status: "approved-mock" | "ready-to-replace" | "replaced";
  usage: "hero" | "portrait-card" | "full-body-profile" | "portfolio-gallery";
  aspectRatio: string;
  objectFit: "contain" | "cover";
  objectPosition: string;
  mobileSource?: string;
  review: { reviewer: string; reviewedAt: string; notes?: string };
};
```

The source file belongs under `src/assets/mock/` while it is a bundled
prototype asset. Keep the manifest next to the content seed or future CMS
adapter that refers to it. Do not hard-code cloud-provider URLs in page
components.

## Image sizes and use

| Usage | Source requirement | Recommended delivery | Display rule |
| --- | --- | --- | --- |
| Hero campaign | Desktop and mobile compositions; protected space for copy | 2048×1152 desktop (16:9), 1440×1800 mobile (4:5) | Explicit focal point; use `cover` only when the safe area has been reviewed. |
| Portrait card | Full or three-quarter professional portrait | 1536×2048 (3:4) | Prefer `contain`; a reviewed `cover` needs a focal point. |
| Full-body profile | Head-to-toe, shoes and margin visible | 1536×2304 (2:3) | `contain`; never crop hair, head, hands, or shoes. |
| Portfolio gallery | Editorial, beauty, commercial, or runway image | 2048px long edge or higher | Per-image aspect ratio and focal point, not a forced crop. |

## AI generation prompt template

Use the same identity only within one deliberately created fictional asset set.
Do not imply that a generated person is a signed model. Review every output at
100% before use.

```text
Use case: photorealistic-natural
Asset type: <hero / portrait-card / full-body-profile / portfolio-gallery>
Primary request: premium fictional Asian model-agency photography for Asian
Stars Agency; this is a fictional person, not a real individual.
Subject: <age-appropriate adult, presentation, wardrobe, and board>
Scene/backdrop: <editorial studio / clean casting wall / luxury campaign set>
Composition/framing: <exact aspect ratio; required safe zones; leave room for
website copy where needed>
Lighting/mood: professional fashion editorial lighting, realistic skin texture,
natural facial features, premium commercial finish.
Constraints: anatomically correct adult human; natural hands; no text; no
logo; no watermark; no real-person likeness; no visible artefacts.
Avoid: beauty-filter skin, plastic face, distorted limbs, cropped hair, cropped
feet, fantasy styling, cartoon/illustration look, low-fashion-quality imagery.
```

### Prompt examples

**Portrait card — Women (3:4)**

```text
Photorealistic premium fashion-agency portrait of a fictional adult East Asian
woman in contemporary black tailoring, relaxed confident expression, natural
skin texture, neutral studio grey background, editorial beauty lighting. Three
quarter composition in a 3:4 vertical frame; hair, shoulders and hands fully
inside the frame. No text, logo, watermark, real-person likeness, beauty-filter
skin, distorted anatomy, or AI artefacts.
```

**Full body — Men (2:3)**

```text
Photorealistic premium menswear agency digital of a fictional adult East Asian
man in a restrained luxury suit, clean warm-grey studio background, realistic
proportions and skin texture. Head-to-toe composition in a 2:3 vertical frame:
full hair, both hands, both shoes and generous margin around the body are
visible. No text, logo, watermark, cropped feet, plastic skin, distorted hands,
or AI artefacts.
```

**New Faces digital (2:3)**

```text
Fictional adult Asian new-face model agency digital, natural daylight, plain
off-white casting background, minimal makeup and simple neutral clothing,
authentic calm expression. Head-to-toe 2:3 composition with full hair and shoes
visible, realistic anatomy and unretouched skin texture. No text, logo,
watermark, glamour filter, fantasy styling, or AI artefacts.
```

**Hero campaign (16:9 desktop; produce a 4:5 mobile companion)**

```text
Luxury Asian fashion campaign for a fictional adult model, cinematic editorial
lighting, refined architectural studio, quiet contemporary wardrobe, magazine
quality. Compose a 16:9 desktop image with the subject safely on the right and
clean negative space on the left for web copy; keep full head and body pose
within the safe area. No text, logo, watermark, real-person likeness, cropped
head or feet, distorted anatomy, plastic skin, or AI artefacts.
```

## Generation and review pipeline

1. Create one prompt per distinct asset; do not rely on unrelated random
   results or a one-size-fits-all batch prompt.
2. Inspect the generated image at full size for face, hands, legs, footwear,
   texture, reflections, and unintended text.
3. Create a mobile companion only when the desktop crop cannot protect the
   intended subject and copy-safe area.
4. Record provenance and presentation metadata in the manifest, then place the
   reviewed file in `src/assets/mock/`.
5. Render it through `AgencyImage`; pages must not impose a global
   `object-cover` crop.
6. Review desktop and 390px mobile on a Preview deployment before marking the
   asset approved.

## Replacing mocks when the CMS is ready

1. Upload the authorised real asset through the approved CMS/admin workflow.
2. Preserve the asset usage, aspect ratio, focal point, alt text, and licence /
   consent reference.
3. Point the repository adapter at the CMS asset record; no page component
   change should be necessary.
4. Mark the mock manifest entry `replaced`; retain prompt/provenance history
   for audit but remove the bundled mock file only through a reviewed PR.

