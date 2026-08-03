import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
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
    <main className="relative mx-auto min-h-screen max-w-5xl overflow-x-clip p-6 pb-16">
      <SiteHeader
        user={
          user
            ? { name: user.name, avatarUrl: user.avatarUrl, balance: user.balance.toString(), role: user.role }
            : null
        }
      />

      {games.length === 0 ? (
        <p className="mt-12 text-center text-sm text-slate-600">
          Игры скоро появятся — загляните позже.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {games.map((g) => (
            <Link
              key={g.id}
              href={`/games/${g.slug}`}
              className="card overflow-hidden p-0 transition-all duration-300 hover:scale-[1.02] hover:border-brand/40"
            >
              <div className="relative aspect-square bg-ink-800">
                {g.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={g.imageUrl} alt={g.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl">🎮</div>
                )}
              </div>
              <div className="p-3 text-center">
                <div className="truncate text-sm font-bold">{g.title}</div>
              </div>
            </Link>
          ))}
        </div>
      )}

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
