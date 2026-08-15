# Keyword / Tag System

**Status:** prototype data boundary for the public-experience iteration
**Scope:** content discovery taxonomy only; no production admin or CMS has been built in this iteration.

## Purpose

The keyword system is a shared content-discovery layer. Its primary business goal is to help a client move from a production need to suitable talent faster.

It also supports SEO, model discovery, news discovery, portfolio discovery, booking discovery, search, filters, recommendations and future CMS workflows.

## Prototype boundary

The current prototype stores canonical keywords in `src/lib/content/keywords.ts`.

Each keyword includes:

- label
- slug
- active / inactive state
- display priority
- SEO priority
- language scope
- description

Models and News use canonical keyword slugs in their `tags` fields. The homepage Keyword Dynamic Runway consumes the top active keywords through the content repository, and each keyword resolves to a result page that groups relevant Models, News and portfolio signals.

Inactive keywords may exist in the registry as future business categories, but they do not appear in the homepage runway or public keyword result pages.

## Future admin workflow

The production admin/back-office should allow non-developers to manage this taxonomy:

```text
Content
├─ Models
│  └─ Tags
├─ News
│  └─ Tags
├─ Portfolio
│  └─ Tags
└─ Keywords
   ├─ Add
   ├─ Edit
   ├─ Activate / Deactivate
   ├─ SEO Priority
   └─ Display Priority
```

Model, News and Portfolio editors should use a searchable multi-select/autocomplete against the existing keyword registry. Editors should be encouraged to reuse canonical tags instead of typing arbitrary variants.

## Production requirement

The production taxonomy should be managed by the approved future content backend or CMS. It should not require frontend code changes when the agency adds, edits, deactivates or reorders keywords.

The frontend should continue to consume keywords and tag relationships through the content repository boundary, so the seed registry can later be replaced with CMS/admin-managed data.
