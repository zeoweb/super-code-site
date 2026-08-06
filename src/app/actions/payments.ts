"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { saveUploadedFile } from "@/lib/storage";
import { TOPUP_MIN_AMOUNT, TOPUP_MAX_AMOUNT } from "@/lib/topup";

// Пользователь отправляет заявку на пополнение баланса: сумма + способ
// оплаты + скриншот чека. Форма — отдельная страница /topup/pay, не
// клиентский стейт, поэтому результат сообщается через redirect.
export async function submitTopUp(formData: FormData): Promise<void> {
  const amount = Number(formData.get("amount"));
  const paymentMethodId = String(formData.get("paymentMethodId") ?? "").trim() || null;
  const back = `/topup/pay?amount=${amount}${paymentMethodId ? `&method=${paymentMethodId}` : ""}`;

  const user = await getCurrentUser();
  if (!user) redirect(`/login?returnTo=${encodeURIComponent(back)}`);

  if (!Number.isFinite(amount) || amount < TOPUP_MIN_AMOUNT || amount > TOPUP_MAX_AMOUNT) {
    // Не на /topup/pay: у этой страницы свой guard на диапазон суммы,
    // который тут же увёл бы обратно, не дав показать ошибку. Возвращаем
    // на шаг 1, где можно ввести сумму заново.
    redirect(
      `/topup?error=${encodeURIComponent(
        `Сумма пополнения — от ${TOPUP_MIN_AMOUNT} до ${TOPUP_MAX_AMOUNT} сомони`,
      )}`,
    );
  }

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

  await prisma.topUp.create({
    data: {
      userId: user.id,
      amount,
      paymentMethodId,
      receiptScreenshot: receiptUrl,
      status: "pending",
    },
  });

  revalidatePath("/profile");
  revalidatePath("/history");
  redirect("/topup/success");
}
