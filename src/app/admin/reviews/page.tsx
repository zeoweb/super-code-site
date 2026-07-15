import { prisma } from "@/lib/db";
import {
  createReview,
  updateReview,
  toggleReviewPublish,
  deleteReview,
} from "@/app/actions/admin";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";

// Управление отзывами учеников для карусели на лендинге.
export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({ orderBy: { orderIndex: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold">Отзывы</h1>
      <p className="mt-1 text-sm text-slate-400">
        Показываются на лендинге в карусели — только опубликованные, по порядку.
      </p>

      {/* Добавить отзыв */}
      <form action={createReview} className="card mt-6 space-y-3">
        <h2 className="font-semibold">Добавить отзыв</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Имя ученика</label>
            <input name="studentName" className="input" placeholder="Амир" required />
          </div>
          <div>
            <label className="label">Роль / описание</label>
            <input name="studentRole" className="input" placeholder="IT специалист" />
          </div>
        </div>

        <div>
          <label className="label">Видео-отзыв (MP4/WEBM/MOV, до 50 МБ)</label>
          <input name="video" type="file" accept="video/mp4,video/webm,video/quicktime" className="input" />
        </div>

        <div>
          <label className="label">Текстовая цитата (если видео нет)</label>
          <textarea name="quoteText" rows={2} className="input" placeholder="Короткая цитата ученика" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Рейтинг</label>
            <select name="rating" defaultValue="5" className="input">
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>{n} ★</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 self-end pb-3 text-sm">
            <input type="checkbox" name="isPublished" defaultChecked /> Опубликован
          </label>
        </div>

        <button className="btn-primary">Добавить отзыв</button>
      </form>

      {/* Список отзывов */}
      <div className="mt-6 space-y-3">
        {reviews.length === 0 && (
          <p className="text-sm text-slate-500">Отзывов пока нет — добавьте выше.</p>
        )}
        {reviews.map((r) => (
          <details key={r.id} className="group rounded-lg border border-white/10 bg-white/5 backdrop-blur-xl [&::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <span className="font-medium">{r.studentName}</span>
                {r.studentRole && <span className="ml-2 text-sm text-slate-400">{r.studentRole}</span>}
                <span className="ml-2 text-xs text-yellow-400">{"★".repeat(r.rating)}</span>
              </div>
              <span className={"badge shrink-0 " + (r.isPublished ? "border-brand/40 text-brand-light" : "text-slate-500")}>
                {r.isPublished ? "Опубликован" : "Скрыт"}
              </span>
            </summary>

            <div className="border-t border-white/10 p-4">
              <form action={updateReview} className="space-y-3">
                <input type="hidden" name="id" value={r.id} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label">Имя ученика</label>
                    <input name="studentName" defaultValue={r.studentName} className="input" required />
                  </div>
                  <div>
                    <label className="label">Роль / описание</label>
                    <input name="studentRole" defaultValue={r.studentRole ?? ""} className="input" />
                  </div>
                </div>

                <div>
                  <label className="label">
                    Видео-отзыв {r.videoUrl ? "(уже загружено — выберите файл, чтобы заменить)" : "(MP4/WEBM/MOV, до 50 МБ)"}
                  </label>
                  <input name="video" type="file" accept="video/mp4,video/webm,video/quicktime" className="input" />
                </div>

                <div>
                  <label className="label">Текстовая цитата (если видео нет)</label>
                  <textarea name="quoteText" defaultValue={r.quoteText ?? ""} rows={2} className="input" />
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="label">Рейтинг</label>
                    <select name="rating" defaultValue={r.rating} className="input">
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>{n} ★</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Порядок</label>
                    <input name="orderIndex" type="number" defaultValue={r.orderIndex} className="input" />
                  </div>
                  <label className="flex items-center gap-2 self-end pb-3 text-sm">
                    <input type="checkbox" name="isPublished" defaultChecked={r.isPublished} /> Опубликован
                  </label>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button className="btn-primary px-4 py-2 text-sm">Сохранить</button>
                </div>
              </form>

              <div className="mt-3 flex flex-wrap gap-2 border-t border-white/10 pt-3">
                <form action={toggleReviewPublish}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className="btn-ghost px-3 py-2 text-xs">
                    {r.isPublished ? "Скрыть" : "Опубликовать"}
                  </button>
                </form>
                <ConfirmDeleteButton
                  action={deleteReview}
                  id={r.id}
                  confirmText={`Удалить отзыв «${r.studentName}»? Это необратимо.`}
                />
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
