import "server-only";

// Тонкая обёртка над Gemini REST API (без SDK — та же логика, что у остальных
// внешних интеграций в проекте, см. lib/bunny.ts). Универсальная: принимает
// системный промпт + историю сообщений, поэтому пригодна и для общего Super AI,
// и в будущем для AI-помощника, привязанного к конкретному уроку.

// "gemini-2.5-flash" по конкретной версии недоступен новым API-ключам
// (Google отдаёт 404 "no longer available to new users"), поэтому используем
// алиас "-latest" — Google сам держит его указывающим на актуальную flash-модель.
const MODEL = "gemini-flash-latest";

export type ChatTurn = { role: "user" | "assistant"; content: string };

// Отдельный класс ошибки с HTTP-статусом — по нему вызывающий код (ai-provider.ts)
// решает, стоит ли переключаться на Groq (только 503/429), а не на любую ошибку.
export class GeminiApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "GeminiApiError";
    this.status = status;
  }
}

// Google периодически отдаёт 503 "model is currently experiencing high demand"
// на flash-модели — это временная перегрузка на их стороне, а не наша ошибка.
// Повторяем запрос пару раз с задержкой, прежде чем сдаться.
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1200;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function askGemini(systemPrompt: string, history: ChatTurn[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY не задан в .env");

  const contents = history.map((turn) => ({
    role: turn.role === "assistant" ? "model" : "user",
    parts: [{ text: turn.content }],
  }));

  let lastStatus = 0;
  let lastMessage = "Gemini API: неизвестная ошибка";

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
        }),
      },
    );

    if (res.ok) {
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (typeof text === "string" && text) return text;
      throw new Error("Gemini API вернул пустой ответ");
    }

    const errBody = await res.text().catch(() => "");
    lastStatus = res.status;
    lastMessage = `Gemini API вернул ошибку ${res.status}: ${errBody.slice(0, 300)}`;

    // Повторяем только временную перегрузку модели — остальные ошибки
    // (неверный ключ, 404 модели и т.п.) повтором не лечатся.
    if (res.status !== 503 || attempt === MAX_RETRIES) break;
    await sleep(RETRY_DELAY_MS * (attempt + 1));
  }

  throw new GeminiApiError(lastStatus, lastMessage);
}
