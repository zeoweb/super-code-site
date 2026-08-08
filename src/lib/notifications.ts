import "server-only";
import { prisma } from "@/lib/db";

// Самое свежее непоказанное всплывающее уведомление пользователя (если
// есть) — см. components/PopupNotificationModal.tsx.
export async function getPendingPopupNotification(userId: string) {
  return prisma.notification.findFirst({
    where: { userId, showAsPopup: true, popupDismissedAt: null },
    orderBy: { createdAt: "desc" },
  });
}
