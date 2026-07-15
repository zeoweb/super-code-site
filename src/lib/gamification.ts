// Простая система XP и уровней. Единый источник правды для лидерборда и профиля.

// XP за один пройденный урок (начисляется один раз за урок).
export const LESSON_XP = 10;

// XP за первое прохождение викторины (начисляется один раз за викторину,
// независимо от набранного результата).
export const QUIZ_XP = 20;

// Явные пороги для первых уровней (XP, с которого начинается уровень N).
// Дальше прогрессия продолжается автоматически — см. levelThreshold().
const BASE_THRESHOLDS = [0, 100, 250, 500, 900, 1500, 2400, 3800, 6000, 9500];

// XP, необходимый для достижения уровня level (level >= 1).
function levelThreshold(level: number): number {
  if (level <= 1) return 0;
  if (level - 1 < BASE_THRESHOLDS.length) return BASE_THRESHOLDS[level - 1];

  // За пределами таблицы каждый следующий уровень требует в ~1.5 раза
  // больше XP, чем предыдущий шаг — прогрессия продолжается бесконечно.
  let xp = BASE_THRESHOLDS[BASE_THRESHOLDS.length - 1];
  let span = xp - BASE_THRESHOLDS[BASE_THRESHOLDS.length - 2];
  for (let l = BASE_THRESHOLDS.length; l < level; l++) {
    span = Math.round(span * 1.5);
    xp += span;
  }
  return xp;
}

export type LevelInfo = {
  level: number;
  currentLevelXp: number; // XP, с которого начался текущий уровень
  nextLevelXp: number; // XP, необходимый для следующего уровня
  xpIntoLevel: number; // сколько XP набрано внутри текущего уровня
  xpForNextLevel: number; // сколько всего XP нужно набрать в рамках уровня
  xpToNext: number; // сколько XP осталось до следующего уровня
};

export function getLevelFromXP(xp: number): LevelInfo {
  let level = 1;
  while (levelThreshold(level + 1) <= xp) level++;

  const currentLevelXp = levelThreshold(level);
  const nextLevelXp = levelThreshold(level + 1);

  return {
    level,
    currentLevelXp,
    nextLevelXp,
    xpIntoLevel: xp - currentLevelXp,
    xpForNextLevel: nextLevelXp - currentLevelXp,
    xpToNext: nextLevelXp - xp,
  };
}
