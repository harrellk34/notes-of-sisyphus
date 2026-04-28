import type {
  CoreStatName,
  DailyActivityType,
  DailyLog,
  FatigueEstimate,
  RecoveryStatus,
  StatDefinition,
  StatProgress,
  StatXpEstimate,
  XPModifier,
} from "./types";

const BASE_XP_PER_LEVEL = 100;
const XP_LEVEL_EXPONENT = 1.35;
const WILLPOWER_XP_PER_ACTION = 2;

export const statDefinitions: StatDefinition[] = [
  {
    key: "strength",
    name: "Strength",
    focus: "Lifting, load, and raw power",
    accent: "from-red-500 to-orange-300",
  },
  {
    key: "agility",
    name: "Agility",
    focus: "Mobility, stretching, and speed",
    accent: "from-emerald-400 to-teal-200",
  },
  {
    key: "stamina",
    name: "Stamina",
    focus: "Cardio, endurance, and work capacity",
    accent: "from-sky-400 to-cyan-200",
  },
  {
    key: "vitality",
    name: "Vitality",
    focus: "Recovery, nourishment, and durable energy",
    accent: "from-lime-300 to-green-200",
  },
  {
    key: "willpower",
    name: "Willpower",
    focus: "Discipline, consistency, and follow-through",
    accent: "from-violet-400 to-fuchsia-200",
  },
  {
    key: "insight",
    name: "Insight",
    focus: "Journaling, reflection, and clarity",
    accent: "from-amber-300 to-yellow-100",
  },
];

export const dailyActivityTypes: DailyActivityType[] = [
  "lifting",
  "cardio",
  "stretching",
];

export const effortRatings = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const activityBaseXp: Record<DailyActivityType, Partial<Record<CoreStatName, number>>> = {
  lifting: { stamina: 3, strength: 10 },
  cardio: { stamina: 9, strength: 2 },
  stretching: { agility: 8, vitality: 1 },
};

