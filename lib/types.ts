import type { FormEvent } from "react";

export type AuthMode = "login" | "create";

export type AppView =
  | "dashboard"
  | "journal"
  | "tracking"
  | "past-days"
  | "account"
  | "settings";

export type User = {
  id: string;
  name: string;
  email: string;
};

export type CoreStatName =
  | "strength"
  | "agility"
  | "stamina"
  | "vitality"
  | "willpower"
  | "insight";

export type DailyActivityType =
  | "lifting"
  | "cardio"
  | "stretching";

export type DailyActivityEntry = {
  completed: boolean;
  rating: number;
};

export type DailyLog = {
  date: string;
  activities: Record<DailyActivityType, DailyActivityEntry>;
  dietRating: number;
  sleepRating: number;
  notes: string;
};

export type RecoveryStatus =
  | "recovery-positive"
  | "neutral"
  | "fatigue-building";

export type FatigueEstimate = {
  change: number;
  projectedFatigue: number;
  status: RecoveryStatus;
};

export type XPModifier = {
  dietRating: number;
  sleepRating: number;
  fatigue: number;
  multiplier: number;
  recoveryScore: number;
};

export type StatDefinition = {
  key: CoreStatName;
  name: string;
  focus: string;
  accent: string;
};

export type StatXpEstimate = {
  statXp: Record<CoreStatName, number>;
  fatigue: FatigueEstimate;
  journalWordCount: number;
  modifier: XPModifier;
};

export type DailyHistoryEntry = {
  date: string;
  dailyLog: DailyLog;
  estimatedXp: Record<CoreStatName, number>;
  fatigueChange: number;
  journalWordCount: number;
  recoveryScore: number;
  xpMultiplier: number;
};

export type JournalEntry = {
  date: string;
  text: string;
  wordCount: number;
};

export type StatHistoryEntry = {
  date: string;
  statXp: Record<CoreStatName, number>;
};

export type StatProgress = {
  level: number;
  currentXp: number;
  xpNeeded: number;
  progress: number;
  totalXp: number;
  estimatedDailyDecay: number;
};

export type DashboardData = {
  statXp: Record<CoreStatName, number>;
};

export type UserSettings = {
  dashboardDensity: "comfortable" | "compact";
  fontSize: "normal" | "large";
  reducedMotion: boolean;
  theme: "dark" | "light";
  xpDisplay: "total" | "level";
};

export type AuthSubmitHandler = FormEvent<HTMLFormElement>;
