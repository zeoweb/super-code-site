"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/Avatar";

type Leaf = { type: "leaf"; href: string; label: string; icon: IconFn };
type Category = { type: "category"; label: string; icon: IconFn; children: { href: string; label: string }[] };
type NavEntry = Leaf | Category;

const NAV: NavEntry[] = [
  { type: "leaf", href: "/admin", label: "Обзор", icon: OverviewIcon },
  { type: "leaf", href: "/admin/tasks", label: "Задачи", icon: TasksIcon },
  {
    type: "category",
    label: "Продажи и учёт",
    icon: SalesIcon,
    children: [
      { href: "/admin/payments", label: "Платежи" },
      { href: "/admin/methods", label: "Реквизиты оплаты" },
    ],
  },
  { type: "leaf", href: "/admin/finance", label: "Финансы", icon: FinanceIcon },
  { type: "leaf", href: "/admin/users", label: "Ученики", icon: StudentsIcon },
  {
    type: "category",
    label: "Обучение",
    icon: BookIcon,
    children: [
      { href: "/admin/lessons", label: "Уроки и модули" },
      { href: "/admin/reviews", label: "Отзывы" },
      { href: "/admin/quiz", label: "Викторина" },
    ],
  },
  { type: "leaf", href: "/admin/chats", label: "Чаты", icon: ChatIcon },
  { type: "leaf", href: "/admin/broadcast", label: "Рассылка", icon: BroadcastIcon },
];

export function AdminSidebar({ name, avatarUrl }: { name: string; avatarUrl?: string | null }) {
  const pathname = usePathname();

  return (
    <nav className="w-56 shrink-0 space-y-1 text-sm">
      {NAV.map((entry) =>
        entry.type === "leaf" ? (
          <NavLeafLink key={entry.href} entry={entry} pathname={pathname} />
        ) : (
          <NavCategoryBlock key={entry.label} entry={entry} pathname={pathname} />
        ),
      )}

      {/* Карточка админа внизу списка */}
      <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Avatar name={name} avatarUrl={avatarUrl} size="h-8 w-8" textSize="text-sm" />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{name}</div>
            <div className="text-xs text-slate-500">Администратор</div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLeafLink({ entry, pathname }: { entry: Leaf; pathname: string }) {
  const isActive = pathname === entry.href;
  const Icon = entry.icon;
  return (
    <Link
      href={entry.href}
      className={
        "flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors duration-300 " +
        (isActive ? "bg-brand-gradient text-white shadow-glow" : "text-slate-300 hover:bg-white/10 hover:text-white")
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      {entry.label}
    </Link>
  );
}

function NavCategoryBlock({ entry, pathname }: { entry: Category; pathname: string }) {
  const childActive = entry.children.some((c) => pathname === c.href);
  const [open, setOpen] = useState(childActive);
  const Icon = entry.icon;

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className={
          "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors duration-300 " +
          (childActive ? "text-brand-light" : "text-slate-300 hover:bg-white/10 hover:text-white")
        }
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1">{entry.label}</span>
        <ChevronIcon className={"h-3.5 w-3.5 shrink-0 transition-transform duration-300 " + (open ? "rotate-180" : "")} />
      </button>
      {open && (
        <div className="ml-4 mt-1 space-y-1 border-l border-white/10 pl-3">
          {entry.children.map((c) => {
            const isActive = pathname === c.href;
            return (
              <Link
                key={c.href}
                href={c.href}
                className={
                  "block rounded-lg px-3 py-1.5 transition-colors duration-300 " +
                  (isActive ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/10 hover:text-white")
                }
              >
                {c.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

type IconProps = React.SVGProps<SVGSVGElement>;
type IconFn = (props: IconProps) => React.ReactElement;

function OverviewIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}

function TasksIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 7 1.5 1.5L8 6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 13 1.5 1.5L8 11" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 19 1.5 1.5L8 17" />
      <path strokeLinecap="round" d="M11 7h9M11 13h9M11 19h9" />
    </svg>
  );
}

function SalesIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16l-1.5 10a2 2 0 0 1-2 1.7H7.5a2 2 0 0 1-2-1.7L4 8Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 8V6a4 4 0 0 1 8 0v2" />
    </svg>
  );
}

function FinanceIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M12 7v10M9.5 9.3c0-1.1 1.1-2 2.5-2s2.5.9 2.5 2-1.1 1.7-2.5 1.7-2.5.6-2.5 1.7 1.1 2 2.5 2 2.5-.9 2.5-2" />
    </svg>
  );
}

function StudentsIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4 2 9l10 5 10-5-10-5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 11.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5" />
    </svg>
  );
}

function BookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.25C10.5 5 8 4.5 4.5 5v13c3.5-.5 6 0 7.5 1.25M12 6.25C13.5 5 16 4.5 19.5 5v13c-3.5-.5-6 0-7.5 1.25M12 6.25v13" />
    </svg>
  );
}

function ChatIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
      />
    </svg>
  );
}

function BroadcastIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 10v4a1 1 0 0 0 1 1h2l5 4V5L7 9H5a1 1 0 0 0-1 1Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 9a4 4 0 0 1 0 6M19.5 6.5a8 8 0 0 1 0 11" />
    </svg>
  );
}

function ChevronIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
    </svg>
  );
}
