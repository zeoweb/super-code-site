"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function createPromoCode(formData: FormData) {
  await requireAdmin();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const discountPercent = Number(formData.get("discountPercent"));
  if (!code || !Number.isFinite(discountPercent) || discountPercent <= 0 || discountPercent > 100) return;

  const maxUsesRaw = String(formData.get("maxUses") ?? "").trim();
  const validUntilRaw = String(formData.get("validUntil") ?? "").trim();

  await prisma.promoCode.create({
    data: {
      code,
      discountPercent,
      maxUses: maxUsesRaw ? Number(maxUsesRaw) : null,
      validUntil: validUntilRaw ? new Date(validUntilRaw) : null,
    },
  });
  revalidatePath("/admin/promocodes");
}

export async function togglePromoCode(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const promo = await prisma.promoCode.findUnique({ where: { id } });
  if (!promo) return;
  await prisma.promoCode.update({ where: { id }, data: { isActive: !promo.isActive } });
  revalidatePath("/admin/promocodes");
}

export async function deletePromoCode(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.promoCode.delete({ where: { id } });
  revalidatePath("/admin/promocodes");
}
