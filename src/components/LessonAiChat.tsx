"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const QUICK_PROMPTS = ["Объясни простыми словами", "Приведи пример", "Что дальше?"];

// "AI по уроку" — контекстный помощник, знает тему текущего урока и отвечает
// по её материалу (отдельно от общего Super AI).
export function LessonAiChat({
  lessonId,
  lessonTitle,
  initialMessages,
}: {
  lessonId: string;
  lessonTitle: string;
  initialMessages: Msg[];
}) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || pending) return;

    setError(null);
    setMessages((m) => [...m, { role: "user", content: trimmed }]);
    setInput("");
    setPending(true);

    try {
      const res = await fetch("/api/ai/lesson-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, lessonId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Не удалось получить ответ");
        return;
      }
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch {
      setError("Ошибка сети. Попробуйте ещё раз.");
    } finally {
      setPending(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <div className="card overflow-hidden border-indigo-500/20 bg-indigo-500/[0.04] p-0">
      <div className="flex items-center gap-3 border-b border-indigo-500/20 p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-lg text-white shadow-lg">
          ✨
        </span>
        <div className="min-w-0">
          <div className="font-bold">AI по уроку</div>
          <div className="truncate text-sm text-slate-400">{lessonTitle}</div>
        </div>
      </div>

      <div ref={scrollRef} className="max-h-[45vh] min-h-[140px] overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <p className="text-sm text-slate-400">
              Спросите про этот урок — AI знает тему и поможет разобраться.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => send(p)}
                  className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-sm transition-colors duration-300 hover:bg-indigo-500/20"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={"flex " + (m.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={
                    "max-w-[80%] whitespace-pre-line rounded-2xl px-4 py-2 text-sm " +
                    (m.role === "user"
                      ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white"
                      : "border border-indigo-500/20 bg-indigo-500/10 text-slate-200")
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
            {pending && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-sm text-slate-400">
                  AI печатает…
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {error && <p className="px-4 text-sm text-red-400">{error}</p>}

      <form onSubmit={onSubmit} className="border-t border-indigo-500/20 p-3">
        <div className="flex items-end gap-2 rounded-2xl border border-indigo-500/20 bg-ink-900/40 p-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="Вопрос по уроку…"
            className="max-h-28 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={pending || !input.trim()}
            aria-label="Отправить"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white transition-transform duration-300 hover:scale-110 disabled:opacity-40"
          >
            ➤
          </button>
        </div>
        <p className="mt-1.5 text-center text-[11px] text-slate-500">
          Enter — отправить · Shift+Enter — новая строка
        </p>
      </form>
    </div>
  );
}
