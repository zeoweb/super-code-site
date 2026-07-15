"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { renameAiConversation, deleteAiConversation } from "@/app/actions/ai";

type Msg = { role: "user" | "assistant"; content: string };
type Conversation = { id: string; title: string; updatedAt: string };

const QUICK_PROMPTS = [
  "Как начать учить программирование?",
  "Объясни что такое вайб-кодинг",
  "Помоги с домашним заданием",
  "Идеи для своего проекта",
];

// Super AI: сайдбар со списком сохранённых диалогов (как в ChatGPT) + чат.
// На мобильном сайдбар — выезжающая шторка, на десктопе — постоянная колонка.
export function AiChatLayout({
  conversations: initialConversations,
  activeId: initialActiveId,
  initialMessages,
}: {
  conversations: Conversation[];
  activeId: string | null;
  initialMessages: Msg[];
}) {
  const router = useRouter();
  const [conversations, setConversations] = useState(initialConversations);
  const [activeId, setActiveId] = useState(initialActiveId);
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setConversations(initialConversations);
  }, [initialConversations]);

  useEffect(() => {
    setActiveId(initialActiveId);
    setMessages(initialMessages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialActiveId]);

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
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, conversationId: activeId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Не удалось получить ответ");
        return;
      }
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);

      const returnedId = data.conversationId as string | undefined;
      if (returnedId) {
        setActiveId(returnedId);
        setConversations((list) => {
          const now = new Date().toISOString();
          const existing = list.find((c) => c.id === returnedId);
          const rest = list.filter((c) => c.id !== returnedId);
          const entry = existing
            ? { ...existing, updatedAt: now }
            : { id: returnedId, title: trimmed.slice(0, 60), updatedAt: now };
          return [entry, ...rest];
        });
        if (returnedId !== initialActiveId) {
          router.replace(`/ai?c=${returnedId}`, { scroll: false });
        }
      }
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

  function startNewChat() {
    setActiveId(null);
    setMessages([]);
    setError(null);
    setDrawerOpen(false);
    router.replace("/ai", { scroll: false });
  }

  function openConversation(id: string) {
    setDrawerOpen(false);
    router.push(`/ai?c=${id}`);
  }

  async function handleRename(conv: Conversation) {
    const title = window.prompt("Новое название чата", conv.title);
    if (!title || !title.trim() || title.trim() === conv.title) return;
    const trimmed = title.trim().slice(0, 60);
    setConversations((list) => list.map((c) => (c.id === conv.id ? { ...c, title: trimmed } : c)));
    const fd = new FormData();
    fd.set("id", conv.id);
    fd.set("title", trimmed);
    await renameAiConversation(fd);
  }

  async function handleDelete(conv: Conversation) {
    if (!window.confirm(`Удалить чат «${conv.title}»?`)) return;
    setConversations((list) => list.filter((c) => c.id !== conv.id));
    if (activeId === conv.id) {
      setActiveId(null);
      setMessages([]);
      router.replace("/ai", { scroll: false });
    }
    const fd = new FormData();
    fd.set("id", conv.id);
    await deleteAiConversation(fd);
  }

  const activeTitle = activeId ? conversations.find((c) => c.id === activeId)?.title : null;

  return (
    <div className="flex gap-4">
      {/* Десктоп: постоянный сайдбар со списком чатов */}
      <aside className="hidden w-64 shrink-0 flex-col md:flex">
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          onNew={startNewChat}
          onOpen={openConversation}
          onRename={handleRename}
          onDelete={handleDelete}
        />
      </aside>

      {/* Мобайл: шторка поверх экрана */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="flex h-full w-[85%] max-w-xs flex-col border-r border-white/10 bg-ink-900 p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3">
              <span className="text-sm font-semibold text-slate-400">История чатов</span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Закрыть"
                className="rounded-full p-1.5 text-slate-400 transition-colors duration-300 hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>
            <ConversationList
              conversations={conversations}
              activeId={activeId}
              onNew={startNewChat}
              onOpen={openConversation}
              onRename={handleRename}
              onDelete={handleDelete}
            />
          </div>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="История чатов"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-colors duration-300 hover:bg-white/10 md:hidden"
          >
            <HistoryIcon className="h-5 w-5" />
          </button>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-lg shadow-glow">
            ✨
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold">{activeTitle ?? "Новый чат"}</h1>
            <p className="text-sm text-slate-400">Умный помощник по учёбе</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col">
          <div
            ref={scrollRef}
            className="max-h-[55vh] min-h-[320px] overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:max-h-[60vh]"
          >
            {messages.length === 0 ? (
              <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-4 py-6 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gradient text-3xl shadow-glow">
                  ✨
                </span>
                <div>
                  <h2 className="text-lg font-bold">Чем могу помочь?</h2>
                  <p className="mx-auto mt-1 max-w-sm text-sm text-slate-400">
                    Спросите про код, курсы, вайб-кодинг — как в ChatGPT, но заточено под Super Code Academy
                  </p>
                </div>
                <div className="grid w-full max-w-md grid-cols-1 gap-2 sm:grid-cols-2">
                  {QUICK_PROMPTS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => send(p)}
                      className="rounded-xl border border-white/10 bg-white/5 p-3 text-left text-sm transition-all duration-300 hover:scale-[1.02] hover:border-brand/40"
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
                          ? "bg-brand-gradient text-white"
                          : "border border-white/10 bg-white/5 text-slate-200")
                      }
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {pending && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-400">
                      Super AI печатает…
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

          <form
            onSubmit={onSubmit}
            className="sticky bottom-4 mt-4 flex items-end gap-2 rounded-2xl border border-white/10 bg-ink-800/80 p-2 shadow-lg backdrop-blur-xl"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder="Сообщение Super AI…"
              className="max-h-32 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={pending || !input.trim()}
              aria-label="Отправить"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-white transition-transform duration-300 hover:scale-110 disabled:opacity-40 disabled:hover:scale-100"
            >
              ➤
            </button>
          </form>
          <p className="mt-2 text-center text-xs text-slate-500">
            Enter — отправить · Shift+Enter — новая строка · AI может ошибаться
          </p>
        </div>
      </div>
    </div>
  );
}

function ConversationList({
  conversations,
  activeId,
  onNew,
  onOpen,
  onRename,
  onDelete,
}: {
  conversations: Conversation[];
  activeId: string | null;
  onNew: () => void;
  onOpen: (id: string) => void;
  onRename: (conv: Conversation) => void;
  onDelete: (conv: Conversation) => void;
}) {
  return (
    <div className="flex h-full flex-col gap-3">
      <button
        type="button"
        onClick={onNew}
        className="flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-medium text-white shadow-glow transition-transform duration-300 hover:scale-[1.02]"
      >
        <PlusIcon className="h-4 w-4" />
        Новый чат
      </button>

      <div className="flex-1 space-y-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-slate-500">Пока нет сохранённых чатов</p>
        ) : (
          conversations.map((c) => (
            <div
              key={c.id}
              className={
                "group flex items-center gap-1 rounded-xl px-1 transition-colors duration-300 " +
                (c.id === activeId ? "bg-white/10" : "hover:bg-white/5")
              }
            >
              <button
                type="button"
                onClick={() => onOpen(c.id)}
                className="min-w-0 flex-1 truncate px-2 py-2.5 text-left text-sm text-slate-200"
                title={c.title}
              >
                {c.title}
              </button>
              <button
                type="button"
                onClick={() => onRename(c)}
                aria-label="Переименовать"
                className="rounded-lg p-1.5 text-slate-500 opacity-100 transition-opacity duration-300 hover:bg-white/10 hover:text-white md:opacity-0 md:group-hover:opacity-100"
              >
                <PencilIcon className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(c)}
                aria-label="Удалить"
                className="rounded-lg p-1.5 text-slate-500 opacity-100 transition-opacity duration-300 hover:bg-red-500/10 hover:text-red-400 md:opacity-0 md:group-hover:opacity-100"
              >
                <TrashIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

type IconProps = React.SVGProps<SVGSVGElement>;

function PlusIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}

function PencilIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13" />
    </svg>
  );
}

function HistoryIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 1 0 3-6.2M4 12V6m0 6h6" />
    </svg>
  );
}
