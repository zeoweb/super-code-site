import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { SupportChatModal } from "@/components/SupportChatModal";

// Общий каркас личного кабинета: /dashboard, /billing, /profile, /leaderboard.
// Каждая страница внутри по-прежнему сама проверяет сессию (defence in depth),
// здесь — только источник данных для сайдбара и модалки "Чат" (уведомления + куратор).
export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const pathname = headers().get("x-pathname") ?? "";
  const isLessonRoute = pathname.startsWith("/lessons/");

  if (!user) {
    // Первый урок доступен анонимно, без сайдбара и чата куратора — их
    // требует доступ к личному кабинету. Всё остальное в группе — под входом.
    if (isLessonRoute) return <div className="min-h-screen">{children}</div>;
    redirect("/login");
  }

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
      <DashboardSidebar name={user.name} avatarUrl={user.avatarUrl} tier={user.tier} role={user.role} xp={user.xp} />
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
