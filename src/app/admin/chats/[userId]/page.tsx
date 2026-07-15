import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { sendAdminReply } from "@/app/actions/chat";
import { Avatar } from "@/components/Avatar";
import { ChatMessageBody } from "@/components/ChatMessageBody";
import { SubmitButton } from "@/components/SubmitButton";

export default async function AdminChatThreadPage({ params }: { params: { userId: string } }) {
  const student = await prisma.user.findUnique({
    where: { id: params.userId },
    select: { id: true, name: true, avatarUrl: true },
  });
  if (!student) notFound();

  // Отмечаем сообщения ученика прочитанными при открытии треда.
  await prisma.chatMessage.updateMany({
    where: { userId: student.id, fromAdmin: false, read: false },
    data: { read: true },
  });

  const messages = await prisma.chatMessage.findMany({
    where: { userId: student.id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <Link href="/admin/chats" className="text-sm text-slate-400 hover:text-white">← Все чаты</Link>

      <div className="mt-3 flex items-center gap-3">
        <Avatar name={student.name} avatarUrl={student.avatarUrl} />
        <h1 className="text-xl font-bold">{student.name}</h1>
      </div>

      <div className="card mt-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-slate-500">Сообщений пока нет.</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={"flex " + (m.fromAdmin ? "justify-end" : "justify-start")}>
            <div
              className={
                "max-w-[75%] rounded-2xl px-4 py-2 text-sm " +
                (m.fromAdmin
                  ? "bg-brand-gradient text-white"
                  : "border border-white/10 bg-white/5 text-slate-200")
              }
            >
              <ChatMessageBody text={m.text} />
              <p className={"mt-1 text-[10px] " + (m.fromAdmin ? "text-white/70" : "text-slate-500")}>
                {m.createdAt.toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form action={sendAdminReply} className="mt-4 flex gap-2">
        <input type="hidden" name="userId" value={student.id} />
        <input name="text" className="input flex-1" placeholder="Ваш ответ…" required />
        <SubmitButton className="btn-primary px-5" pendingText="Отправка…">Отправить</SubmitButton>
      </form>
    </div>
  );
}
