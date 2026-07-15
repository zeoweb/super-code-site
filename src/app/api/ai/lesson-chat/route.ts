import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { askAi } from "@/lib/ai-provider";
import { AI_RATE_LIMIT_COUNT, AI_RATE_LIMIT_WINDOW_MS } from "@/lib/ai-rate-limit";

// "AI по уроку" — контекстный помощник на странице конкретного урока.
// Использует тот же Gemini-лимит, что и Super AI (общий на пользователя),
// но историю берёт только в рамках текущего урока.
const HISTORY_CONTEXT_LIMIT = 20;

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const text = String(body?.message ?? "").trim();
  const lessonId = String(body?.lessonId ?? "");
  if (!text || !lessonId) {
    return NextResponse.json({ error: "Пустое сообщение" }, { status: 400 });
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { title: true, description: true },
  });
  if (!lesson) {
    return NextResponse.json({ error: "Урок не найден" }, { status: 404 });
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

  const systemPrompt =
    "Ты — AI-помощник по конкретному уроку курса Super Code Academy (вайб-кодинг). " +
    `Текущий урок: «${lesson.title}».` +
    (lesson.description ? ` Описание урока: ${lesson.description}` : "") +
    " Отвечай по существу вопроса ученика, опираясь на материал этого урока. " +
    "Объясняй просто и по делу, на языке вопроса пользователя (русский или таджикский).";

  const userMessage = await prisma.aiChatMessage.create({
    data: { userId: user.id, lessonId, role: "user", content: text },
  });

  const history = await prisma.aiChatMessage.findMany({
    where: { lessonId, userId: user.id },
    orderBy: { createdAt: "desc" },
    take: HISTORY_CONTEXT_LIMIT,
    select: { role: true, content: true },
  });
  history.reverse();

  let reply: string;
  try {
    const result = await askAi(
      systemPrompt,
      history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    );
    reply = result.text;
    console.log(`[AI] provider=${result.provider} route=/api/ai/lesson-chat user=${user.id} lesson=${lessonId}`);
  } catch (e) {
    console.error("AI request failed (Gemini + Groq fallback):", e instanceof Error ? e.message : e);
    await prisma.aiChatMessage.delete({ where: { id: userMessage.id } });
    return NextResponse.json(
      { error: "Не удалось получить ответ от AI. Попробуйте ещё раз чуть позже." },
      { status: 502 },
    );
  }

  await prisma.aiChatMessage.create({
    data: { userId: user.id, lessonId, role: "assistant", content: reply },
  });

  return NextResponse.json({ reply });
}
