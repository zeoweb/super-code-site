import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { AiChatLayout } from "@/components/AiChatLayout";

// Super AI — общий чат-помощник по учёбе с сохранением диалогов (как в ChatGPT):
// сайдбар со списком старых чатов + возможность начать новый с нуля.
export default async function AiPage({ searchParams }: { searchParams: { c?: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?returnTo=/ai");

  const conversations = await prisma.aiConversation.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, updatedAt: true },
  });

  let activeId = searchParams.c ?? null;
  if (activeId && !conversations.some((c) => c.id === activeId)) activeId = null;
  if (!activeId && conversations.length > 0) activeId = conversations[0].id;

  const messages = activeId
    ? await prisma.aiChatMessage.findMany({
        where: { conversationId: activeId, userId: user.id },
        orderBy: { createdAt: "asc" },
      })
    : [];

  return (
    <main className="mx-auto max-w-5xl p-4 md:p-6">
      <AiChatLayout
        conversations={conversations.map((c) => ({
          id: c.id,
          title: c.title,
          updatedAt: c.updatedAt.toISOString(),
        }))}
        activeId={activeId}
        initialMessages={messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }))}
      />
    </main>
  );
}
