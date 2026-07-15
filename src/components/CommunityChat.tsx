"use client";

import { useEffect, useRef, useState } from "react";
import { sendCommunityMessage } from "@/app/actions/community";
import { Avatar } from "@/components/Avatar";

type MessageUser = { id: string; name: string; avatarUrl: string | null };
type Message = {
  id: string;
  text: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  createdAt: string;
  user: MessageUser;
};

const POLL_INTERVAL_MS = 5000;

// Общий чат Pro-участников: текст + фото/видео, лёгкий поллинг вместо
// websockets — достаточно для группы, где сообщения не критично мгновенны.
export function CommunityChat({
  initialMessages,
  currentUserId,
}: {
  initialMessages: Message[];
  currentUserId: string;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastCreatedAtRef = useRef<string>(
    initialMessages.length > 0 ? initialMessages[initialMessages.length - 1].createdAt : new Date(0).toISOString(),
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function mergeFresh(fresh: Message[]) {
    if (fresh.length === 0) return;
    setMessages((prev) => {
      const existingIds = new Set(prev.map((m) => m.id));
      const toAdd = fresh.filter((m) => !existingIds.has(m.id));
      if (toAdd.length === 0) return prev;
      return [...prev, ...toAdd];
    });
    lastCreatedAtRef.current = fresh[fresh.length - 1].createdAt;
  }

  async function pollNow() {
    try {
      const res = await fetch(`/api/community/messages?after=${encodeURIComponent(lastCreatedAtRef.current)}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.messages?.length) mergeFresh(data.messages);
    } catch {
      // тихо игнорируем сбой поллинга — попробуем на следующем тике
    }
  }

  useEffect(() => {
    const id = setInterval(pollNow, POLL_INTERVAL_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  }

  function clearMedia() {
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function send() {
    const trimmed = text.trim();
    if (!trimmed && !mediaFile) return;
    if (sending) return;

    setSending(true);
    setError(null);

    const fd = new FormData();
    fd.set("text", trimmed);
    if (mediaFile) fd.set("media", mediaFile);

    const result = await sendCommunityMessage(fd);
    if (result?.error) {
      setError(result.error);
      setSending(false);
      return;
    }

    setText("");
    clearMedia();
    await pollNow();
    setSending(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="flex flex-col">
      <div
        ref={scrollRef}
        className="max-h-[60vh] min-h-[320px] overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
      >
        {messages.length === 0 ? (
          <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-2 text-center">
            <span className="text-3xl text-slate-600">💬</span>
            <p className="font-medium text-slate-300">Пока пусто</p>
            <p className="text-sm text-slate-500">Будьте первым, кто напишет в чат Pro-участников</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m) => (
              <div key={m.id} className="flex items-start gap-3">
                <Avatar name={m.user.name} avatarUrl={m.user.avatarUrl} size="h-9 w-9" textSize="text-sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="truncate text-sm font-semibold">
                      {m.user.name}
                      {m.user.id === currentUserId && (
                        <span className="ml-1.5 text-xs font-normal text-brand-light">(вы)</span>
                      )}
                    </span>
                    <span className="shrink-0 text-[11px] text-slate-500">{formatTime(m.createdAt)}</span>
                  </div>
                  {m.text && <p className="mt-0.5 whitespace-pre-line text-sm text-slate-200">{m.text}</p>}
                  {m.mediaType === "image" && m.mediaUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.mediaUrl}
                      alt=""
                      className="mt-2 max-h-72 rounded-xl border border-white/10 object-contain"
                    />
                  )}
                  {m.mediaType === "video" && m.mediaUrl && (
                    <video src={m.mediaUrl} controls className="mt-2 max-h-72 rounded-xl border border-white/10" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

      {mediaPreview && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2 text-sm">
          {mediaFile?.type.startsWith("video") ? (
            <video src={mediaPreview} className="h-12 w-12 rounded-lg object-cover" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mediaPreview} alt="" className="h-12 w-12 rounded-lg object-cover" />
          )}
          <span className="min-w-0 flex-1 truncate text-slate-400">{mediaFile?.name}</span>
          <button type="button" onClick={clearMedia} className="shrink-0 text-slate-500 hover:text-white">
            ✕
          </button>
        </div>
      )}

      <div className="sticky bottom-4 mt-3 flex items-end gap-2 rounded-2xl border border-white/10 bg-ink-800/80 p-2 shadow-lg backdrop-blur-xl">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Прикрепить фото или видео"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg text-slate-400 transition-colors duration-300 hover:bg-white/10 hover:text-white"
        >
          📎
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,video/mp4,video/webm,video/quicktime"
          className="hidden"
          onChange={onFileChange}
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder="Написать участникам…"
          className="max-h-32 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-slate-500"
        />
        <button
          type="button"
          onClick={send}
          disabled={sending || (!text.trim() && !mediaFile)}
          aria-label="Отправить"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-white transition-transform duration-300 hover:scale-110 disabled:opacity-40 disabled:hover:scale-100"
        >
          ➤
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-slate-500">
        Enter — отправить · Shift+Enter — новая строка · 📎 — фото или видео
      </p>
    </div>
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
