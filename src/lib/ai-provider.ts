import "server-only";
import { askGemini, GeminiApiError, type ChatTurn } from "@/lib/gemini";
import { askGroq } from "@/lib/groq";

export type AiProvider = "gemini" | "groq";
export type AiResult = { text: string; provider: AiProvider };

/**
 * Единая точка входа для Super AI: пробует Gemini (с его собственными
 * повторами на 503), и если Gemini в итоге отдаёт 503 (перегружен) или 429
 * (лимит), автоматически переключается на Groq (llama-3.3-70b-versatile) —
 * пользователь просто получает ответ, не видя ошибку. Любые другие ошибки
 * Gemini (неверный ключ, 404 модели и т.п.) на Groq не переключаем — их
 * повтор на другом провайдере не имеет смысла, пробрасываем как есть.
 */
export async function askAi(systemPrompt: string, history: ChatTurn[]): Promise<AiResult> {
  try {
    const text = await askGemini(systemPrompt, history);
    return { text, provider: "gemini" };
  } catch (e) {
    const isFallbackEligible = e instanceof GeminiApiError && (e.status === 503 || e.status === 429);
    if (!isFallbackEligible) throw e;

    console.warn(`[AI fallback] Gemini вернул ${(e as GeminiApiError).status}, переключаемся на Groq`);
    try {
      const text = await askGroq(systemPrompt, history);
      return { text, provider: "groq" };
    } catch (groqError) {
      console.error(
        "[AI fallback] Groq тоже не сработал:",
        groqError instanceof Error ? groqError.message : groqError,
      );
      throw e; // показываем пользователю исходную ошибку Gemini, раз оба провайдера легли
    }
  }
}
