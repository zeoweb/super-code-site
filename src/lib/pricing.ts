// Цены тарифов (в TJS/сомони). Вынесено в отдельный модуль, потому что файлы
// с "use server" могут экспортировать только async-функции.
export const TIER_PRICES: Record<"plus" | "pro", number> = {
  plus: 249,
  pro: 389,
};

// "Старая" цена для зачёркнутого показа скидки на витрине — к сумме оплаты
// не относится, используется только в маркетинговых карточках тарифов.
export const TIER_OLD_PRICES: Record<"plus" | "pro", number> = {
  plus: 399,
  pro: 499,
};

export const TIER_TITLES: Record<"plus" | "pro", string> = {
  plus: "Super Code Plus+",
  pro: "Super Code Pro",
};
