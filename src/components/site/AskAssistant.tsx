import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { assistantAnswers, matchAnswer, type AssistantAnswer } from "@/lib/content/assistant";

type Turn =
  | { role: "user"; text: string }
  | { role: "assistant"; text: string; link?: AssistantAnswer["link"] };

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
    endRef.current?.scrollIntoView({ block: "end" });
  }, [turns]);

  function ask(question: string) {
    const trimmed = question.trim().slice(0, 300);
    if (!trimmed) return;
    // Local keyword match today; swap for a server-side model call later
    // without changing this component's contract.
    const answer = matchAnswer(trimmed);
    setTurns((prev) => [
      ...prev,
      { role: "user", text: trimmed },
      answer
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
        className="label-xs fixed bottom-5 right-5 z-50 border border-foreground bg-background px-4 py-3 text-foreground shadow-none transition-colors hover:bg-foreground hover:text-background"
        aria-expanded={open}
      >
        {open ? t("assistant.close") : t("assistant.cta")}
      </button>

      {open && (
        <div className="fixed bottom-20 right-5 z-50 flex max-h-[70vh] w-[min(24rem,calc(100vw-2.5rem))] flex-col border border-border bg-background">
          <div className="gradient-accent h-1 w-full" aria-hidden="true" />
          <div className="border-b border-border px-4 py-3">
            <p className="label-xs text-foreground">{t("assistant.title")}</p>
            <p className="mt-2 text-xs text-muted-foreground">{t("assistant.intro")}</p>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {turns.length === 0 ? (
              <ul className="flex flex-col gap-2">
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
              ask(input);
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
