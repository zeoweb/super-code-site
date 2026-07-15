import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { canAccessCommunityChat } from "@/lib/access";

const POLL_LIMIT = 50;

// Поллинг новых сообщений чата участников (Pro) — ?after=<ISO дата
// последнего уже полученного сообщения>, вернёт всё, что появилось позже.
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }
  if (!canAccessCommunityChat(user.tier, user.role === "admin")) {
    return NextResponse.json({ error: "Доступно только на тарифе Pro" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const after = searchParams.get("after");
  const afterDate = after ? new Date(after) : null;

  const messages = await prisma.communityMessage.findMany({
    where: afterDate && !isNaN(afterDate.getTime()) ? { createdAt: { gt: afterDate } } : undefined,
    orderBy: { createdAt: "asc" },
    take: POLL_LIMIT,
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  });

  return NextResponse.json({
    messages: messages.map((m) => ({
      id: m.id,
      text: m.text,
      mediaUrl: m.mediaUrl,
      mediaType: m.mediaType,
      createdAt: m.createdAt.toISOString(),
      user: m.user,
    })),
  });
}
