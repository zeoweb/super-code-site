"use client";

type NotifItem = { id: string; message: string; createdAt: string };

// Превью последних уведомлений на /dashboard. "Открыть уведомления" не ведёт
// на отдельную страницу — открывает ту же модалку "Чат", что и колокольчик
// в меню (через кастомное событие, слушает его SupportChatModal).
export function ActivityCard({ notifications }: { notifications: NotifItem[] }) {
  return (
    <div className="card mt-4">
      <div className="flex items-center gap-2">
        <BellIcon className="h-5 w-5 text-brand-light" />
        <span className="font-semibold">Активность</span>
      </div>

      <div className="mt-3 space-y-2">
        {notifications.length === 0 ? (
          <p className="text-sm text-slate-500">Пока нет уведомлений.</p>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
              <p className="text-slate-200">{n.message}</p>
              <p className="mt-1 text-xs text-slate-500">{formatTime(n.createdAt)}</p>
            </div>
          ))
        )}
      </div>

      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event("open-support-chat"))}
        className="mt-3 flex items-center gap-1 text-sm text-brand-light hover:underline"
      >
        Открыть уведомления →
      </button>
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

function BellIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 8a6 6 0 1 1 12 0c0 3.5 1 5.5 2 7H4c1-1.5 2-3.5 2-7Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 19a2.5 2.5 0 0 0 5 0" />
    </svg>
  );
}
