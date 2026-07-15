import { prisma } from "@/lib/db";
import { createTask, setTaskStatus, deleteTask } from "@/app/actions/admin";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import type { TaskStatus } from "@prisma/client";

const STATUS_LABEL: Record<TaskStatus, string> = {
  open: "Открыта",
  in_progress: "В работе",
  done: "Готова",
};

const STATUS_CLASS: Record<TaskStatus, string> = {
  open: "border-white/10 text-slate-400",
  in_progress: "border-yellow-500/40 text-yellow-400",
  done: "border-emerald-500/40 text-emerald-400",
};

const STATUS_ORDER: TaskStatus[] = ["open", "in_progress", "done"];

// Простой тудушный список для админа/куратора. Без назначения на сотрудников —
// в проекте только роли student/admin, отдельной системы персонала нет.
export default async function AdminTasksPage() {
  const tasks = await prisma.task.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Задачи</h1>
      <p className="mt-1 text-sm text-slate-400">Простой тудушный список для админа/куратора.</p>

      {/* Добавить задачу */}
      <form action={createTask} className="card mt-6 space-y-3">
        <h2 className="font-semibold">Добавить задачу</h2>
        <div>
          <label className="label">Название</label>
          <input name="title" className="input" placeholder="Что нужно сделать" required />
        </div>
        <div>
          <label className="label">Описание (опционально)</label>
          <textarea name="description" rows={2} className="input" placeholder="Детали задачи" />
        </div>
        <button className="btn-primary">Добавить</button>
      </form>

      {/* Список задач */}
      <div className="mt-6 space-y-2">
        {tasks.length === 0 && (
          <p className="text-sm text-slate-500">Задач пока нет — добавьте выше.</p>
        )}
        {tasks.map((t) => (
          <div key={t.id} className="card flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-medium">{t.title}</div>
              {t.description && <div className="mt-1 text-sm text-slate-400">{t.description}</div>}
              <span className={"badge mt-2 inline-flex " + STATUS_CLASS[t.status]}>
                {STATUS_LABEL[t.status]}
              </span>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {STATUS_ORDER.filter((s) => s !== t.status).map((s) => (
                <form key={s} action={setTaskStatus}>
                  <input type="hidden" name="id" value={t.id} />
                  <input type="hidden" name="status" value={s} />
                  <button className="btn-ghost px-3 py-1.5 text-xs">→ {STATUS_LABEL[s]}</button>
                </form>
              ))}
              <ConfirmDeleteButton
                action={deleteTask}
                id={t.id}
                confirmText={`Удалить задачу «${t.title}»?`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
