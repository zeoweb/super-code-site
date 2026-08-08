import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { SiteHeader } from "@/components/SiteHeader";
import { SupportChatModal } from "@/components/SupportChatModal";
import { ReviewForm } from "@/components/ReviewForm";
import { ReviewsList } from "@/components/ReviewsList";

const WHY_US = [
  { icon: "🕐", title: "24/7 поддержка", text: "Отвечаем и помогаем в любое время суток." },
  { icon: "💸", title: "Доступные цены", text: "Без переплат — честный курс на все игры." },
  { icon: "⚡", title: "Быстрый донат", text: "Пополнение обычно занимает пару минут." },
  { icon: "🛡️", title: "Надёжность", text: "Работаем стабильно, баланс списывается только после успешной покупки." },
];

const STATIC_RATING = "4,8";

export default async function AboutPage() {
  const [user, reviews] = await Promise.all([
    getCurrentUser(),
    prisma.review.findMany({ orderBy: { createdAt: "desc" } }),
  ]);
  const dict = getDictionary(getLocale());

  const [notifications, messages] = user
    ? await Promise.all([
        prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 20 }),
        prisma.chatMessage.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 30 }),
      ])
    : [[], []];

  return (
    <main className="relative mx-auto min-h-screen max-w-2xl p-6 pb-24 sm:pb-16">
      <SiteHeader
        user={
          user
            ? { name: user.name, avatarUrl: user.avatarUrl, balance: user.balance.toString(), role: user.role }
            : null
        }
        dict={dict}
      />

      {/* Почему выбрать нас */}
      <h1 className="mt-6 text-2xl font-bold">Почему выбрать нас</h1>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {WHY_US.map((item) => (
          <div key={item.title} className="card">
            <div className="text-2xl">{item.icon}</div>
            <div className="mt-2 font-bold">{item.title}</div>
            <div className="mt-1 text-sm text-slate-500">{item.text}</div>
          </div>
        ))}
      </div>

      {/* Отзывы */}
      <div className="mt-10 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Отзывы пользователей</h2>
        <span className="badge border-brand/40 text-brand-light">★ {STATIC_RATING}</span>
      </div>

      {reviews.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">Отзывов пока нет — будьте первым.</p>
      ) : (
        <ReviewsList reviews={reviews.map((r) => ({ id: r.id, name: r.name, text: r.text, rating: r.rating }))} />
      )}

      <div className="mt-4">
        {user ? (
          <ReviewForm />
        ) : (
          <div className="card text-center text-sm text-slate-500">
            <Link href="/login?returnTo=/about" className="font-medium text-brand-light hover:underline">
              Войдите
            </Link>
            , чтобы оставить отзыв.
          </div>
        )}
      </div>

      {/* CTA пополнения */}
      <div className="mt-10 rounded-3xl bg-brand-gradient p-6 text-center text-white shadow-glow">
        <h2 className="text-xl font-bold">Готовы донатить на любимую игру?</h2>
        <p className="mt-1 text-sm text-white/80">Пополните баланс и покупайте валюту в играх мгновенно.</p>
        <Link
          href="/topup"
          className="mt-4 inline-block rounded-xl bg-white px-6 py-3 font-semibold text-brand shadow-md transition-transform duration-300 hover:scale-105"
        >
          Пополнить
        </Link>
      </div>

      {/* Телеграм */}
      <div className="mt-6 text-center">
        <a
          href="https://t.me/superdonat_tj"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-slate-500 hover:text-brand-light"
        >
          Наш Telegram-канал: t.me/superdonat_tj
        </a>
      </div>

      {user && (
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
      )}
    </main>
  );
}
