"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function updateAppSettings(formData: FormData) {
  await requireAdmin();

  const rate = Number(formData.get("usdToTjsRate"));
  const marginMaxPercent = Number(formData.get("fazercardsMarginMaxPercent"));
  if (!Number.isFinite(rate) || rate <= 0) return;
  if (!Number.isFinite(marginMaxPercent) || marginMaxPercent <= 0 || marginMaxPercent > 100) return;

  await prisma.appSetting.upsert({
    where: { id: 1 },
    create: { id: 1, usdToTjsRate: rate, fazercardsMarginMax: marginMaxPercent / 100 },
    update: { usdToTjsRate: rate, fazercardsMarginMax: marginMaxPercent / 100 },
  });

  revalidatePath("/admin/settings");
}
