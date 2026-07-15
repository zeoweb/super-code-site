"use client";

import { useEffect, useRef, useState } from "react";
import { markNotificationsRead } from "@/app/actions/notifications";
import { markCuratorMessagesRead, sendStudentMessage } from "@/app/actions/chat";
import { ChatMessageBody } from "@/components/ChatMessageBody";

type NotifItem = { id: string; message: string; read: boolean; createdAt: string };
type ChatItem = { id: string; text: string; fromAdmin: boolean; read: boolean; createdAt: string };
type Tab = "all" | "system" | "curator";

type FeedEntry =
  | { kind: "notification"; id: string; createdAt: string; data: NotifItem }
  | { kind: "chat"; id: string; createdAt: string; data: ChatItem };

// Плавающая кнопка-колокольчик, открывающая модалку "Чат": системные
// уведомления + переписка с куратором в одном окне, с вкладками-фильтрами.
export function SupportChatModal({
  initialNotifications,
  initialMessages,
}: {
  initialNotifications: NotifItem[];
  initialMessages: ChatItem[];
}) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [messages, setMessages] = useState(initialMessages);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("all");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const unreadNotif = notifications.filter((n) => !n.read).length;
  const unreadChat = messages.filter((m) => m.fromAdmin && !m.read).length;
  const unreadTotal = unreadNotif + unreadChat;

function openModal() {
    setOpen(true);
    if (unreadNotif > 0) {
      setNotifications((list) => list.map((n) => ({ ...n, read: true })));
      markNotificationsRead();
    }
    if (unreadChat > 0) {
      setMessages((list) => list.map((m) => (m.fromAdmin ? { ...m, read: true } : m)));
      markCuratorMessagesRead();
    }
  }

  function toggle() {
    if (open) setOpen(false);
    else openModal();
  }

  // Позволяет открыть эту же модалку не только по клику на колокольчик, но и
  // с других страниц (например, карточка "Активность" на /dashboard).
  useEffect(() => {
    window.addEventListener("open-support-chat", openModal);
    return () => window.removeEventListener("open-support-chat", openModal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unreadNotif, unreadChat]);

  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [open, messages, tab]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput("");

    setMessages((list) => [
      ...list,
      { id: `tmp-${Date.now()}`, text, fromAdmin: false, read: true, createdAt: new Date().toISOString() },
    ]);

    const fd = new FormData();
    fd.set("text", text);
    await sendStudentMessage(fd);
    setSending(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const feed: FeedEntry[] = [
    ...notifications.map((n) => ({ kind: "notification" as const, id: n.id, createdAt: n.createdAt, data: n })),
    ...messages.map((m) => ({ kind: "chat" as const, id: m.id, createdAt: m.createdAt, data: m })),
  ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const visibleFeed =
    tab === "system" ? feed.filter((f) => f.kind === "notification") :
    tab === "curator" ? feed.filter((f) => f.kind === "chat") :
    feed;

  return (
    <>
      <button
        onClick={toggle}
        aria-label="Чат и уведомления"
        className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient text-white shadow-glow-lg transition-transform duration-300 hover:scale-110 md:bottom-6 md:right-6"
      >
        <BellIcon className="h-7 w-7" />
        {unreadTotal > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadTotal}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex max-h-[80vh] w-full max-w-md flex-col rounded-2xl border border-white/10 bg-ink-800/95 shadow-glow-lg backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Хедер */}
            <div className="flex items-center gap-3 border-b border-white/10 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-lg text-white shadow-glow">
                💬
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-bold">Чат</div>
                <div className="text-xs text-slate-400">Система и куратор</div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Закрыть"
                className="rounded-full p-1.5 text-slate-400 transition-colors duration-300 hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Табы */}
            <div className="flex gap-1 border-b border-white/10 p-2">
              {(["all", "system", "curator"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={
                    "flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-300 " +
                    (tab === t ? "bg-brand-gradient text-white" : "text-slate-400 hover:bg-white/10")
                  }
                >
                  {t === "all" ? "Все" : t === "system" ? "Система" : "Куратор"}
                </button>
              ))}
            </div>

            {/* Лента */}
            <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto p-4">
              {visibleFeed.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center">
                  <span className="text-3xl text-slate-600">💬</span>
                  <p className="font-medium text-slate-300">Пока пусто</p>
                  <p className="text-sm text-slate-500">Сообщения появятся здесь</p>
                </div>
              ) : (
                visibleFeed.map((item) =>
                  item.kind === "notification" ? (
                    <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
                      <p>{item.data.message}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatTime(item.createdAt)}</p>
                    </div>
                  ) : (
                    <div key={item.id} className={"flex " + (item.data.fromAdmin ? "justify-start" : "justify-end")}>
                      <div
                        className={
                          "max-w-[80%] rounded-2xl px-4 py-2 text-sm " +
                          (item.data.fromAdmin
                            ? "border border-white/10 bg-white/5 text-slate-200"
                            : "bg-brand-gradient text-white")
                        }
                      >
                        <ChatMessageBody text={item.data.text} />
                        <p className={"mt-1 text-[10px] " + (item.data.fromAdmin ? "text-slate-500" : "text-white/70")}>
                          {formatTime(item.createdAt)}
                        </p>
                      </div>
                    </div>
                  ),
                )
              )}
            </div>

            {/* Композер */}
            <div className="border-t border-white/10 p-3">
              <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/5 p-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  rows={1}
                  placeholder="Напишите куратору…"
                  className="max-h-24 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-slate-500"
                />
                <button
                  onClick={send}
                  disabled={sending || !input.trim()}
                  aria-label="Отправить"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-white transition-transform duration-300 hover:scale-110 disabled:opacity-40"
                >
                  ➤
                </button>
              </div>
              <p className="mt-1.5 text-center text-[11px] text-slate-500">
                Enter — отправить · Shift+Enter — новая строка
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function BellIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 8a6 6 0 1 1 12 0c0 3.5 1 5.5 2 7H4c1-1.5 2-3.5 2-7Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 19a2.5 2.5 0 0 0 5 0" />
    </svg>
  );
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
