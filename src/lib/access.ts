import type { Tier, RequiredTier, QuizDifficulty } from "@prisma/client";

// Порядок «силы» тарифов. Чем больше число — тем выше уровень доступа.
const TIER_RANK: Record<Tier, number> = { none: 0, plus: 1, pro: 2 };
const REQUIRED_RANK: Record<RequiredTier, number> = { free: 0, plus: 1, pro: 2 };

/**
 * Может ли пользователь с данным тарифом открыть урок.
 * Правило: бесплатные уроки (isFree или required=free) доступны всем;
 * иначе тариф пользователя должен быть НЕ НИЖЕ требуемого.
 */
export function canAccessLesson(params: {
  userTier: Tier;
  requiredTier: RequiredTier;
  isFree: boolean;
  isAdmin?: boolean;
}): boolean {
  const { userTier, requiredTier, isFree, isAdmin } = params;
  if (isAdmin) return true;
  if (isFree || requiredTier === "free") return true;
  return TIER_RANK[userTier] >= REQUIRED_RANK[requiredTier];
}

export function tierLabel(tier: Tier): string {
  return { none: "Без подписки", plus: "Plus+", pro: "Pro" }[tier];
}

export function requiredTierLabel(t: RequiredTier): string {
  return { free: "Бесплатно", plus: "Plus+", pro: "Pro" }[t];
}

/**
 * Может ли пользователь проходить викторину данного уровня сложности.
 * Правило: novice — бесплатно всем; medium/pro — любой платный тариф
 * (Plus+ или Pro) открывает оба уровня сразу.
 */
export function canAccessQuizDifficulty(userTier: Tier, difficulty: QuizDifficulty): boolean {
  if (difficulty === "novice") return true;
  return userTier !== "none";
}

export function quizDifficultyLabel(d: QuizDifficulty): string {
  return { novice: "Новичок", medium: "Средний", pro: "Про" }[d];
}

/**
 * Доступ к чату участников — только тариф Pro (Plus+ и без подписки не пускаем).
 */
export function canAccessCommunityChat(userTier: Tier, isAdmin?: boolean): boolean {
  return isAdmin || userTier === "pro";
}