export function formatActivityType(activityType: DailyActivityType) {
  return activityType
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getXpNeededForLevel(level: number) {
  return Math.round(BASE_XP_PER_LEVEL * level ** XP_LEVEL_EXPONENT);
}

export function getStatProgress(totalXp: number): StatProgress {
  let level = 1;
  let remainingXp = totalXp;
  let xpNeeded = getXpNeededForLevel(level);

  while (remainingXp >= xpNeeded) {
    remainingXp -= xpNeeded;
    level += 1;
    xpNeeded = getXpNeededForLevel(level);
  }

  return {
    currentXp: remainingXp,
    estimatedDailyDecay: estimateDailyDecay(level),
    level,
    progress: Math.round((remainingXp / xpNeeded) * 100),
    totalXp,
    xpNeeded,
  };
}

export function estimateDailyDecay(level: number) {
  // TODO: Apply decay during future end-of-day settlement after streak/rest rules exist.
  return Math.max(0, Math.round((level - 1) ** 1.15));
}

export function calculateFatigueChange(dailyLog: DailyLog) {
  const liftingFatigue = dailyLog.activities.lifting.completed
    ? dailyLog.activities.lifting.rating * 0.24
    : 0;
  const cardioFatigue = dailyLog.activities.cardio.completed
    ? dailyLog.activities.cardio.rating * 0.18
    : 0;
  const stretchingRecovery = dailyLog.activities.stretching.completed
    ? dailyLog.activities.stretching.rating * 0.12
    : 0;
  const sleepRecovery = (dailyLog.sleepRating - 5) * 0.22;
  const dietRecovery = (dailyLog.dietRating - 5) * 0.14;

  return roundTo(
    liftingFatigue + cardioFatigue - stretchingRecovery - sleepRecovery - dietRecovery,
    1,
  );
}

export function calculateFatigueEstimate(dailyLog: DailyLog): FatigueEstimate {
  const change = calculateFatigueChange(dailyLog);
  const projectedFatigue = Math.max(0, roundTo(change, 1));

  return {
    change,
    projectedFatigue,
    status: getRecoveryStatus(change),
  };
}

export function calculateXpMultiplier(dailyLog: DailyLog): XPModifier {
  const fatigue = calculateFatigueEstimate(dailyLog).projectedFatigue;
  const dietBoost = (dailyLog.dietRating - 5) * 0.07;
  const sleepBoost = (dailyLog.sleepRating - 5) * 0.09;
  const fatiguePenalty = fatigue * 0.1;
  const recoveryScore = Math.round(
    ((dailyLog.dietRating + dailyLog.sleepRating) / 20) * 100,
  );
  const multiplier = clamp(1 + dietBoost + sleepBoost - fatiguePenalty, 0.1, 2);

  return {
    dietRating: dailyLog.dietRating,
    fatigue,
    multiplier: roundTo(multiplier, 2),
    recoveryScore,
    sleepRating: dailyLog.sleepRating,
  };
}

export function calculateActivityXp(
  activityType: DailyActivityType,
  effortRating: number,
  modifier: XPModifier,
) {
  const statXp = createEmptyStatXp();
  const baseXp = activityBaseXp[activityType];

  statDefinitions.forEach((stat) => {
    statXp[stat.key] = Math.round(
      (baseXp[stat.key] ?? 0) * effortRating * modifier.multiplier,
    );
  });

  statXp.willpower += Math.max(
    1,
    Math.round(WILLPOWER_XP_PER_ACTION * modifier.multiplier),
  );

  return statXp;
}

export function calculateDailyStatEstimatesWithJournal(
  dailyLog: DailyLog,
  journalWordCount: number,
): StatXpEstimate {
  const modifier = calculateXpMultiplier(dailyLog);
  const statXp = createEmptyStatXp();

  dailyActivityTypes.forEach((activityType) => {
    const activity = dailyLog.activities[activityType];

    if (!activity.completed) {
      return;
    }

    const activityXp = calculateActivityXp(
      activityType,
      activity.rating,
      modifier,
    );

    addStatXp(statXp, activityXp);
  });

  addVitalityFromRecovery(statXp, dailyLog, modifier);
  addJournalXp(statXp, journalWordCount, modifier);

  return {
    fatigue: calculateFatigueEstimate(dailyLog),
    journalWordCount,
    modifier,
    statXp,
  };
}

export function estimateJournalInsightXp(
  wordCount: number,
  modifier: XPModifier = {
    dietRating: 5,
    fatigue: 0,
    multiplier: 1,
    recoveryScore: 50,
    sleepRating: 5,
  },
) {
  if (wordCount <= 0) {
    return 0;
  }

  const baseXp = Math.min(60, Math.ceil(Math.sqrt(wordCount) * 2.4));

  return Math.max(1, Math.round(baseXp * modifier.multiplier));
}

export function createEmptyStatXp(): Record<CoreStatName, number> {
  return {
    agility: 0,
    insight: 0,
    stamina: 0,
    strength: 0,
    vitality: 0,
    willpower: 0,
  };
}

function addVitalityFromRecovery(
  statXp: Record<CoreStatName, number>,
  dailyLog: DailyLog,
  modifier: XPModifier,
) {
  const recoveryAverage = (dailyLog.dietRating + dailyLog.sleepRating) / 2;

  if (recoveryAverage >= 6) {
    statXp.vitality += Math.round(recoveryAverage * 2 * modifier.multiplier);
    statXp.willpower += 1;
  }
}

function addJournalXp(
  statXp: Record<CoreStatName, number>,
  journalWordCount: number,
  modifier: XPModifier,
) {
  const insightXp = estimateJournalInsightXp(journalWordCount, modifier);

  if (insightXp <= 0) {
    return;
  }

  // TODO: Expand journal word-count XP with completion and reflection quality signals.
  statXp.insight += insightXp;
  statXp.willpower += Math.max(1, Math.round(WILLPOWER_XP_PER_ACTION * modifier.multiplier));
}

function addStatXp(
  target: Record<CoreStatName, number>,
  source: Record<CoreStatName, number>,
) {
  statDefinitions.forEach((stat) => {
    target[stat.key] += source[stat.key];
  });
}

export function getRecoveryStatus(change: number): RecoveryStatus {
  if (change <= -0.5) {
    return "recovery-positive";
  }

  if (change >= 0.8) {
    return "fatigue-building";
  }

  return "neutral";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundTo(value: number, precision: number) {
  const factor = 10 ** precision;

  return Math.round(value * factor) / factor;
}
