import Link from "next/link";
import { prisma } from "@/lib/db";
import { Avatar } from "@/components/Avatar";

// Список переписок: по одному треду на ученика, отсортированы по последнему сообщению.
export default async function AdminChatsPage() {
  const messages = await prisma.chatMessage.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  });

  const threads = new Map<
    string,
    { user: { id: string; name: string; avatarUrl: string | null }; lastText: string; lastAt: Date; unread: number }
  >();

  for (const m of messages) {
    if (!threads.has(m.userId)) {
      threads.set(m.userId, { user: m.user, lastText: m.text, lastAt: m.createdAt, unread: 0 });
    }
    if (!m.fromAdmin && !m.read) {
      threads.get(m.userId)!.unread++;
    }
  }

  const list = Array.from(threads.values());

  return (
    <div>
      <h1 className="text-2xl font-bold">Чаты</h1>
      <p className="mt-1 text-sm text-slate-400">Переписки с учениками.</p>

      <div className="mt-6 space-y-2">
        {list.length === 0 && (
          <p className="text-sm text-slate-500">Сообщений пока нет.</p>
        )}
        {list.map((t) => (
          <Link
            key={t.user.id}
            href={`/admin/chats/${t.user.id}`}
            className="card flex items-center gap-3 transition-all duration-300 hover:scale-[1.01] hover:border-brand/40"
          >
            <Avatar name={t.user.name} avatarUrl={t.user.avatarUrl} />
            <div className="min-w-0 flex-1">
              <div className="font-medium">{t.user.name}</div>
              <div className="truncate text-sm text-slate-400">{t.lastText}</div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="text-xs text-slate-500">
                {t.lastAt.toLocaleDateString("ru-RU")}
              </span>
              {t.unread > 0 && (
                <span className="badge border-brand/40 bg-brand-gradient text-white">{t.unread}</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
