import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { CopyButton } from "@/components/CopyButton";
import { REFERRAL_PERCENT } from "@/lib/referral";

export default async function ReferralPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?returnTo=/profile/referral");

  const referralsCount = await prisma.user.count({ where: { referredById: user.id } });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const referralLink = `${appUrl}/register?ref=${user.id}`;

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
        <p className="mt-3 text-sm text-slate-600">
          Приглашено друзей: <strong className="text-slate-600">{referralsCount}</strong>
        </p>
      </div>
    </main>
  );
}
