"use client";

import { broadcastNotification } from "@/app/actions/admin";
import { SubmitButton } from "@/components/SubmitButton";

const DEFAULT_MESSAGE =
  "Из-за большого количества пользователей и заявок сейчас возможны задержки с обработкой пополнений. Пожалуйста, подождите — все заявки обрабатываются.\n\n" +
  "Не отправляйте фейковые чеки — они не засчитываются. Не отправляйте один и тот же чек повторно — засчитывается только первая оплата, повторные попытки блокируются.\n\n" +
  "Если вопрос срочный — напишите куратору в разделе «Поддержка» (кнопка чата на сайте), ответим как можно скорее.";

// Рассылка необратима (создаёт запись каждому пользователю), поэтому —
// подтверждение, как у ConfirmDeleteButton.
export function BroadcastForm({ usersCount }: { usersCount: number }) {
  return (
    <form
      action={broadcastNotification}
      className="card mt-6 space-y-3"
      onSubmit={(e) => {
        if (!confirm(`Отправить это уведомление всем пользователям (${usersCount})?`)) {
          e.preventDefault();
        }
      }}
    >
      <div>
        <label className="label">Текст уведомления</label>
        <textarea
          name="message"
          rows={8}
          defaultValue={DEFAULT_MESSAGE}
          className="input resize-none"
          required
        />
      </div>
      <p className="text-xs text-slate-500">
        Получат все зарегистрированные пользователи: <strong>{usersCount}</strong>. Появится у каждого
        в колокольчике-уведомлениях (вкладка «Система»).
      </p>
      <SubmitButton className="btn-primary" pendingText="Отправляем…">
        Отправить всем
      </SubmitButton>
    </form>
  );
}
