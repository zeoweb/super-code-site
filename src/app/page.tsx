import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { CatalogClient } from "@/components/CatalogClient";
import { SupportChatModal } from "@/components/SupportChatModal";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/dictionaries";

// Единая витрина игр — одинаковая для гостя и для залогиненного пользователя.
// Разница только в шапке: у гостя кнопка "Войти", у пользователя — баланс и
// аватар с выпадающим меню (история/пополнение/профиль/админка).
export default async function CatalogPage() {
  const user = await getCurrentUser();
  const dict = getDictionary(getLocale());

  const [games, notifications, messages] = await Promise.all([
    prisma.game.findMany({ where: { isActive: true }, orderBy: { orderIndex: "asc" } }),
    user
      ? prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 20 })
      : Promise.resolve([]),
    user
      ? prisma.chatMessage.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 30 })
      : Promise.resolve([]),
  ]);

  // overflow-x-clip здесь раньше стоял прямо на <main> — из-за него
  // sticky-хедер в SiteHeader (рендерится первым внутри CatalogClient)
  // считал этот элемент ближайшим скролл-контейнером вместо viewport и не
  // прилипал при скролле. Сдвинули overflow-x-clip внутрь CatalogClient,
  // на обёртку вокруг контента ПОСЛЕ хедера (см. CatalogClient.tsx).
  return (
    <main className="relative mx-auto min-h-screen max-w-5xl p-6 pb-24 sm:pb-16">
      <CatalogClient
        user={
          user
            ? { name: user.name, avatarUrl: user.avatarUrl, balance: user.balance.toString(), role: user.role }
            : null
        }
        games={games.map((g) => ({
          id: g.id,
          slug: g.slug,
          title: g.title,
          imageUrl: g.imageUrl,
          category: g.category,
          badgeLabel: g.badgeLabel,
        }))}
        dict={dict}
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
