import type {
  CoreStatName,
  DailyActivityType,
  DailyHistoryEntry,
  RecoveryStatus,
  StatHistoryEntry,
} from "./types";
import { createEmptyStatXp, getRecoveryStatus, statDefinitions } from "./xp";

export type TrackingRange = "7D" | "14D" | "30D" | "ALL";

export const trackingRanges: TrackingRange[] = ["7D", "14D", "30D", "ALL"];

export type HabitMetricKey =
  | DailyActivityType
  | "journaling"
  | "diet"
  | "sleep";

export type HabitMetric = {
  averageRating: number | null;
  averageWords: number | null;
  bestStreak: number;
  completedDays: number;
  currentStreak: number;
  history: boolean[];
  key: HabitMetricKey;
  label: string;
  totalDays: number;
  totalWords: number;
};

export type TrackingSummary = {
  averageDailyXp: number;
  averageFatigueChange: number;
  averageMultiplier: number;
  bestDayByXp: DailyHistoryEntry | null;
  consistencyPercentage: number;
  totalJournalWords: number;
  totalXp: number;
};

export type DailyTrackingPoint = {
  date: string;
  fatigueChange: number;
  recoveryStatus: RecoveryStatus;
  statXp: Record<CoreStatName, number>;
  totalXp: number;
  xpMultiplier: number;
};

export function sortDailyHistory(history: DailyHistoryEntry[]) {
  return [...history].sort((left, right) => left.date.localeCompare(right.date));
}

export function filterHistoryByRange(
  history: DailyHistoryEntry[],
  range: TrackingRange,
) {
  const sortedHistory = sortDailyHistory(history);

  if (range === "ALL" || sortedHistory.length === 0) {
    return sortedHistory;
  }

  const endDate = parseDateKey(sortedHistory.at(-1)?.date);

  if (!endDate) {
    return sortedHistory;
  }

  const dayCount = Number.parseInt(range, 10);
  const startDate = addDays(endDate, -(dayCount - 1));
  const startKey = formatDateKey(startDate);

  return sortedHistory.filter((entry) => entry.date >= startKey);
}

export function getRangeLabel(
  filteredHistory: DailyHistoryEntry[],
  range: TrackingRange,
) {
  if (filteredHistory.length === 0) {
    return range === "ALL" ? "All time" : `Last ${range.toLowerCase()}`;
  }

  const start = filteredHistory[0].date;
  const end = filteredHistory.at(-1)?.date ?? start;

  return `${formatShortDate(start)} - ${formatShortDate(end)}`;
}

export function getRangeDayCount(
  filteredHistory: DailyHistoryEntry[],
  range: TrackingRange,
) {
  if (filteredHistory.length === 0) {
    return 0;
  }

  if (range !== "ALL") {
    return Number.parseInt(range, 10);
  }

  const firstDate = parseDateKey(filteredHistory[0].date);
  const lastDate = parseDateKey(filteredHistory.at(-1)?.date);

  if (!firstDate || !lastDate) {
    return filteredHistory.length;
  }

  return Math.max(1, daysBetween(firstDate, lastDate) + 1);
}

export function getTrackingSummary(
  filteredHistory: DailyHistoryEntry[],
  range: TrackingRange,
): TrackingSummary {
  const totalDays = getRangeDayCount(filteredHistory, range);
  const totalXp = sum(filteredHistory.map(getDailyTotalXp));
  const bestDayByXp = filteredHistory.reduce<DailyHistoryEntry | null>(
    (bestEntry, entry) =>
      !bestEntry || getDailyTotalXp(entry) > getDailyTotalXp(bestEntry)
        ? entry
        : bestEntry,
    null,
  );

  return {
    averageDailyXp: totalDays > 0 ? totalXp / totalDays : 0,
    averageFatigueChange: average(
      filteredHistory.map((entry) => safeNumber(entry.fatigueChange)),
    ),
    averageMultiplier: average(
      filteredHistory.map((entry) => safeNumber(entry.xpMultiplier)),
    ),
    bestDayByXp,
    consistencyPercentage:
      totalDays > 0 ? (filteredHistory.length / totalDays) * 100 : 0,
    totalJournalWords: sum(
      filteredHistory.map((entry) => safeNumber(entry.journalWordCount)),
    ),
    totalXp,
  };
}

