import { createFileRoute, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { contentRepository } from "@/lib/content/repository";
import { boards, type BoardId } from "@/lib/content/types";
import { ModelGrid } from "@/components/site/ModelGrid";
import { useI18n } from "@/lib/i18n";

const boardIds = boards.map((b) => b.id);

const boardQuery = (board: BoardId) =>
  queryOptions({
    queryKey: ["board", board],
    queryFn: () => contentRepository.listModels(board),
  });

export const Route = createFileRoute("/models/$board/")({
  loader: async ({ context, params }) => {
    if (!boardIds.includes(params.board as BoardId)) throw notFound();
    await context.queryClient.ensureQueryData(boardQuery(params.board as BoardId));
    return { board: params.board as BoardId };
  },
  head: ({ params }) => {
    const board = boards.find((b) => b.id === params.board);
    const label = board?.labelEn ?? "Models";
    return {
      meta: [
        { title: `${label} — Asian Stars Agency` },
        {
          name: "description",
          content: `The ${label} board at Asian Stars Agency. Portraits, statistics and portfolios for booking across Taipei, Tokyo, Seoul and Singapore.`,
        },
        { property: "og:title", content: `${label} — Asian Stars Agency` },
        {
          property: "og:description",
          content: `The ${label} board at Asian Stars Agency.`,
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `/models/${params.board}` },
      ],
      links: [{ rel: "canonical", href: `/models/${params.board}` }],
    };
  },
  component: BoardPage,
  errorComponent: () => (
    <p className="px-5 py-24 text-sm text-muted-foreground md:px-10">This board didn't load.</p>
  ),
  notFoundComponent: () => (
    <p className="px-5 py-24 text-sm text-muted-foreground md:px-10">Board not found.</p>
  ),
});

function BoardPage() {
  const { board } = Route.useLoaderData();
  const { data } = useSuspenseQuery(boardQuery(board));
  const { pick, t } = useI18n();
  const meta = boards.find((b) => b.id === board)!;

  return (
    <div>
      <div className="relative">
        <div className="gradient-accent h-1 w-full" aria-hidden="true" />
        <div className="mx-auto flex max-w-[1600px] items-baseline justify-between px-5 py-10 md:px-10">
          <h1 className="text-3xl font-light md:text-4xl">{pick(meta.labelEn, meta.labelZh)}</h1>
          <p className="label-xs text-muted-foreground">
            {data.length} {t("board.count")}
          </p>
        </div>
      </div>
      <ModelGrid models={data} />
    </div>
  );
}
