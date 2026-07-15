import { prisma } from "@/lib/db";
import { createQuizQuestion, deleteQuizQuestion } from "@/app/actions/quiz";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { quizDifficultyLabel } from "@/lib/access";
import type { QuizDifficulty } from "@prisma/client";

const DIFFICULTIES: QuizDifficulty[] = ["novice", "medium", "pro"];

// Управление вопросами викторины (бесплатный уровень + Plus+ уровни).
export default async function AdminQuizPage() {
  const quiz = await prisma.quiz.findFirst({
    include: { questions: { orderBy: { orderIndex: "asc" } } },
  });

  if (!quiz) {
    return <p className="text-slate-400">Викторина не найдена. Запустите сид: <code>npm run db:seed</code>.</p>;
  }

  const byDifficulty = new Map<QuizDifficulty, typeof quiz.questions>();
  for (const d of DIFFICULTIES) byDifficulty.set(d, []);
  for (const q of quiz.questions) byDifficulty.get(q.difficulty)?.push(q);

  return (
    <div>
      <h1 className="text-2xl font-bold">Викторина</h1>
      <p className="mt-1 text-sm text-slate-400">{quiz.title} · {quiz.questions.length} вопросов</p>

      {/* Добавить вопрос */}
      <form action={createQuizQuestion} className="card mt-6 space-y-3">
        <h2 className="font-semibold">Добавить вопрос</h2>
        <input type="hidden" name="quizId" value={quiz.id} />

        <div>
          <label className="label">Текст вопроса</label>
          <textarea name="text" rows={2} className="input" required />
        </div>

        <div>
          <label className="label">Уровень сложности</label>
          <select name="difficulty" className="input" defaultValue="novice">
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>{quizDifficultyLabel(d)}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Вариант 1</label>
            <input name="option1" className="input" required />
          </div>
          <div>
            <label className="label">Вариант 2</label>
            <input name="option2" className="input" required />
          </div>
          <div>
            <label className="label">Вариант 3 (опционально)</label>
            <input name="option3" className="input" />
          </div>
          <div>
            <label className="label">Вариант 4 (опционально)</label>
            <input name="option4" className="input" />
          </div>
        </div>

        <div>
          <label className="label">Номер правильного варианта</label>
          <select name="correctIndex" className="input" defaultValue="0">
            <option value="0">Вариант 1</option>
            <option value="1">Вариант 2</option>
            <option value="2">Вариант 3</option>
            <option value="3">Вариант 4</option>
          </select>
        </div>

        <button className="btn-primary">Добавить вопрос</button>
      </form>

      {/* Список вопросов по уровням сложности */}
      {DIFFICULTIES.map((d) => {
        const items = byDifficulty.get(d) ?? [];
        return (
          <div key={d} className="mt-8">
            <h2 className="text-lg font-bold">{quizDifficultyLabel(d)} <span className="text-sm font-normal text-slate-500">· {items.length}</span></h2>
            <div className="mt-3 space-y-2">
              {items.map((q, i) => (
                <div key={q.id} className="card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium">{i + 1}. {q.text}</div>
                      <ul className="mt-2 space-y-1 text-sm text-slate-400">
                        {q.options.map((opt, oi) => (
                          <li key={oi} className={oi === q.correctIndex ? "text-emerald-400" : ""}>
                            {oi === q.correctIndex ? "✓ " : "— "}{opt}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <ConfirmDeleteButton
                      action={deleteQuizQuestion}
                      id={q.id}
                      confirmText="Удалить этот вопрос?"
                    />
                  </div>
                </div>
              ))}
              {items.length === 0 && <p className="text-sm text-slate-500">Пока нет вопросов.</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
