import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { SupportChatModal } from "@/components/SupportChatModal";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/dictionaries";

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
  const dict = getDictionary(getLocale());

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
    // SiteHeader рендерит прямым ребёнком этого div (без отдельной
    // обёртки) — сам div высокий (min-h-screen) и содержит и хедер, и
    // {children}, поэтому sticky-хедеру есть где "прилипать" при скролле
    // по всей странице (см. комментарий про containerClassName в
    // SiteHeader.tsx).
    <div className="min-h-screen pb-24 sm:pb-0">
      <SiteHeader
        user={{ name: user.name, avatarUrl: user.avatarUrl, balance: user.balance.toString(), role: user.role }}
        dict={dict}
        containerClassName="mx-auto max-w-5xl px-6"
      />
      {children}
      <SupportChatModal
        initialNotifications={notifications.map((n) => ({
          id: n.id,
          message: n.message,
          read: n.read,
          createdAt: n.createdAt.toISOString(),
          actionLabel: n.actionLabel,
          actionUrl: n.actionUrl,
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
