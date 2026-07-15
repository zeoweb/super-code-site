import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { canAccessCommunityChat } from "@/lib/access";
import { CommunityChat } from "@/components/CommunityChat";

const MESSAGE_LIMIT = 100;

// Чат участников — общий канал для тарифа Pro: обсуждения + фото/видео.
export default async function CommunityPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?returnTo=/community");

  const allowed = canAccessCommunityChat(user.tier, user.role === "admin");

  if (!allowed) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <div className="card mt-10 text-center">
          <div className="text-5xl">🔒</div>
          <h1 className="mt-3 text-xl font-bold">Чат участников — только на тарифе Pro</h1>
          <p className="mt-2 text-slate-400">
            Общайтесь с другими учениками Pro, спрашивайте про программирование или просто общайтесь — делитесь фото и видео своих проектов.
          </p>
          <Link href="/billing" className="btn-primary mt-4 inline-flex">Открыть тариф Pro</Link>
        </div>
      </main>
    );
  }

  const messages = await prisma.communityMessage.findMany({
    orderBy: { createdAt: "asc" },
    take: MESSAGE_LIMIT,
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  });

  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-lg shadow-glow">
          👥
        </span>
        <div>
          <h1 className="text-xl font-bold">Чат участников</h1>
          <p className="text-sm text-slate-400">Только Pro — обсуждайте всё, делитесь фото и видео</p>
        </div>
      </div>

      <div className="mt-6">
        <CommunityChat
          currentUserId={user.id}
          initialMessages={messages.map((m) => ({
            id: m.id,
            text: m.text,
            mediaUrl: m.mediaUrl,
            mediaType: m.mediaType,
            createdAt: m.createdAt.toISOString(),
            user: m.user,
          }))}
        />
      </div>
    </main>
  );
}
