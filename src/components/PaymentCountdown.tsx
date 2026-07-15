"use client";

import { useEffect, useState } from "react";

const DURATION_MS = 60 * 60 * 1000; // 1 час

// Таймер чисто маркетинговый (создаёт ощущение срочности) — ни на что не
// влияет и не блокирует оплату. Обновляется при каждом заходе на эту
// страницу (реквизиты появляются только когда ученик выбрал тариф и способ
// оплаты, так что каждый визит сюда и есть "хочет купить курс").
export function PaymentCountdown() {
  const [remainingMs, setRemainingMs] = useState(DURATION_MS);

  useEffect(() => {
    const deadline = Date.now() + DURATION_MS;
    const tick = () => setRemainingMs(Math.max(0, deadline - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const totalSeconds = Math.floor(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return (
    <span className="badge shrink-0 border-brand/40 bg-ink-900/60 font-semibold tabular-nums text-white">
      ⏱ {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </span>
  );
}
