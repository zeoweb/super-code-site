import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminMobileNav } from "@/components/AdminMobileNav";

// Общий каркас админки + повторная проверка прав на сервере.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?returnTo=/admin");
  if (user.role !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 bg-ink-800/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 p-3 sm:p-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <AdminMobileNav name={user.name} avatarUrl={user.avatarUrl} />
            <span className="truncate text-base font-black sm:text-lg">
              SUPER<span className="bg-brand-gradient bg-clip-text text-transparent">CODE</span>{" "}
              <span className="hidden font-normal text-slate-400 sm:inline text-sm">админка</span>
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1 text-sm sm:gap-2">
            <Link href="/dashboard" className="rounded-lg px-2 py-2 transition-colors duration-300 hover:bg-white/10 sm:px-3">На сайт</Link>
            <form action={logoutAction}>
              <button className="rounded-lg px-2 py-2 text-red-400 transition-colors duration-300 hover:bg-white/10 sm:px-3">Выйти</button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-6 p-4 sm:p-6">
        <div className="hidden md:block">
          <AdminSidebar name={user.name} avatarUrl={user.avatarUrl} />
        </div>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
