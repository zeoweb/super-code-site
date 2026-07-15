import { prisma } from "@/lib/db";
import {
  createModule,
  deleteModule,
  createLesson,
  updateLesson,
  deleteLesson,
  createBunnyVideoForLesson,
} from "@/app/actions/admin";

// Управление структурой курса: модули и уроки.
export default async function AdminLessonsPage() {
  const course = await prisma.course.findFirst({
    where: { slug: "super-code" },
    include: {
      modules: {
        orderBy: { orderIndex: "asc" },
        include: { lessons: { orderBy: { orderIndex: "asc" } } },
      },
    },
  });

  if (!course) {
    return <p className="text-slate-400">Курс не найден. Запустите сид: <code>npm run db:seed</code>.</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Уроки и модули</h1>
      <p className="mt-1 text-sm text-slate-400">Курс: {course.title}</p>

      {/* Добавить модуль */}
      <form action={createModule} className="card mt-4 flex flex-wrap gap-2">
        <input type="hidden" name="courseId" value={course.id} />
        <input name="title" placeholder="Название нового модуля" className="input flex-1" required />
        <button className="btn-primary">Добавить модуль</button>
      </form>

      <div className="mt-6 space-y-6">
        {course.modules.map((m) => (
          <section key={m.id} className="card">
            <div className="flex items-center justify-between gap-3">
              <h2 className="min-w-0 truncate font-semibold">{m.title}</h2>
              <form action={deleteModule} className="shrink-0">
                <input type="hidden" name="id" value={m.id} />
                <button className="whitespace-nowrap text-xs text-red-400 hover:underline">Удалить модуль</button>
              </form>
            </div>

            {/* Уроки модуля */}
            <div className="mt-4 space-y-3">
              {m.lessons.map((l) => (
                <details key={l.id} className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-xl">
                  <summary className="flex cursor-pointer items-center justify-between px-4 py-3">
                    <span>
                      {l.title}{" "}
                      <span className="ml-2 badge text-slate-400">
                        {l.isFree || l.requiredTier === "free" ? "free" : l.requiredTier}
                      </span>
                      {!l.bunnyVideoId && (
                        <span className="ml-2 badge border-yellow-500/40 text-yellow-400">без видео</span>
                      )}
                    </span>
                  </summary>

                  <div className="border-t border-white/10 p-4">
                    {/* Форма редактирования урока */}
                    <form action={updateLesson} className="space-y-3">
                      <input type="hidden" name="id" value={l.id} />
                      <div>
                        <label className="label">Название</label>
                        <input name="title" defaultValue={l.title} className="input" required />
                      </div>
                      <div>
                        <label className="label">Описание</label>
                        <textarea name="description" defaultValue={l.description ?? ""} rows={3} className="input" />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="label">Bunny Video ID (guid)</label>
                          <input name="bunnyVideoId" defaultValue={l.bunnyVideoId ?? ""} className="input" placeholder="напр. 8f3c…" />
                        </div>
                        <div>
                          <label className="label">Длительность (сек)</label>
                          <input name="durationSeconds" type="number" defaultValue={l.durationSeconds} className="input" />
                        </div>
                        <div>
                          <label className="label">Порядок</label>
                          <input name="orderIndex" type="number" defaultValue={l.orderIndex} className="input" />
                        </div>
                        <div>
                          <label className="label">Требуемый тариф</label>
                          <select name="requiredTier" defaultValue={l.requiredTier} className="input">
                            <option value="free">Бесплатно</option>
                            <option value="plus">Plus+</option>
                            <option value="pro">Pro</option>
                          </select>
                        </div>
                      </div>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" name="isFree" defaultChecked={l.isFree} /> Бесплатный урок (доступен всем)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <button className="btn-primary px-4 py-2 text-sm">Сохранить урок</button>
                      </div>
                    </form>

                    {/* Доп. действия */}
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-white/10 pt-3">
                      <form action={createBunnyVideoForLesson}>
                        <input type="hidden" name="id" value={l.id} />
                        <input type="hidden" name="title" value={l.title} />
                        <button className="btn-ghost px-3 py-2 text-xs">
                          Создать видео в Bunny
                        </button>
                      </form>
                      <form action={deleteLesson}>
                        <input type="hidden" name="id" value={l.id} />
                        <button className="btn-ghost px-3 py-2 text-xs text-red-400">Удалить урок</button>
                      </form>
                    </div>
                  </div>
                </details>
              ))}
            </div>

            {/* Добавить урок */}
            <form action={createLesson} className="mt-4 flex flex-wrap gap-2">
              <input type="hidden" name="moduleId" value={m.id} />
              <input name="title" placeholder="Название нового урока" className="input flex-1" required />
              <button className="btn-ghost">Добавить урок</button>
            </form>
          </section>
        ))}
      </div>
    </div>
  );
}
