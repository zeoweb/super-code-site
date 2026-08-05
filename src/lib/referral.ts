// Процент реферального бонуса — начисляется рефереру с каждой покупки
// приглашённого им пользователя (см. actions при одобрении Order/TopUp).
export const REFERRAL_PERCENT = 1;

// Cookie, в которую middleware кладёт ?ref= с /?ref=CODE — так код не
// теряется, если пользователь регистрируется не сразу, а погуляв по сайту.
export const REF_COOKIE = "sc_ref";

// Алфавит без 0/O и 1/I/L — код сложнее перепутать при ручном вводе/озвучке.
const REFERRAL_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const REFERRAL_CODE_LENGTH = 7;

export function generateReferralCode(): string {
  let code = "";
  for (let i = 0; i < REFERRAL_CODE_LENGTH; i++) {
    code += REFERRAL_CODE_ALPHABET[Math.floor(Math.random() * REFERRAL_CODE_ALPHABET.length)];
  }
  return code;
}
