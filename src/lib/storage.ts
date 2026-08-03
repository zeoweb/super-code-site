import "server-only";
import { put } from "@vercel/blob";
import crypto from "crypto";

/**
 * Сохранение загруженного файла (скриншот чека, аватарка, лого способа
 * оплаты, картинка игры) в Vercel Blob. Файловая система на Vercel только
 * для чтения, локальный /public/uploads там не работает.
 */
const ALLOWED = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
const MAX_BYTES = 8 * 1024 * 1024; // 8 МБ

async function writeUpload(file: File, subdir: string): Promise<string> {
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const name = `${subdir}/${crypto.randomUUID()}.${ext}`;

  const blob = await put(name, file, {
    access: "public",
    contentType: file.type,
  });

  return blob.url;
}

export async function saveUploadedFile(file: File): Promise<string> {
  if (!ALLOWED.includes(file.type)) {
    throw new Error("Допустимы только изображения (PNG/JPG/WEBP) или PDF");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Файл слишком большой (максимум 8 МБ)");
  }
  return writeUpload(file, "receipts");
}

const ALLOWED_IMAGE = ["image/png", "image/jpeg", "image/webp"];

export async function saveUploadedLogo(file: File): Promise<string> {
  if (!ALLOWED_IMAGE.includes(file.type)) {
    throw new Error("Допустимы только изображения (PNG/JPG/WEBP)");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Файл слишком большой (максимум 8 МБ)");
  }
  return writeUpload(file, "logos");
}

export async function saveUploadedAvatar(file: File): Promise<string> {
  if (!ALLOWED_IMAGE.includes(file.type)) {
    throw new Error("Допустимы только изображения (PNG/JPG/WEBP)");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Файл слишком большой (максимум 8 МБ)");
  }
  return writeUpload(file, "avatars");
}
