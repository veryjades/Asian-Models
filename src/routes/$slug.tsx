import { createFileRoute, notFound, redirect } from "@tanstack/react-router";

import { canonicalizeTag, isKnownKeywordSlug } from "@/lib/content/keywords";

/**
 * Short paths such as /beauty or /editorial-model redirect to /keywords/:slug
 * so Admin tag labels and bookmarks do not 404 when the /keywords prefix is omitted.
 */
export const Route = createFileRoute("/$slug")({
  beforeLoad: ({ params }) => {
    const canonical = canonicalizeTag(params.slug);
    if (canonical && isKnownKeywordSlug(canonical)) {
      throw redirect({ to: "/keywords/$slug", params: { slug: canonical } });
    }
    throw notFound();
  },
});
