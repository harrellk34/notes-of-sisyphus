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

export type StatName = CoreStatName;

export type DailyActivityType =
  | "lifting"
  | "cardio"
  | "stretching";

export type ActivityType =
  | DailyActivityType
  | "journaling"
  | "diet"
  | "sleep"
  | "rest";

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

export type JournalEntry = {
  date: string;
  text: string;
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

export type ActivityLog = {
  id: string;
  activityType: DailyActivityType;
  effortRating: number;
  notes: string;
  statXp: Record<CoreStatName, number>;
  multiplier: number;
  fatigueChange: number;
  createdAt: string;
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
  activities: ActivityLog[];
};

export type AuthSubmitHandler = FormEvent<HTMLFormElement>;
