import "server-only";
import crypto from "crypto";

/**
 * Bunny Stream — генерация защищённой (токенизированной) ссылки на embed-плеер.
 *
 * Как это работает:
 *  - В панели Bunny у Video Library включаем «Token Authentication».
 *  - Для каждого показа урока сервер генерирует подпись с коротким сроком
 *    жизни (TTL). Скопировать ссылку в другую вкладку после истечения TTL
 *    не выйдет — токен станет недействительным.
 *
 * Подпись для embed-iframe формируется по схеме Bunny:
 *    token = SHA256_hex(tokenKey + videoId + expires)
 * и передаётся в URL как ?token=...&expires=...
 *
 * Док-ссылка: https://docs.bunny.net/docs/stream-embed-token-authentication
 */

type SignedEmbed = {
  url: string;
  expires: number;
};

const DEFAULT_TTL_SECONDS = 60 * 15; // 15 минут

export function getBunnyConfig() {
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
  const tokenKey = process.env.BUNNY_STREAM_TOKEN_KEY;
  const embedHost = process.env.BUNNY_STREAM_EMBED_HOSTNAME ?? "iframe.mediadelivery.net";
  const apiKey = process.env.BUNNY_STREAM_API_KEY;
  return { libraryId, tokenKey, embedHost, apiKey };
}

/**
 * Подписанная ссылка на iframe-плеер конкретного видео.
 * Возвращает null, если Bunny не сконфигурирован или у урока нет видео.
 */
export function signBunnyEmbed(
  bunnyVideoId: string | null,
  ttlSeconds: number = DEFAULT_TTL_SECONDS,
): SignedEmbed | null {
  const { libraryId, tokenKey, embedHost } = getBunnyConfig();
  if (!bunnyVideoId || !libraryId || !tokenKey) return null;

  const expires = Math.floor(Date.now() / 1000) + ttlSeconds;

  // Схема подписи Bunny для embed token authentication.
  const hashInput = `${tokenKey}${bunnyVideoId}${expires}`;
  const token = crypto.createHash("sha256").update(hashInput).digest("hex");

  const url = `https://${embedHost}/embed/${libraryId}/${bunnyVideoId}?token=${token}&expires=${expires}&autoplay=false&preload=false`;

  return { url, expires };
}

/**
 * Создание записи видео в Bunny Stream (шаг 1 загрузки из админки).
 * Возвращает guid созданного видео, который сохраняем в lessons.bunny_video_id.
 * Сам файл затем заливается PUT-запросом на /library/{id}/videos/{guid}.
 */
export async function createBunnyVideo(title: string): Promise<string | null> {
  const { libraryId, apiKey } = getBunnyConfig();
  if (!libraryId || !apiKey) return null;

  const res = await fetch(
    `https://video.bunnycdn.com/library/${libraryId}/videos`,
    {
      method: "POST",
      headers: {
        AccessKey: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    },
  );
  if (!res.ok) return null;
  const data = (await res.json()) as { guid?: string };
  return data.guid ?? null;
}
