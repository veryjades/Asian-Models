import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { QuickBooking } from "@/components/site/QuickBooking";
import { useI18n } from "@/lib/i18n";
import { assistantAnswers, matchAnswer, type AssistantAnswer } from "@/lib/content/assistant";
import {
  retrieveModelRecommendations,
  type AssistantRetrievalResult,
} from "@/lib/content/assistantRetrieval";

type Turn =
  | { role: "user"; text: string }
  | {
      role: "assistant";
      text: string;
      link?: AssistantAnswer["link"];
      retrieval?: AssistantRetrievalResult;
    };

export function AskAssistant() {
  const { t, pick, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.body.dataset["jAssistantOpen"] = "true";
    return () => {
      delete document.body.dataset["jAssistantOpen"];
    };
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [turns]);

  async function ask(question: string) {
    const trimmed = question.trim().slice(0, 300);
    if (!trimmed) return;
    // The local structured retrieval is deliberately repository-backed. It can
    // later move behind a server-side Supabase/pgvector adapter without making
    // the chat UI ask visitors to search the site themselves.
    const retrieval = await retrieveModelRecommendations(trimmed);
    const answer = retrieval ? null : matchAnswer(trimmed);
    setTurns((prev) => [
      ...prev,
      { role: "user", text: trimmed },
      retrieval
        ? {
            role: "assistant",
            text: pick(retrieval.answerEn, retrieval.answerZh),
            retrieval,
          }
        : answer
          ? {
              role: "assistant",
              text: pick(answer.answerEn, answer.answerZh),
              link: answer.link,
            }
          : { role: "assistant", text: t("assistant.fallback") },
    ]);
    setInput("");
    inputRef.current?.focus();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-24 z-[2147483645] flex h-14 w-14 items-center justify-center rounded-full border border-foreground bg-background text-foreground transition-colors hover:bg-foreground hover:text-background"
        data-j-assistant-trigger
        aria-expanded={open}
        aria-label={open ? t("assistant.close") : t("assistant.open")}
        title={t("assistant.cta")}
      >
        {open ? (
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          >
            <rect x="4" y="7.5" width="16" height="11" rx="3.5" />
            <path d="M12 3.5v4" strokeLinecap="round" />
            <circle cx="12" cy="3" r="1.1" fill="currentColor" stroke="none" />
            <circle cx="9.5" cy="12.5" r="1.1" fill="currentColor" stroke="none" />
            <circle cx="14.5" cy="12.5" r="1.1" fill="currentColor" stroke="none" />
            <path d="M9.5 15.8h5" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {open && (
        <div className="fixed bottom-20 right-5 z-[2147483646] flex max-h-[70vh] w-[min(24rem,calc(100vw-2.5rem))] flex-col border border-border bg-background">
          <div className="gradient-accent h-1 w-full" aria-hidden="true" />
          <div className="border-b border-border px-4 py-3">
            <p className="label-xs text-foreground">{t("assistant.title")}</p>
            <p className="mt-2 text-xs text-muted-foreground">{t("assistant.intro")}</p>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {turns.length === 0 ? (
              <ul className="flex flex-col gap-2">
                <li>
                  <button
                    type="button"
                    onClick={() => ask(lang === "zh" ? "我要找男模" : "I need male models")}
                    className="w-full border border-border px-3 py-2 text-left text-xs text-foreground transition-colors hover:bg-secondary"
                  >
                    {lang === "zh" ? "我要找男模" : "I need male models"}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() =>
                      ask(
                        lang === "zh"
                          ? "我要找適合美妝廣告的女模"
                          : "Female models for a beauty campaign",
                      )
                    }
                    className="w-full border border-border px-3 py-2 text-left text-xs text-foreground transition-colors hover:bg-secondary"
                  >
                    {lang === "zh"
                      ? "我要找適合美妝廣告的女模"
                      : "Female models for a beauty campaign"}
                  </button>
                </li>
                {assistantAnswers.slice(0, 5).map((a) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => ask(lang === "zh" ? a.questionZh : a.questionEn)}
                      className="w-full border border-border px-3 py-2 text-left text-xs text-foreground transition-colors hover:bg-secondary"
                    >
                      {pick(a.questionEn, a.questionZh)}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="flex flex-col gap-4">
                {turns.map((turn, i) => (
                  <li key={i} className={turn.role === "user" ? "text-right" : ""}>
                    {turn.role === "user" ? (
                      <span className="inline-block bg-primary px-3 py-2 text-xs text-primary-foreground">
                        {turn.text}
                      </span>
                    ) : (
                      <div className="text-sm leading-relaxed text-foreground">
                        <p>{turn.text}</p>
                        {turn.retrieval?.candidates.length ? (
                          <div className="mt-3 space-y-3">
                            {turn.retrieval.candidates.map(({ model, signalsEn, signalsZh }) => (
                              <article key={model.slug} className="border border-border p-3">
                                <p className="label-xs text-foreground">
                                  {pick(model.name, model.nameZh)}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {pick(model.city, model.cityZh)} ·{" "}
                                  {pick(model.languages.join(", "), model.languages.join("、"))}
                                </p>
                                <p className="mt-2 text-xs text-muted-foreground">
                                  {pick(signalsEn.join(" · "), signalsZh.join("・"))}
                                </p>
                                <div className="mt-3 flex flex-wrap items-center gap-3">
                                  <Link
                                    to="/models/$board/$slug"
                                    params={{ board: model.board, slug: model.slug }}
                                    onClick={() => setOpen(false)}
                                    className="label-xs border-b border-foreground pb-1"
                                  >
                                    {pick("View profile", "查看檔案")}
                                  </Link>
                                  <QuickBooking modelId={model.slug} modelName={model.name} />
                                </div>
                              </article>
                            ))}
                          </div>
                        ) : null}
                        {turn.retrieval?.relatedNews.length ? (
                          <p className="mt-3 text-xs text-muted-foreground">
                            {pick(
                              `Related signals: ${turn.retrieval.relatedNews.map((post) => post.titleEn).join(" · ")}`,
                              `相關消息：${turn.retrieval.relatedNews.map((post) => post.titleZh).join("・")}`,
                            )}
                          </p>
                        ) : null}
                        {turn.retrieval?.relatedKnowledge.length ? (
                          <div className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
                            <p className="label-xs text-foreground">
                              {pick("From agency knowledge", "來自經紀公司知識庫")}
                            </p>
                            {turn.retrieval.relatedKnowledge.map((document) => (
                              <p key={document.titleEn} className="mt-2">
                                {pick(document.titleEn, document.titleZh)}
                              </p>
                            ))}
                          </div>
                        ) : null}
                        {turn.link && (
                          <Link
                            to={turn.link.to as never}
                            params={turn.link.params as never}
                            onClick={() => setOpen(false)}
                            className="label-xs mt-3 inline-block border-b border-foreground pb-1"
                          >
                            {pick(turn.link.labelEn, turn.link.labelZh)}
                          </Link>
                        )}
                      </div>
                    )}
                  </li>
                ))}
                <div ref={endRef} />
              </ul>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void ask(input);
            }}
            className="flex items-center gap-2 border-t border-border px-4 py-3"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={300}
              placeholder={t("assistant.placeholder")}
              className="flex-1 border-b border-border bg-transparent py-2 text-sm outline-none focus:border-foreground"
            />
            <button
              type="submit"
              className="label-xs border border-foreground px-3 py-2 transition-colors hover:bg-foreground hover:text-background"
            >
              {t("assistant.send")}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