export function getDailyTrackingPoints(history: DailyHistoryEntry[]) {
  return sortDailyHistory(history).map((entry): DailyTrackingPoint => ({
    date: entry.date,
    fatigueChange: safeNumber(entry.fatigueChange),
    recoveryStatus: getRecoveryStatus(safeNumber(entry.fatigueChange)),
    statXp: normalizeStatXp(entry.estimatedXp),
    totalXp: getDailyTotalXp(entry),
    xpMultiplier: safeNumber(entry.xpMultiplier),
  }));
}

export function getDailyTotalXp(entry: DailyHistoryEntry) {
  return sum(statDefinitions.map((stat) => safeNumber(entry.estimatedXp?.[stat.key])));
}

export function getStatXpTotals(history: DailyHistoryEntry[]) {
  const totals = createEmptyStatXp();

  history.forEach((entry) => {
    statDefinitions.forEach((stat) => {
      totals[stat.key] += safeNumber(entry.estimatedXp?.[stat.key]);
    });
  });

  return totals;
}

export function getBestStatDay(
  history: DailyHistoryEntry[],
  stat: CoreStatName,
) {
  return sortDailyHistory(history).reduce<DailyHistoryEntry | null>(
    (bestEntry, entry) =>
      !bestEntry ||
      safeNumber(entry.estimatedXp?.[stat]) > safeNumber(bestEntry.estimatedXp?.[stat])
        ? entry
        : bestEntry,
    null,
  );
}

export function getLatestStatXp(
  statHistory: StatHistoryEntry[],
  stat: CoreStatName,
) {
  const sortedHistory = [...statHistory].sort((left, right) =>
    left.date.localeCompare(right.date),
  );

  return safeNumber(sortedHistory.at(-1)?.statXp?.[stat]);
}

export function getHabitMetrics(
  history: DailyHistoryEntry[],
  range: TrackingRange,
): HabitMetric[] {
  const totalDays = getRangeDayCount(history, range);

  return [
    getActivityHabitMetric(history, totalDays, "lifting", "Lifting"),
    getActivityHabitMetric(history, totalDays, "cardio", "Cardio"),
    getActivityHabitMetric(history, totalDays, "stretching", "Stretching"),
    getJournalHabitMetric(history, totalDays),
    getRatingHabitMetric(history, totalDays, "diet", "Diet"),
    getRatingHabitMetric(history, totalDays, "sleep", "Sleep"),
  ];
}

export function getRecoveryStatusCounts(history: DailyHistoryEntry[]) {
  return history.reduce<Record<RecoveryStatus, number>>(
    (counts, entry) => {
      counts[getRecoveryStatus(safeNumber(entry.fatigueChange))] += 1;
      return counts;
    },
    {
      "fatigue-building": 0,
      neutral: 0,
      "recovery-positive": 0,
    },
  );
}

export function getBestRecoveryDay(history: DailyHistoryEntry[]) {
  return sortDailyHistory(history).reduce<DailyHistoryEntry | null>(
    (bestEntry, entry) =>
      !bestEntry || entry.fatigueChange < bestEntry.fatigueChange
        ? entry
        : bestEntry,
    null,
  );
}

export function getHighestFatigueDay(history: DailyHistoryEntry[]) {
  return sortDailyHistory(history).reduce<DailyHistoryEntry | null>(
    (highestEntry, entry) =>
      !highestEntry || entry.fatigueChange > highestEntry.fatigueChange
        ? entry
        : highestEntry,
    null,
  );
}

