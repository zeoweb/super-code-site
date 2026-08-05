import { redirect } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { EditProfileForm } from "@/components/EditProfileForm";
import { AvatarUploadForm } from "@/components/AvatarUploadForm";
import { CopyButton } from "@/components/CopyButton";
import { LogoutButton } from "@/components/LogoutButton";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?returnTo=/profile");

  const ordersCount = await prisma.order.count({ where: { userId: user.id } });

  const locale = getLocale();
  const dict = getDictionary(locale);
  const isDark = cookies().get("theme")?.value === "dark";

  const registeredAt = user.createdAt.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="sr-only">Профиль</h1>

      {/* Карточка профиля */}
      <div className="card">
        <div className="flex items-start gap-4">
          <AvatarUploadForm name={user.name} avatarUrl={user.avatarUrl} size="h-16 w-16" />
          <div className="min-w-0">
            <EditProfileForm name={user.name} phone={user.phone} />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <ProfileStat value={`${user.balance.toString()} смн`} label="баланс" />
          <ProfileStat value={String(ordersCount)} label="покупок" />
        </div>

        <p className="mt-6 text-sm text-slate-600">С нами с {registeredAt}</p>
      </div>

      {/* Реферальный код — виден сразу на главном экране профиля, без
          перехода на под-страницу; полная статистика — по клику на
          "Пригласить друзей" ниже. */}
      <div className="card mt-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs text-slate-500">Ваш реферальный код</div>
          <div className="mt-0.5 truncate font-mono text-lg font-bold tracking-wider">{user.referralCode}</div>
        </div>
        <CopyButton value={user.referralCode} />
      </div>

      {/* Быстрый доступ */}
      <h2 className="mt-8 text-lg font-bold">Быстрый доступ</h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <QuickLink href="/topup" label="Пополнить баланс" icon={<PlusIcon />} />
        <QuickLink href="/history" label="История заказов" icon={<HistoryIcon />} />
        <QuickLink href="/support" label="Поддержка" icon={<ChatBubbleIcon />} />
        <QuickLink href="/" label="Каталог игр" icon={<GameIcon />} />
      </div>

      {/* Настройки: язык и тема */}
      <div className="card mt-8 divide-y divide-slate-100">
        <div className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
          <span className="text-sm font-medium">{dict.settings.language}</span>
          <LanguageSwitcher current={locale} />
        </div>
        <div className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
          <span className="text-sm font-medium">{dict.settings.theme}</span>
          <ThemeToggle initialDark={isDark} />
        </div>
      </div>

      {/* Реферальная программа */}
      <Link
        href="/profile/referral"
        className="card mt-4 flex items-center gap-3 transition-all duration-300 hover:scale-[1.01] hover:border-brand/40"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-brand-light">
          <PersonPlusIcon />
        </span>
        <span className="min-w-0 flex-1 text-sm font-medium">{dict.settings.referral}</span>
        <ChevronIcon className="h-4 w-4 shrink-0 text-slate-400" />
      </Link>

      {/* Выход */}
      <div className="card mt-8 border-red-500/20">
        <LogoutButton />
      </div>
    </main>
  );
}

function ProfileStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 py-3 text-center backdrop-blur-xl">
      <div className="text-lg font-bold bg-brand-gradient bg-clip-text text-transparent">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}

function QuickLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="card flex items-center gap-2 px-3 py-3 transition-all duration-300 hover:scale-[1.02] hover:border-brand/40 sm:gap-3 sm:px-4"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-brand-light sm:h-9 sm:w-9">
        {icon}
      </span>
      <span className="min-w-0 flex-1 text-sm font-medium leading-tight sm:text-base">{label}</span>
    </Link>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
    </svg>
  );
}

function ChatBubbleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
      />
    </svg>
  );
}

function GameIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <rect x="3" y="8" width="18" height="10" rx="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 11v4M6 13h4" />
      <circle cx="16" cy="12.5" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="18" cy="14.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

function PersonPlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <circle cx="10" cy="8" r="3.5" />
      <path strokeLinecap="round" d="M3.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5" />
      <path strokeLinecap="round" d="M19 8v4M17 10h4" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6" />
    </svg>
  );
}
