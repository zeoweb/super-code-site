"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import {
  updateProfileName,
  updateProfilePassword,
  type ProfileState,
  type PasswordState,
  type PasswordField,
} from "@/app/actions/profile";
import { SubmitButton } from "@/components/SubmitButton";

// Имя пользователя с кнопкой-карандашом — открывает инлайн-форму:
// редактирование имени (телефон заблокирован) + смена пароля.
export function EditProfileForm({ name, phone }: { name: string; phone: string | null }) {
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [nameState, nameAction] = useFormState<ProfileState, FormData>(updateProfileName, undefined);
  const [passwordState, passwordAction] = useFormState<PasswordState, FormData>(
    updateProfilePassword,
    undefined,
  );
  const [clientPasswordError, setClientPasswordError] = useState<{ field: PasswordField; message: string } | null>(null);
  const [clientNameError, setClientNameError] = useState<string | null>(null);
  const passwordFormRef = useRef<HTMLFormElement>(null);

  // Успешное сохранение имени — короткий тост, затем закрыть форму.
  useEffect(() => {
    if (!nameState?.ok) return;
    setToast("Имя сохранено");
    const t = setTimeout(() => {
      setEditing(false);
      setToast(null);
    }, 1200);
    return () => clearTimeout(t);
  }, [nameState]);

  // Успешная смена пароля — тост, очистка полей, закрыть форму.
  useEffect(() => {
    if (!passwordState?.ok) return;
    setToast("Пароль обновлён");
    passwordFormRef.current?.reset();
    const t = setTimeout(() => {
      setEditing(false);
      setToast(null);
    }, 1200);
    return () => clearTimeout(t);
  }, [passwordState]);

  function handleNameSubmit(e: React.FormEvent<HTMLFormElement>) {
    const input = e.currentTarget.elements.namedItem("name") as HTMLInputElement;
    if (!input.value.trim()) {
      e.preventDefault();
      setClientNameError("Имя не может быть пустым");
      return;
    }
    setClientNameError(null);
  }

  function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget;
    const newPassword = (form.elements.namedItem("newPassword") as HTMLInputElement).value;
    const confirmPassword = (form.elements.namedItem("confirmPassword") as HTMLInputElement).value;

    if (newPassword.length < 8) {
      e.preventDefault();
      setClientPasswordError({ field: "newPassword", message: "Минимум 8 символов" });
      return;
    }
    if (newPassword !== confirmPassword) {
      e.preventDefault();
      setClientPasswordError({ field: "confirmPassword", message: "Пароли не совпадают" });
      return;
    }
    setClientPasswordError(null);
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold sm:text-2xl">{name}</h1>
        <button
          onClick={() => setEditing(true)}
          aria-label="Редактировать профиль"
          className="rounded-full p-1.5 text-slate-400 transition-colors duration-300 hover:bg-white/10 hover:text-brand-light"
        >
          ✏️
        </button>
      </div>
    );
  }

  const nameError = clientNameError ?? nameState?.error;
  const currentPasswordError =
    clientPasswordError?.field === "currentPassword"
      ? clientPasswordError.message
      : passwordState?.field === "currentPassword"
        ? passwordState.error
        : undefined;
  const newPasswordError =
    clientPasswordError?.field === "newPassword"
      ? clientPasswordError.message
      : passwordState?.field === "newPassword"
        ? passwordState.error
        : undefined;
  const confirmPasswordError =
    clientPasswordError?.field === "confirmPassword"
      ? clientPasswordError.message
      : passwordState?.field === "confirmPassword"
        ? passwordState.error
        : undefined;
  const genericPasswordError = !passwordState?.field ? passwordState?.error : undefined;

  return (
    <div className="card w-full max-w-md space-y-5">
      {toast && (
        <p className="rounded-lg border border-brand/40 bg-brand/10 px-3 py-2 text-sm text-brand-light">
          ✓ {toast}
        </p>
      )}

      {/* Имя + телефон (заблокирован) */}
      <form action={nameAction} onSubmit={handleNameSubmit} className="space-y-3">
        <div>
          <label className="label" htmlFor="edit-name">Имя</label>
          <input id="edit-name" name="name" defaultValue={name} className="input" />
          {nameError && <p className="mt-1 text-sm text-red-400">{nameError}</p>}
        </div>

        <div>
          <label className="label" htmlFor="edit-phone">Телефон</label>
          <div className="relative">
            <input
              id="edit-phone"
              defaultValue={phone ?? ""}
              disabled
              className="input cursor-not-allowed pr-10 opacity-60"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
              🔒
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Телефон нельзя изменить здесь — он используется для входа.
          </p>
        </div>

        <SubmitButton className="btn-primary px-4 py-2 text-sm" pendingText="Сохраняем…">
          Сохранить имя
        </SubmitButton>
      </form>

      <div className="border-t border-white/10" />

      {/* Смена пароля */}
      <div>
        <div className="mb-3 flex items-center gap-2 font-semibold">
          <span aria-hidden="true">🔑</span> Сменить пароль
        </div>
        <form ref={passwordFormRef} action={passwordAction} onSubmit={handlePasswordSubmit} className="space-y-3">
          <div>
            <label className="label" htmlFor="currentPassword">Текущий пароль</label>
            <input id="currentPassword" name="currentPassword" type="password" className="input" required />
            {currentPasswordError && <p className="mt-1 text-sm text-red-400">{currentPasswordError}</p>}
          </div>
          <div>
            <label className="label" htmlFor="newPassword">Новый пароль</label>
            <input id="newPassword" name="newPassword" type="password" className="input" required />
            {newPasswordError && <p className="mt-1 text-sm text-red-400">{newPasswordError}</p>}
          </div>
          <div>
            <label className="label" htmlFor="confirmPassword">Повторите пароль</label>
            <input id="confirmPassword" name="confirmPassword" type="password" className="input" required />
            {confirmPasswordError && <p className="mt-1 text-sm text-red-400">{confirmPasswordError}</p>}
          </div>
          {genericPasswordError && <p className="text-sm text-red-400">{genericPasswordError}</p>}

          <div className="flex flex-wrap gap-2">
            <SubmitButton className="btn-primary px-4 py-2 text-sm" pendingText="Сохраняем…">
              Сохранить пароль
            </SubmitButton>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="btn-ghost px-4 py-2 text-sm"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
