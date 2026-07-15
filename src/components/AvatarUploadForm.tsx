"use client";

import { useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { updateAvatar, type ProfileState } from "@/app/actions/profile";
import { Avatar } from "@/components/Avatar";

// Клик по аватарке → выбор файла → отправка сразу, без отдельной кнопки "Сохранить".
export function AvatarUploadForm({
  name,
  avatarUrl,
  size = "h-16 w-16",
}: {
  name: string;
  avatarUrl: string | null;
  size?: string;
}) {
  const [state, action] = useFormState<ProfileState, FormData>(updateAvatar, undefined);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    formRef.current?.requestSubmit();
  }

  return (
    <form ref={formRef} action={action} className="shrink-0">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative block rounded-full"
        aria-label="Изменить аватарку"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={name} className={`${size} rounded-full object-cover`} />
        ) : (
          <Avatar name={name} avatarUrl={avatarUrl} size={size} textSize="text-2xl" />
        )}
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-[11px] font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          📷 Изменить
        </span>
        <PendingOverlay />
      </button>
      <input
        ref={inputRef}
        type="file"
        name="avatar"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={onFileChange}
      />
      {state?.error && <p className="mt-1 max-w-[8rem] text-center text-xs text-red-400">{state.error}</p>}
    </form>
  );
}

function PendingOverlay() {
  const { pending } = useFormStatus();
  if (!pending) return null;
  return (
    <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 text-[11px] text-white">
      Загрузка…
    </span>
  );
}
