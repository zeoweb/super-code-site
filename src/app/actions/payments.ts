"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { saveUploadedFile } from "@/lib/storage";
import { TIER_PRICES } from "@/lib/pricing";
import type { Tier } from "@prisma/client";

// Ученик отправляет заявку на оплату: тариф + способ оплаты + скриншот чека.
// Форма — отдельная страница /billing/checkout/pay, не клиентский стейт,
// поэтому результат сообщается через redirect (успех/ошибка — разными URL).
export async function submitPayment(formData: FormData): Promise<void> {
  const tier = String(formData.get("tier")) as Tier;
  const paymentMethodId = String(formData.get("paymentMethodId") ?? "").trim() || null;
  const back = `/billing/checkout/pay?tier=${tier}${paymentMethodId ? `&method=${paymentMethodId}` : ""}`;

  const user = await getCurrentUser();
  if (!user) redirect(`/login?returnTo=${encodeURIComponent(back)}`);

  if (tier !== "plus" && tier !== "pro") redirect("/billing/checkout");

  const file = formData.get("receipt");
  if (!(file instanceof File) || file.size === 0) {
    redirect(`${back}&error=${encodeURIComponent("Прикрепите скриншот чека")}`);
  }

  let receiptUrl: string;
  try {
    receiptUrl = await saveUploadedFile(file);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ошибка загрузки файла";
    redirect(`${back}&error=${encodeURIComponent(message)}`);
  }

  await prisma.payment.create({
    data: {
      userId: user.id,
      tier,
      amount: TIER_PRICES[tier],
      paymentMethodId,
      receiptScreenshot: receiptUrl,
      status: "pending",
    },
  });

  revalidatePath("/billing");
  revalidatePath("/profile");
  redirect("/billing/checkout/success");
}
