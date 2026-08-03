import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { PackagePicker } from "@/components/PackagePicker";

// Публичная страница игры: ввод игрового ID + выбор пакета + покупка с
// баланса. Доступна без входа — вход требуется только при отправке формы.
export default async function GamePage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { error?: string };
}) {
  const [game, user] = await Promise.all([
    prisma.game.findUnique({
      where: { slug: params.slug },
      include: { packages: { where: { isActive: true }, orderBy: { orderIndex: "asc" } } },
    }),
    getCurrentUser(),
  ]);
  if (!game || !game.isActive) notFound();

  return (
    <main className="mx-auto max-w-xl p-6">
      <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">← К каталогу</Link>

      <div className="mt-4 flex items-center gap-3">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-ink-800">
          {game.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={game.imageUrl} alt={game.title} className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl">🎮</span>
          )}
        </span>
        <h1 className="text-2xl font-bold">{game.title}</h1>
      </div>

      {game.packages.length === 0 ? (
        <p className="mt-8 text-sm text-slate-600">Товары для этой игры скоро появятся.</p>
      ) : (
        <PackagePicker
          gameSlug={game.slug}
          packages={game.packages.map((p) => ({
            id: p.id,
            region: p.region,
            kind: p.kind,
            title: p.title,
            amount: p.amount,
            price: p.price.toString(),
          }))}
          error={searchParams.error}
          balance={user ? user.balance.toString() : null}
        />
      )}
    </main>
  );
}
