// Общие константы лимита на сообщения Super AI — используются и в API-роуте
// (проверка лимита), и на странице /ai (показ "осталось N из M").
export const AI_RATE_LIMIT_COUNT = 10;
export const AI_RATE_LIMIT_WINDOW_MS = 2 * 60 * 60 * 1000; // 2 часа
