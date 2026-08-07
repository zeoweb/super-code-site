import "server-only";
import { prisma } from "@/lib/db";

// Единственная строка настроек (id фиксирован = 1) — создаётся с
// дефолтами при первом обращении, если её ещё нет.
export async function getAppSettings() {
  return prisma.appSetting.upsert({
    where: { id: 1 },
    create: { id: 1 },
    update: {},
  });
}
