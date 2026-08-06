import { prisma } from "@/lib/db";
import { createReviewAdmin, deleteReview } from "@/app/actions/reviews";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { StarRatingDisplay } from "@/components/StarRating";
import { SubmitButton } from "@/components/SubmitButton";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold">Отзывы</h1>
      <p className="mt-1 text-sm text-slate-500">
        Отзывы с /about — обычные (от пользователей) и добавленные вручную (перенос из других источников).
      </p>

      <form action={createReviewAdmin} className="card mt-6 space-y-3">
        <h2 className="font-semibold">Добавить отзыв вручную</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Имя</label>
            <input name="name" className="input" placeholder="Jasur" required />
          </div>
          <div>
            <label className="label">Оценка (1–5, опционально)</label>
            <input name="rating" type="number" min="1" max="5" className="input" placeholder="5" />
          </div>
        </div>
        <div>
          <label className="label">Текст отзыва</label>
          <textarea name="text" rows={3} className="input resize-none" required />
        </div>
        <SubmitButton className="btn-primary" pendingText="Добавляем…">
          Добавить
        </SubmitButton>
      </form>

      <h2 className="mt-8 text-lg font-bold">Все отзывы ({reviews.length})</h2>
      {reviews.length === 0 ? (
        <p className="mt-2 text-sm text-slate-600">Отзывов пока нет.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {reviews.map((r) => (
            <div key={r.id} className="card flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{r.name}</span>
                  <StarRatingDisplay rating={r.rating} />
                  {!r.userId && <span className="badge text-slate-600">вручную</span>}
                </div>
                <p className="mt-1 text-sm text-slate-600">{r.text}</p>
                <div className="mt-1 text-xs text-slate-500">{r.createdAt.toLocaleDateString("ru-RU")}</div>
              </div>
              <ConfirmDeleteButton action={deleteReview} id={r.id} confirmText={`Удалить отзыв «${r.name}»?`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
