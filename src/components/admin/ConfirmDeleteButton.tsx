"use client";

// Кнопка удаления с подтверждением — для необратимых действий.
export function ConfirmDeleteButton({
  action,
  id,
  confirmText = "Удалить безвозвратно?",
  label = "Удалить",
}: {
  action: (formData: FormData) => void;
  id: string;
  confirmText?: string;
  label?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className="btn-ghost px-3 py-2 text-xs text-red-400">{label}</button>
    </form>
  );
}
