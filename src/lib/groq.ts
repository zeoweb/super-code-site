import "server-only";

// Groq — fallback-провайдер для Super AI, когда Gemini недоступен (503/429).
// OpenAI-совместимый эндпоинт: тот же формат messages, что и Chat Completions API.
const MODEL = "llama-3.3-70b-versatile";

export type ChatTurn = { role: "user" | "assistant"; content: string };

export async function askGroq(systemPrompt: string, history: ChatTurn[]): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY не задан в .env");

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.map((turn) => ({ role: turn.role, content: turn.content })),
  ];

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: MODEL, messages }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`Groq API вернул ошибку ${res.status}: ${errBody.slice(0, 300)}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text) {
    throw new Error("Groq API вернул пустой ответ");
  }
  return text;
}
