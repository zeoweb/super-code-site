import { redirect } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { CopyButton } from "@/components/CopyButton";
import { REFERRAL_PERCENT } from "@/lib/referral";

export default async function ReferralPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?returnTo=/profile/referral");

  const [referralsCount, earnedAgg] = await Promise.all([
    prisma.user.count({ where: { referredById: user.id } }),
    prisma.balanceTx.aggregate({
      where: { userId: user.id, reason: "referral" },
      _sum: { amount: true },
    }),
  ]);
  const totalEarned = (earnedAgg._sum.amount ?? 0).toString();

  // Ссылка строится от реального хоста запроса, а не от env-переменной —
  // так она верна и на localhost, и на проде без ручной синхронизации.
  const host = headers().get("host") ?? "super.tj";
  const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
  const referralLink = `${protocol}://${host}/?ref=${user.referralCode}`;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link href="/profile" className="text-sm text-slate-500 hover:text-slate-900">← Назад в профиль</Link>

      <h1 className="mt-3 text-2xl font-bold">Пригласить друзей</h1>

      <div className="card mt-4">
        <p className="text-sm text-slate-500">
          Получайте {REFERRAL_PERCENT}% с каждой покупки приглашённого друга — бонус
          начисляется на баланс автоматически.
        </p>
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <code className="min-w-0 flex-1 truncate text-sm text-slate-600">{referralLink}</code>
          <CopyButton value={referralLink} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 py-3 text-center">
            <div className="text-lg font-bold bg-brand-gradient bg-clip-text text-transparent">{referralsCount}</div>
            <div className="text-xs text-slate-500">приглашено друзей</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 py-3 text-center">
            <div className="text-lg font-bold bg-brand-gradient bg-clip-text text-transparent">{totalEarned} смн</div>
            <div className="text-xs text-slate-500">начислено бонусов</div>
          </div>
        </div>
      </div>
    </main>
  );
}
