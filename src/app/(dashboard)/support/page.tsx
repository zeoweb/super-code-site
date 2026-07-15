import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { SupportMessageForm } from "@/components/SupportMessageForm";
import { ChatMessageBody } from "@/components/ChatMessageBody";

// Чат ученика с поддержкой (админом). Простой линейный тред, без реалтайма —
// обновляется при отправке сообщения / открытии страницы.
export default async function SupportPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?returnTo=/support");

  // Отмечаем ответы админа прочитанными при открытии.
  await prisma.chatMessage.updateMany({
    where: { userId: user.id, fromAdmin: true, read: false },
    data: { read: true },
  });

  const messages = await prisma.chatMessage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">Поддержка</h1>
      <p className="mt-1 text-sm text-slate-400">
        Напишите куратору — ответим здесь же.
      </p>

      <div className="card mt-6 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-slate-500">
            Сообщений пока нет — напишите первым, и куратор ответит.
          </p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={"flex " + (m.fromAdmin ? "justify-start" : "justify-end")}>
            <div
              className={
                "max-w-[80%] rounded-2xl px-4 py-2 text-sm " +
                (m.fromAdmin
                  ? "border border-white/10 bg-white/5 text-slate-200"
                  : "bg-brand-gradient text-white")
              }
            >
              <ChatMessageBody text={m.text} />
              <p className={"mt-1 text-[10px] " + (m.fromAdmin ? "text-slate-500" : "text-white/70")}>
                {m.createdAt.toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
      </div>

      <SupportMessageForm />
    </main>
  );
}
