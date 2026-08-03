import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { SupportChatModal } from "@/components/SupportChatModal";

// Общий каркас личных страниц: /topup, /profile, /history, /support.
// Никакого постоянного сайдбара — общая шапка с выпадающим меню (та же,
// что и на каталоге /), сама страница ниже рисует свой контент.
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
    <div className="min-h-screen pb-24 sm:pb-0">
      <div className="mx-auto max-w-5xl px-6">
        <SiteHeader
          user={{ name: user.name, avatarUrl: user.avatarUrl, balance: user.balance.toString(), role: user.role }}
        />
      </div>
      {children}
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
