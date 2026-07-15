import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { askAi } from "@/lib/ai-provider";
import { AI_RATE_LIMIT_COUNT, AI_RATE_LIMIT_WINDOW_MS } from "@/lib/ai-rate-limit";

// Общий чат-помощник "Super AI" (не привязан к конкретному уроку).
const SYSTEM_PROMPT =
  "Ты — Super AI, помощник образовательной платформы Super Code Academy " +
  "(курс по вайб-кодингу — созданию приложений и сайтов через AI-инструменты). " +
  "Помогаешь ученикам с вопросами по программированию, объясняешь концепции " +
  "простыми словами, даёшь идеи для проектов. Отвечай дружелюбно и по делу, " +
  "на языке вопроса пользователя (русский или таджикский).";

const HISTORY_CONTEXT_LIMIT = 20; // сколько последних сообщений диалога передаём модели для контекста

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const text = String(body?.message ?? "").trim();
  const requestedConversationId = body?.conversationId ? String(body.conversationId) : null;
  if (!text) {
    return NextResponse.json({ error: "Пустое сообщение" }, { status: 400 });
  }

  const windowStart = new Date(Date.now() - AI_RATE_LIMIT_WINDOW_MS);
  const recentCount = await prisma.aiChatMessage.count({
    where: { userId: user.id, role: "user", createdAt: { gte: windowStart } },
  });
  if (recentCount >= AI_RATE_LIMIT_COUNT) {
    return NextResponse.json(
      { error: `Лимит ${AI_RATE_LIMIT_COUNT} сообщений исчерпан. Попробуйте через 2 часа.` },
      { status: 429 },
    );
  }

  let conversation = requestedConversationId
    ? await prisma.aiConversation.findFirst({ where: { id: requestedConversationId, userId: user.id } })
    : null;
  if (!conversation) {
    conversation = await prisma.aiConversation.create({
      data: { userId: user.id, title: text.slice(0, 60) },
    });
  }
  const conversationId = conversation.id;

  const userMessage = await prisma.aiChatMessage.create({
    data: { userId: user.id, conversationId, role: "user", content: text },
  });

  const history = await prisma.aiChatMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    take: HISTORY_CONTEXT_LIMIT,
    select: { role: true, content: true },
  });
  history.reverse();

  let reply: string;
  try {
    const result = await askAi(
      SYSTEM_PROMPT,
      history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    );
    reply = result.text;
    console.log(`[AI] provider=${result.provider} route=/api/ai/chat user=${user.id}`);
  } catch (e) {
    console.error("AI request failed (Gemini + Groq fallback):", e instanceof Error ? e.message : e);
    // Не оставляем в истории вопрос без ответа — удаляем то, что только что создали.
    await prisma.aiChatMessage.delete({ where: { id: userMessage.id } });
    return NextResponse.json(
      { error: "Не удалось получить ответ от AI. Попробуйте ещё раз чуть позже." },
      { status: 502 },
    );
  }

  await prisma.aiChatMessage.create({
    data: { userId: user.id, conversationId, role: "assistant", content: reply },
  });

  // Заголовок диалога = первое сообщение пользователя в нём (если ещё не задан
  // вручную); иначе просто отмечаем диалог недавно обновлённым для сортировки.
  const userMessageCount = await prisma.aiChatMessage.count({ where: { conversationId, role: "user" } });
  const shouldSetTitle = conversation.title === "Новый чат" && userMessageCount === 1;
  await prisma.aiConversation.update({
    where: { id: conversationId },
    data: shouldSetTitle ? { title: text.slice(0, 60) } : {},
  });

  return NextResponse.json({ reply, conversationId });
}
