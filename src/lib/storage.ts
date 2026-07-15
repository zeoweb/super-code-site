import "server-only";
import crypto from "crypto";

/**
 * Сохранение загруженного файла (скриншот чека, аватарка и т.п.) в Bunny
 * Storage — файловая система на Vercel только для чтения, локальный
 * /public/uploads там не работает. Требует переменные BUNNY_STORAGE_* в .env
 * (см. README/сообщение в чате о том, как создать Storage Zone в bunny.net).
 */
const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE_NAME ?? "";
const STORAGE_HOSTNAME = process.env.BUNNY_STORAGE_HOSTNAME ?? "storage.bunnycdn.com";
const STORAGE_API_KEY = process.env.BUNNY_STORAGE_API_KEY ?? "";
const STORAGE_CDN_HOSTNAME = process.env.BUNNY_STORAGE_CDN_HOSTNAME ?? "";

const ALLOWED = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
const MAX_BYTES = 8 * 1024 * 1024; // 8 МБ

async function writeUpload(file: File, subdir: string): Promise<string> {
  if (!STORAGE_ZONE || !STORAGE_API_KEY || !STORAGE_CDN_HOSTNAME) {
    throw new Error("Bunny Storage не настроен — заполните BUNNY_STORAGE_* в .env");
  }

  const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const name = `${subdir}/${crypto.randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const res = await fetch(`https://${STORAGE_HOSTNAME}/${STORAGE_ZONE}/${name}`, {
    method: "PUT",
    headers: {
      AccessKey: STORAGE_API_KEY,
      "Content-Type": "application/octet-stream",
    },
    body: bytes,
  });
  if (!res.ok) {
    throw new Error(`Не удалось загрузить файл в Bunny Storage (HTTP ${res.status})`);
  }

  // Публичный URL через Pull Zone (CDN), привязанную к этой Storage Zone.
  return `https://${STORAGE_CDN_HOSTNAME}/${name}`;
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

const ALLOWED_VIDEO = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 МБ

export async function saveUploadedVideo(file: File): Promise<string> {
  if (!ALLOWED_VIDEO.includes(file.type)) {
    throw new Error("Допустимы только видео (MP4/WEBM/MOV)");
  }
  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error("Видео слишком большое (максимум 50 МБ)");
  }
  return writeUpload(file, "reviews");
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

// Вложение в чат участников (Pro) — фото или видео, определяем тип сами.
export async function saveCommunityMedia(file: File): Promise<{ url: string; type: "image" | "video" }> {
  if (ALLOWED_IMAGE.includes(file.type)) {
    if (file.size > MAX_BYTES) {
      throw new Error("Изображение слишком большое (максимум 8 МБ)");
    }
    return { url: await writeUpload(file, "community"), type: "image" };
  }
  if (ALLOWED_VIDEO.includes(file.type)) {
    if (file.size > MAX_VIDEO_BYTES) {
      throw new Error("Видео слишком большое (максимум 50 МБ)");
    }
    return { url: await writeUpload(file, "community"), type: "video" };
  }
  throw new Error("Допустимы только изображения (PNG/JPG/WEBP) или видео (MP4/WEBM/MOV)");
}
