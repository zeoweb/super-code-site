// Лимиты одного пополнения баланса — используются и на фронте (форма), и
// в submitTopUp на бэке, чтобы границы нельзя было обойти прямым запросом.
export const TOPUP_MIN_AMOUNT = 10;
export const TOPUP_MAX_AMOUNT = 2000;
