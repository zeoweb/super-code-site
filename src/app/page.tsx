import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { CatalogClient } from "@/components/CatalogClient";
import { SupportChatModal } from "@/components/SupportChatModal";

// Единая витрина игр — одинаковая для гостя и для залогиненного пользователя.
// Разница только в шапке: у гостя кнопка "Войти", у пользователя — баланс и
// аватар с выпадающим меню (история/пополнение/профиль/админка).
export default async function CatalogPage() {
  const user = await getCurrentUser();

  const [games, notifications, messages] = await Promise.all([
    prisma.game.findMany({ where: { isActive: true }, orderBy: { orderIndex: "asc" } }),
    user
      ? prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 20 })
      : Promise.resolve([]),
    user
      ? prisma.chatMessage.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 30 })
      : Promise.resolve([]),
  ]);

  return (
    <main className="relative mx-auto min-h-screen max-w-5xl overflow-x-clip p-6 pb-24 sm:pb-16">
      <CatalogClient
        user={
          user
            ? { name: user.name, avatarUrl: user.avatarUrl, balance: user.balance.toString(), role: user.role }
            : null
        }
        games={games.map((g) => ({ id: g.id, slug: g.slug, title: g.title, imageUrl: g.imageUrl }))}
      />

      {user && (
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
      )}
    </main>
  );
}
