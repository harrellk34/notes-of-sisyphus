import type {
  ActivityLog,
  CoreStatName,
  DailyActivityType,
  DailyLog,
  DashboardData,
  User,
} from "./types";
import { createEmptyStatXp, dailyActivityTypes } from "./xp";

export const USER_STORAGE_KEY = "notes-of-sisyphus-user";
export const USER_STORAGE_EVENT = "notes-of-sisyphus-user-change";
export const DASHBOARD_STORAGE_KEY = "notes-of-sisyphus-dashboard";
export const DAILY_LOG_STORAGE_KEY = "notes-of-sisyphus-daily-log";
export const JOURNAL_STORAGE_KEY = "notes-of-sisyphus-journal";
export const DASHBOARD_STORAGE_EVENT = "notes-of-sisyphus-dashboard-change";

export const defaultStatXp: Record<CoreStatName, number> = createEmptyStatXp();

export const defaultDashboardData: DashboardData = {
  statXp: defaultStatXp,
  activities: [],
};

export const defaultDashboardSnapshot = JSON.stringify(defaultDashboardData);

export function createDefaultDailyLog(date = getTodayKey()): DailyLog {
  return {
    activities: {
      cardio: { completed: false, rating: 5 },
      lifting: { completed: false, rating: 5 },
      stretching: { completed: false, rating: 5 },
    },
    date,
    dietRating: 5,
    notes: "",
    sleepRating: 5,
  };
}

export const defaultDailyLogSnapshot = JSON.stringify(createDefaultDailyLog());
export const defaultJournalSnapshot = "";

export function subscribeToStoredUser(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(USER_STORAGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(USER_STORAGE_EVENT, onStoreChange);
  };
}

export function getStoredUser() {
  return window.localStorage.getItem(USER_STORAGE_KEY);
}

export function getServerStoredUser() {
  return null;
}

export function setStoredUser(user: User) {
  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(USER_STORAGE_EVENT));
}

export function clearStoredUser() {
  window.localStorage.removeItem(USER_STORAGE_KEY);
  window.dispatchEvent(new Event(USER_STORAGE_EVENT));
}

export function parseStoredUser(savedUser: string | null) {
  if (!savedUser) {
    return null;
  }

  try {
    const parsedUser = JSON.parse(savedUser) as User;

    if (parsedUser.name && parsedUser.email) {
      return parsedUser;
    }
  } catch {
    window.localStorage.removeItem(USER_STORAGE_KEY);
  }

  return null;
}

export function subscribeToDashboard(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(DASHBOARD_STORAGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(DASHBOARD_STORAGE_EVENT, onStoreChange);
  };
}

export function getDashboardStorageKey(email: string) {
  return `${DASHBOARD_STORAGE_KEY}:${email.toLowerCase()}`;
}

export function getDailyLogStorageKey(email: string, date = getTodayKey()) {
  return `${DAILY_LOG_STORAGE_KEY}:${email.toLowerCase()}:${date}`;
}

export function getTodayJournalStorageKey(email: string, date = getTodayKey()) {
  return `${JOURNAL_STORAGE_KEY}:${email.toLowerCase()}:${date}`;
}

export function getServerDashboardSnapshot() {
  return defaultDashboardSnapshot;
}

export function getServerDailyLogSnapshot() {
  return defaultDailyLogSnapshot;
}

export function getServerJournalSnapshot() {
  return defaultJournalSnapshot;
}

export function parseDashboardData(savedDashboard: string | null): DashboardData {
  if (!savedDashboard) {
    return defaultDashboardData;
  }

  try {
    const parsedDashboard = JSON.parse(savedDashboard) as Partial<DashboardData>;

    return {
      statXp: {
        ...defaultStatXp,
        ...parsedDashboard.statXp,
      },
      activities: Array.isArray(parsedDashboard.activities)
        ? parsedDashboard.activities
            .filter((activity) => {
              const activityType = activity.activityType as DailyActivityType;

              return (
                dailyActivityTypes.includes(activityType) &&
                Boolean((activity as ActivityLog).statXp)
              );
            })
        : [],
    };
  } catch {
    return defaultDashboardData;
  }
}

export function parseDailyLog(savedDailyLog: string | null, date = getTodayKey()) {
  const defaultDailyLog = createDefaultDailyLog(date);

  if (!savedDailyLog) {
    return defaultDailyLog;
  }

  try {
    const parsedDailyLog = JSON.parse(savedDailyLog) as Partial<DailyLog>;

    return {
      ...defaultDailyLog,
      ...parsedDailyLog,
      activities: {
        ...defaultDailyLog.activities,
        ...parsedDailyLog.activities,
      },
      date,
    };
  } catch {
    return defaultDailyLog;
  }
}

export function getDashboardSnapshot(storageKey: string) {
  return window.localStorage.getItem(storageKey) ?? defaultDashboardSnapshot;
}

export function getDailyLogSnapshot(storageKey: string) {
  return window.localStorage.getItem(storageKey) ?? defaultDailyLogSnapshot;
}

export function getJournalSnapshot(storageKey: string) {
  return window.localStorage.getItem(storageKey) ?? defaultJournalSnapshot;
}

export function setDashboardData(storageKey: string, dashboardData: DashboardData) {
  window.localStorage.setItem(storageKey, JSON.stringify(dashboardData));
  window.dispatchEvent(new Event(DASHBOARD_STORAGE_EVENT));
}

export function setDailyLog(storageKey: string, dailyLog: DailyLog) {
  window.localStorage.setItem(storageKey, JSON.stringify(dailyLog));
  window.dispatchEvent(new Event(DASHBOARD_STORAGE_EVENT));
}

export function saveTodayJournal(storageKey: string, text: string) {
  window.localStorage.setItem(storageKey, text);
  window.dispatchEvent(new Event(DASHBOARD_STORAGE_EVENT));
}

export function getJournalWordCount(text: string) {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}
