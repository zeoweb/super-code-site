import { prisma } from "@/lib/db";
import { createGame, updateGame, deleteGame, createPackage, updatePackage, deletePackage } from "@/app/actions/games";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";

const KIND_OPTIONS: { value: string; label: string }[] = [
  { value: "currency", label: "Валюта" },
  { value: "pass", label: "Пропуск" },
  { value: "voucher", label: "Ваучер" },
];
const KIND_ORDER = ["currency", "voucher", "pass"];

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "game", label: "Игра" },
  { value: "service", label: "Сервис" },
  { value: "software", label: "Софт" },
];

export default async function AdminGamesPage() {
  const games = await prisma.game.findMany({
    orderBy: { orderIndex: "asc" },
    include: { packages: { orderBy: { orderIndex: "asc" } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Игры и товары</h1>

      <div className="mt-6 space-y-3">
        {games.map((g) => (
          <details key={g.id} className="card overflow-hidden p-0">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-ink-800">
                  {g.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={g.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-lg">🎮</span>
                  )}
                </span>
                <div className="min-w-0">
                  <div className="truncate font-medium">
                    {g.title} {!g.isActive && <span className="badge text-slate-600">выкл</span>}
                  </div>
                  <div className="truncate text-sm text-slate-500">
                    {CATEGORY_OPTIONS.find((c) => c.value === g.category)?.label ?? g.category} · {g.packages.length} товаров
                  </div>
                </div>
              </div>
            </summary>

            <div className="space-y-4 border-t border-slate-200 p-4">
              <form action={updateGame} className="space-y-3">
                <input type="hidden" name="id" value={g.id} />
                <div>
                  <label className="label">Название</label>
                  <input name="title" defaultValue={g.title} className="input" required />
                </div>
                <div>
                  <label className="label">Раздел</label>
                  <select name="category" defaultValue={g.category} className="input">
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Картинка</label>
                  <input name="image" type="file" accept="image/png,image/jpeg,image/webp" className="input" />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="isActive" defaultChecked={g.isActive} /> Активна
                </label>
                <button className="btn-primary px-4 py-2 text-sm">Сохранить</button>
              </form>
              <ConfirmDeleteButton
                action={deleteGame}
                id={g.id}
                confirmText={`Удалить игру «${g.title}» вместе со всеми товарами?`}
              />

              {/* Товары — сгруппированы по типу, иначе список из 15-20 позиций
                  на одну игру превращается в нечитаемую простыню */}
              <div className="border-t border-slate-200 pt-4">
                <h3 className="text-sm font-semibold text-slate-600">Товары</h3>
                {g.packages.length === 0 ? (
                  <p className="mt-2 text-sm text-slate-500">Пока нет товаров.</p>
                ) : (
                  KIND_ORDER.filter((k) => g.packages.some((p) => p.kind === k)).map((k) => (
                    <div key={k} className="mt-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        {KIND_OPTIONS.find((o) => o.value === k)?.label ?? k}
                      </h4>
                      <div className="mt-2 space-y-2">
                        {g.packages
                          .filter((p) => p.kind === k)
                          .map((p) => (
                            <details key={p.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm">
                                <span>
                                  {p.title} · {p.price.toString()} смн {p.region && `· ${p.region}`}
                                  {!p.isActive && <span className="ml-2 badge text-slate-600">выкл</span>}
                                </span>
                              </summary>
                              <form action={updatePackage} className="mt-3 grid gap-2 sm:grid-cols-2">
                                <input type="hidden" name="id" value={p.id} />
                                <input name="title" defaultValue={p.title} className="input" placeholder="Название" required />
                                <input name="price" type="number" step="0.01" min="0" defaultValue={p.price.toString()} className="input" placeholder="Цена, смн" required />
                                <input name="amount" type="number" min="0" defaultValue={p.amount} className="input" placeholder="Кол-во валюты" />
                                <input name="region" defaultValue={p.region ?? ""} className="input" placeholder="Регион (GLOBAL, IN…)" />
                                <select name="kind" defaultValue={p.kind} className="input">
                                  {KIND_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ))}
                                </select>
                                <div className="flex items-center gap-2">
                                  {p.imageUrl && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={p.imageUrl} alt="" className="h-8 w-8 shrink-0 rounded-lg object-cover" />
                                  )}
                                  <input name="image" type="file" accept="image/png,image/jpeg,image/webp" className="input" />
                                </div>
                                <label className="flex items-center gap-2 text-sm">
                                  <input type="checkbox" name="isActive" defaultChecked={p.isActive} /> Активен
                                </label>
                                <button className="btn-primary px-3 py-1.5 text-xs sm:col-span-2">Сохранить</button>
                              </form>
                              <div className="mt-2">
                                <ConfirmDeleteButton action={deletePackage} id={p.id} confirmText={`Удалить товар «${p.title}»?`} />
                              </div>
                            </details>
                          ))}
                      </div>
                    </div>
                  ))
                )}

                <form action={createPackage} className="mt-3 grid gap-2 rounded-xl border border-dashed border-slate-300 p-3 sm:grid-cols-2">
                  <input type="hidden" name="gameId" value={g.id} />
                  <input name="title" className="input" placeholder="Название (напр. 110 алмазов)" required />
                  <input name="price" type="number" step="0.01" min="0" className="input" placeholder="Цена, смн" required />
                  <input name="amount" type="number" min="0" className="input" placeholder="Кол-во валюты" />
                  <input name="region" className="input" placeholder="Регион (опционально)" />
                  <select name="kind" defaultValue="currency" className="input">
                    {KIND_OPTIONS.map((k) => (
                      <option key={k.value} value={k.value}>{k.label}</option>
                    ))}
                  </select>
                  <input name="image" type="file" accept="image/png,image/jpeg,image/webp" className="input" />
                  <button className="btn-ghost sm:col-span-2">+ Добавить товар</button>
                </form>
              </div>
            </div>
          </details>
        ))}
      </div>

      {/* Создать игру */}
      <form action={createGame} className="card mt-6 space-y-3">
        <h2 className="font-semibold">Добавить игру</h2>
        <div>
          <label className="label">Название</label>
          <input name="title" className="input" placeholder="Напр. PUBG Mobile" required />
        </div>
        <div>
          <label className="label">Раздел</label>
          <select name="category" defaultValue="game" className="input">
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Картинка</label>
          <input name="image" type="file" accept="image/png,image/jpeg,image/webp" className="input" />
        </div>
        <button className="btn-primary">Добавить игру</button>
      </form>
    </div>
  );
}
