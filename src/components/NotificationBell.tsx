"use client";

import { useState } from "react";
import { markNotificationsRead } from "@/app/actions/notifications";

type Notif = { id: string; message: string; read: boolean; createdAt: string };

// Плавающий колокольчик уведомлений — виден на всех страницах личного кабинета.
export function NotificationBell({ initialNotifications }: { initialNotifications: Notif[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && unreadCount > 0) {
      setNotifications((list) => list.map((n) => ({ ...n, read: true })));
      markNotificationsRead();
    }
  }

  return (
    <div className="fixed bottom-24 right-4 z-50 md:bottom-6 md:right-6">
      {open && (
        <div className="absolute bottom-16 right-0 max-h-96 w-72 overflow-y-auto rounded-2xl border border-white/10 bg-ink-800/95 p-3 shadow-lg backdrop-blur-xl">
          <div className="mb-2 text-sm font-semibold">Уведомления</div>
          {notifications.length === 0 ? (
            <p className="text-sm text-slate-500">Пока нет уведомлений.</p>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => (
                <div key={n.id} className="rounded-lg border border-white/10 bg-white/5 p-2 text-sm">
                  <p>{n.message}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(n.createdAt).toLocaleString("ru-RU", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        onClick={toggle}
        aria-label="Уведомления"
        className="relative flex h-12 w-12 items-center justify-center rounded-full bg-brand-gradient text-xl text-white shadow-glow-lg transition-transform duration-300 hover:scale-110"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
