import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { SupportChatModal } from "@/components/SupportChatModal";

// Общий каркас личного кабинета: /dashboard, /topup, /profile, /history.
// Каждая страница внутри по-прежнему сама проверяет сессию (defence in depth),
// здесь — только источник данных для сайдбара и модалки "Чат" (уведомления + поддержка).
export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [notifications, messages] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.chatMessage.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <DashboardSidebar
        name={user.name}
        avatarUrl={user.avatarUrl}
        balance={user.balance.toString()}
        role={user.role}
      />
      <div className="min-w-0 flex-1 pb-28 md:pb-0">{children}</div>
      <SupportChatModal
        initialNotifications={notifications.map((n) => ({
          id: n.id,
          message: n.message,
          read: n.read,
          createdAt: n.createdAt.toISOString(),
        }))}
        initialMessages={messages
          .map((m) => ({
            id: m.id,
            text: m.text,
            fromAdmin: m.fromAdmin,
            read: m.read,
            createdAt: m.createdAt.toISOString(),
          }))
          .reverse()}
      />
    </div>
  );
}
