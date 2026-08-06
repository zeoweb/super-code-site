import { prisma } from "@/lib/db";
import { BroadcastForm } from "@/components/admin/BroadcastForm";

export default async function AdminNotifyPage() {
  const usersCount = await prisma.user.count();

  return (
    <div>
      <h1 className="text-2xl font-bold">Рассылка уведомлений</h1>
      <p className="mt-1 text-sm text-slate-500">
        Отправляет одно и то же уведомление всем пользователям через колокольчик — тот же механизм,
        что уже используется для системных уведомлений («Заказ выполнен», «Пополнение одобрено» и т.п.),
        без отдельной системы рассылки.
      </p>

      <BroadcastForm usersCount={usersCount} />
    </div>
  );
}