export function formatShortDate(date: string) {
  const parsedDate = parseDateKey(date);

  if (!parsedDate) {
    return date;
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
  }).format(parsedDate);
}

export function formatRecoveryStatus(status: RecoveryStatus) {
  return status
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function safeNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function getActivityHabitMetric(
  history: DailyHistoryEntry[],
  totalDays: number,
  key: DailyActivityType,
  label: string,
): HabitMetric {
  const completedHistory = history.map((entry) =>
    Boolean(entry.dailyLog?.activities?.[key]?.completed),
  );
  const completedEntries = history.filter(
    (entry) => entry.dailyLog?.activities?.[key]?.completed,
  );

  return {
    averageRating: average(
      completedEntries.map((entry) =>
        safeNumber(entry.dailyLog?.activities?.[key]?.rating),
      ),
    ),
    averageWords: null,
    bestStreak: getBestStreak(completedHistory),
    completedDays: completedEntries.length,
    currentStreak: getCurrentStreak(completedHistory),
    history: completedHistory,
    key,
    label,
    totalDays,
    totalWords: 0,
  };
}

function getJournalHabitMetric(
  history: DailyHistoryEntry[],
  totalDays: number,
): HabitMetric {
  const completedHistory = history.map((entry) => entry.journalWordCount > 0);
  const completedEntries = history.filter((entry) => entry.journalWordCount > 0);
  const totalWords = sum(history.map((entry) => safeNumber(entry.journalWordCount)));

  return {
    averageRating: null,
    averageWords:
      completedEntries.length > 0 ? totalWords / completedEntries.length : null,
    bestStreak: getBestStreak(completedHistory),
    completedDays: completedEntries.length,
    currentStreak: getCurrentStreak(completedHistory),
    history: completedHistory,
    key: "journaling",
    label: "Journaling",
    totalDays,
    totalWords,
  };
}

function getRatingHabitMetric(
  history: DailyHistoryEntry[],
  totalDays: number,
  key: "diet" | "sleep",
  label: string,
): HabitMetric {
  const ratingKey = key === "diet" ? "dietRating" : "sleepRating";
  const completedHistory = history.map(
    (entry) => safeNumber(entry.dailyLog?.[ratingKey]) >= 6,
  );
  const ratings = history.map((entry) => safeNumber(entry.dailyLog?.[ratingKey]));

  return {
    averageRating: average(ratings),
    averageWords: null,
    bestStreak: getBestStreak(completedHistory),
    completedDays: completedHistory.filter(Boolean).length,
    currentStreak: getCurrentStreak(completedHistory),
    history: completedHistory,
    key,
    label,
    totalDays,
    totalWords: 0,
  };
}

function getCurrentStreak(values: boolean[]) {
  let streak = 0;

  for (let index = values.length - 1; index >= 0; index -= 1) {
    if (!values[index]) {
      break;
    }

    streak += 1;
  }

  return streak;
}

function getBestStreak(values: boolean[]) {
  let bestStreak = 0;
  let activeStreak = 0;

  values.forEach((value) => {
    activeStreak = value ? activeStreak + 1 : 0;
    bestStreak = Math.max(bestStreak, activeStreak);
  });

  return bestStreak;
}

function normalizeStatXp(value: Partial<Record<CoreStatName, number>> | undefined) {
  const statXp = createEmptyStatXp();

  statDefinitions.forEach((stat) => {
    statXp[stat.key] = safeNumber(value?.[stat.key]);
  });

  return statXp;
}

function average(values: number[]) {
  const safeValues = values.filter((value) => Number.isFinite(value));

  return safeValues.length > 0 ? sum(safeValues) / safeValues.length : 0;
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + safeNumber(value), 0);
}

function parseDateKey(date: string | undefined) {
  if (!date) {
    return null;
  }

  const parsedDate = new Date(`${date}T00:00:00`);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
}

function daysBetween(start: Date, end: Date) {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  return Math.round((end.getTime() - start.getTime()) / millisecondsPerDay);
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
