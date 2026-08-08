"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// Отмечает все уведомления пользователя прочитанными (вызывается при открытии колокольчика).
export async function markNotificationsRead() {
  const user = await getCurrentUser();
  if (!user) return;

  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });
}

// Закрытие всплывающего уведомления — больше не показывается этому
// пользователю. updateMany с userId в where — чтобы нельзя было закрыть
// чужое уведомление, подставив произвольный id.
export async function dismissPopupNotification(id: string) {
  const user = await getCurrentUser();
  if (!user) return;

  await prisma.notification.updateMany({
    where: { id, userId: user.id },
    data: { popupDismissedAt: new Date() },
  });
}
