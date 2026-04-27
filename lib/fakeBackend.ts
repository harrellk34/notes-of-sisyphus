import type {
  CoreStatName,
  DailyHistoryEntry,
  DailyLog,
  DashboardData,
  StatHistoryEntry,
  User,
  UserSettings,
} from "./types";
import {
  createDefaultDailyLog,
  getJournalWordCount,
  getTodayKey,
  readStorageItem,
  removeStorageItem,
  subscribeToStorage,
  writeStorageItem,
} from "./storage";
import {
  calculateDailyStatEstimatesWithJournal,
  createEmptyStatXp,
  dailyActivityTypes,
} from "./xp";

const CURRENT_USER_KEY = "notes-of-sisyphus-fake-current-user";
const USERS_KEY = "notes-of-sisyphus-fake-users";
const DEMO_SEED_KEY = "notes-of-sisyphus-demo-seed-version";
const DEMO_SEED_VERSION = "2026-04-27-v1";
const DEMO_USER_ID = "demo-user";
const DEMO_EMAIL = "demo@notesofsisyphus.dev";
const DEMO_PASSWORD = "demo123";
const LEGACY_USER_STORAGE_KEY = "notes-of-sisyphus-user";
const LEGACY_DASHBOARD_STORAGE_KEY = "notes-of-sisyphus-dashboard";
const LEGACY_DAILY_LOG_STORAGE_KEY = "notes-of-sisyphus-daily-log";
const LEGACY_JOURNAL_STORAGE_KEY = "notes-of-sisyphus-journal";
const LEGACY_MIGRATION_VERSION = "2026-04-27-v1";

type StoredUser = User & {
  password: string;
};

const defaultUserSettings: UserSettings = {
  dashboardDensity: "comfortable",
  fontSize: "normal",
  reducedMotion: false,
  theme: "dark",
  xpDisplay: "total",
};

// TODO: Replace this fake backend module with Supabase auth, tables, and RPC calls.

export function subscribeToFakeBackend(onStoreChange: () => void) {
  return subscribeToStorage(onStoreChange);
}

export async function getCurrentUser() {
  seedDemoUser();
  migrateLegacyCurrentUser();

  const userId = readStorageItem(CURRENT_USER_KEY);

  if (!userId) {
    return null;
  }

  return toPublicUser(getStoredUsers()[userId] ?? null);
}

export async function loginFakeUser(email: string, password: string) {
  seedDemoUser();

  const normalizedEmail = normalizeEmail(email);
  const users = getStoredUsers();
  const existingUser = Object.values(users).find(
    (storedUser) => storedUser.email.toLowerCase() === normalizedEmail,
  );
  const user =
    existingUser ??
    upsertStoredUser(users, {
      email: normalizedEmail,
      name: getNameFromEmail(normalizedEmail),
      password,
    });

  if (password) {
    users[user.id] = {
      ...user,
      password,
    };
  }

  setStoredUsers(users);
  migrateLegacyUserData(user.id, normalizedEmail);
  writeStorageItem(CURRENT_USER_KEY, user.id);

  return toPublicUser(user);
}

export async function createFakeUser(
  name: string,
  email: string,
  password: string,
) {
  seedDemoUser();

  const normalizedEmail = normalizeEmail(email);
  const users = getStoredUsers();
  const existingUser = Object.values(users).find(
    (user) => user.email.toLowerCase() === normalizedEmail,
  );
  const user = upsertStoredUser(users, {
    email: normalizedEmail,
    id: existingUser?.id,
    name,
    password,
  });

  setStoredUsers(users);
  migrateLegacyUserData(user.id, normalizedEmail);
  writeStorageItem(CURRENT_USER_KEY, user.id);
  ensureUserSettings(user.id);

  return toPublicUser(user);
}

export async function logoutFakeUser() {
  removeStorageItem(CURRENT_USER_KEY);
  removeStorageItem(LEGACY_USER_STORAGE_KEY);
}

export async function getTodayLog(userId: string) {
  seedDemoUser();

  const today = getTodayKey();
  const savedLog = readJson<DailyLog>(dailyLogKey(userId, today));

  return savedLog ?? createDefaultDailyLog(today);
}

export async function saveTodayLog(userId: string, dailyLog: DailyLog) {
  writeJson(dailyLogKey(userId, dailyLog.date), dailyLog);

  return dailyLog;
}

export async function completeDay(userId: string, date: string) {
  seedDemoUser();

  const dailyLog = readJson<DailyLog>(dailyLogKey(userId, date)) ??
    createDefaultDailyLog(date);
  const journal = await getJournalEntry(userId, date);
  const historyEntry = createDailyHistoryEntry(dailyLog, journal.wordCount);
  const history = upsertByDate(await getDailyHistory(userId), historyEntry);

  writeJson(dailyHistoryKey(userId), history);
  writeJson(statHistoryKey(userId), buildStatHistory(history));

  return historyEntry;
}

export async function getDailyHistory(userId: string) {
  seedDemoUser();

  return readJson<DailyHistoryEntry[]>(dailyHistoryKey(userId)) ?? [];
}

export async function getJournalEntry(userId: string, date: string) {
  seedDemoUser();

  const text = readStorageItem(journalKey(userId, date)) ?? "";

  return {
    date,
    text,
    wordCount: getJournalWordCount(text),
  };
}

export async function saveJournalEntry(
  userId: string,
  date: string,
  text: string,
) {
  writeStorageItem(journalKey(userId, date), text);

  return {
    date,
    text,
    wordCount: getJournalWordCount(text),
  };
}

export async function getStatHistory(userId: string) {
  seedDemoUser();

  return readJson<StatHistoryEntry[]>(statHistoryKey(userId)) ?? [];
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const statHistory = await getStatHistory(userId);
  const latestStats = statHistory.at(-1)?.statXp ?? createEmptyStatXp();

  return {
    statXp: latestStats,
  };
}

export async function saveUserSettings(
  userId: string,
  settings: UserSettings,
) {
  saveUserSettingsSync(userId, settings);

  return settings;
}

export async function getUserSettings(userId: string) {
  seedDemoUser();

  return readJson<UserSettings>(settingsKey(userId)) ?? defaultUserSettings;
}

function seedDemoUser() {
  const users = getStoredUsers();

  if (!users[DEMO_USER_ID]) {
    users[DEMO_USER_ID] = {
      email: DEMO_EMAIL,
      id: DEMO_USER_ID,
      name: "Demo User",
      password: DEMO_PASSWORD,
    };
    setStoredUsers(users);
  }

  if (readStorageItem(DEMO_SEED_KEY) === DEMO_SEED_VERSION) {
    return;
  }

  const { history, journals, logs, statHistory } = createDemoSeedData();

  logs.forEach((log) => writeJson(dailyLogKey(DEMO_USER_ID, log.date), log));
  journals.forEach((journal) =>
    writeStorageItem(journalKey(DEMO_USER_ID, journal.date), journal.text),
  );
  writeJson(dailyHistoryKey(DEMO_USER_ID), history);
  writeJson(statHistoryKey(DEMO_USER_ID), statHistory);
  saveUserSettingsSync(DEMO_USER_ID, defaultUserSettings);
  writeStorageItem(DEMO_SEED_KEY, DEMO_SEED_VERSION);
}

function migrateLegacyCurrentUser() {
  const legacyUser = parseLegacyUser(readStorageItem(LEGACY_USER_STORAGE_KEY));

  if (!legacyUser) {
    return;
  }

  const normalizedEmail = normalizeEmail(legacyUser.email);
  const users = getStoredUsers();
  const user = upsertStoredUser(users, {
    email: normalizedEmail,
    id: legacyUser.id,
    name: legacyUser.name || getNameFromEmail(normalizedEmail),
    password: "",
  });

  setStoredUsers(users);
  migrateLegacyUserData(user.id, normalizedEmail);
  writeStorageItem(CURRENT_USER_KEY, user.id);
  removeStorageItem(LEGACY_USER_STORAGE_KEY);
}

function migrateLegacyUserData(userId: string, email: string) {
  const migrationKey = legacyMigrationKey(email);

  if (readStorageItem(migrationKey) === LEGACY_MIGRATION_VERSION) {
    return;
  }

  const today = getTodayKey();
  const legacyDashboard = parseLegacyDashboard(
    readStorageItem(legacyDashboardKey(email)),
  );
  const legacyDailyLog = parseLegacyDailyLog(
    readStorageItem(legacyDailyLogKey(email, today)),
    today,
  );
  const legacyJournal = readStorageItem(legacyJournalKey(email, today));

  const existingStatHistory = readJson<StatHistoryEntry[]>(
    statHistoryKey(userId),
  );

  if (
    legacyDashboard &&
    (!existingStatHistory || existingStatHistory.length === 0)
  ) {
    writeJson(statHistoryKey(userId), [
      {
        date: today,
        statXp: legacyDashboard.statXp,
      },
    ]);
  }

  if (legacyDailyLog && !readJson<DailyLog>(dailyLogKey(userId, today))) {
    writeJson(dailyLogKey(userId, today), legacyDailyLog);
  }

  if (legacyJournal && readStorageItem(journalKey(userId, today)) === null) {
    writeStorageItem(journalKey(userId, today), legacyJournal);
  }

  writeStorageItem(migrationKey, LEGACY_MIGRATION_VERSION);
}

function createDemoSeedData() {
  const logs = Array.from({ length: 14 }, (_, index) =>
    createDemoDailyLog(getDateOffsetKey(index - 14), index),
  );
  const journals = logs.map((log, index) => ({
    date: log.date,
    text: createDemoJournalText(index),
    wordCount: 0,
  }));
  const history = logs.map((log, index) =>
    createDailyHistoryEntry(log, getJournalWordCount(journals[index].text)),
  );

  return {
    history,
    journals,
    logs,
    statHistory: buildStatHistory(history),
  };
}

function createDemoDailyLog(date: string, index: number): DailyLog {
  const liftingRatings = [7, 0, 8, 6, 0, 9, 5, 7, 0, 8, 6, 0, 9, 7];
  const cardioRatings = [4, 6, 0, 5, 7, 3, 0, 6, 8, 0, 5, 7, 4, 0];
  const stretchingRatings = [5, 7, 6, 4, 8, 5, 7, 6, 5, 8, 4, 7, 6, 5];
  const dietRatings = [6, 7, 5, 8, 6, 7, 4, 8, 6, 7, 5, 8, 7, 6];
  const sleepRatings = [7, 6, 8, 5, 7, 6, 9, 5, 8, 6, 7, 5, 6, 8];

  return {
    activities: {
      cardio: {
        completed: cardioRatings[index] > 0,
        rating: cardioRatings[index] || 5,
      },
      lifting: {
        completed: liftingRatings[index] > 0,
        rating: liftingRatings[index] || 5,
      },
      stretching: {
        completed: stretchingRatings[index] > 0,
        rating: stretchingRatings[index] || 5,
      },
    },
    date,
    dietRating: dietRatings[index],
    notes: `Demo training note ${index + 1}: kept the stone moving with measured effort.`,
    sleepRating: sleepRatings[index],
  };
}

function createDemoJournalText(index: number) {
  const reflections = [
    "Lifted before work and noticed the day felt less heavy afterward.",
    "Took a lighter day, stretched longer, and let recovery count as discipline.",
    "Cardio felt sharp today, even with a little fatigue building by evening.",
    "Ate well, slept unevenly, and still showed up for the main set.",
    "The journal caught a pattern: consistency is quieter than motivation.",
    "Hard session, good meal, steady walk home, no heroic speeches required.",
    "Recovery day with extra mobility and an early night.",
  ];
  const extra = " Logged what worked, what dragged, and what tomorrow needs.";

  return `${reflections[index % reflections.length]}${extra.repeat((index % 3) + 1)}`;
}

function createDailyHistoryEntry(
  dailyLog: DailyLog,
  journalWordCount: number,
): DailyHistoryEntry {
  const estimates = calculateDailyStatEstimatesWithJournal(
    dailyLog,
    journalWordCount,
  );

  return {
    dailyLog,
    date: dailyLog.date,
    estimatedXp: estimates.statXp,
    fatigueChange: estimates.fatigue.change,
    journalWordCount,
    recoveryScore: estimates.modifier.recoveryScore,
    xpMultiplier: estimates.modifier.multiplier,
  };
}

function buildStatHistory(history: DailyHistoryEntry[]) {
  const runningStats = createEmptyStatXp();

  return [...history]
    .sort((left, right) => left.date.localeCompare(right.date))
    .map((entry) => {
      addStatXp(runningStats, entry.estimatedXp);

      return {
        date: entry.date,
        statXp: { ...runningStats },
      };
    });
}

function upsertByDate<T extends { date: string }>(items: T[], nextItem: T) {
  return [...items.filter((item) => item.date !== nextItem.date), nextItem].sort(
    (left, right) => left.date.localeCompare(right.date),
  );
}

function addStatXp(
  target: Record<CoreStatName, number>,
  source: Record<CoreStatName, number>,
) {
  Object.keys(target).forEach((statKey) => {
    const stat = statKey as CoreStatName;
    target[stat] += source[stat];
  });
}

function getStoredUsers() {
  return readJson<Record<string, StoredUser>>(USERS_KEY) ?? {};
}

function setStoredUsers(users: Record<string, StoredUser>) {
  writeJson(USERS_KEY, users);
}

function upsertStoredUser(
  users: Record<string, StoredUser>,
  user: {
    email: string;
    id?: string;
    name: string;
    password: string;
  },
) {
  const id = user.id ?? getUserIdFromEmail(user.email);
  const existingUser = users[id];
  const storedUser: StoredUser = {
    email: user.email,
    id,
    name: user.name || existingUser?.name || getNameFromEmail(user.email),
    password: user.password || existingUser?.password || "",
  };

  users[id] = storedUser;

  return storedUser;
}

function parseLegacyUser(savedUser: string | null) {
  if (!savedUser) {
    return null;
  }

  try {
    const parsedUser = JSON.parse(savedUser) as Partial<User>;

    if (parsedUser.name && parsedUser.email) {
      return {
        email: parsedUser.email,
        id: parsedUser.id,
        name: parsedUser.name,
      };
    }
  } catch {
    return null;
  }

  return null;
}

function parseLegacyDashboard(savedDashboard: string | null): DashboardData | null {
  if (!savedDashboard) {
    return null;
  }

  try {
    const parsedDashboard = JSON.parse(savedDashboard) as {
      statXp?: unknown;
    };

    return {
      statXp: normalizeStatXp(parsedDashboard.statXp),
    };
  } catch {
    return null;
  }
}

function parseLegacyDailyLog(savedDailyLog: string | null, date: string) {
  if (!savedDailyLog) {
    return null;
  }

  try {
    return normalizeDailyLog(JSON.parse(savedDailyLog), date);
  } catch {
    return null;
  }
}

function normalizeDailyLog(value: unknown, date: string): DailyLog {
  const defaultDailyLog = createDefaultDailyLog(date);

  if (!isRecord(value)) {
    return defaultDailyLog;
  }

  const activities = { ...defaultDailyLog.activities };

  const activityValues = value.activities;

  if (isRecord(activityValues)) {
    dailyActivityTypes.forEach((activityType) => {
      const activity = activityValues[activityType];

      if (!isRecord(activity)) {
        return;
      }

      activities[activityType] = {
        completed:
          typeof activity.completed === "boolean"
            ? activity.completed
            : defaultDailyLog.activities[activityType].completed,
        rating: normalizeRating(
          activity.rating,
          defaultDailyLog.activities[activityType].rating,
        ),
      };
    });
  }

  return {
    activities,
    date,
    dietRating: normalizeRating(value.dietRating, defaultDailyLog.dietRating),
    notes: typeof value.notes === "string" ? value.notes : defaultDailyLog.notes,
    sleepRating: normalizeRating(value.sleepRating, defaultDailyLog.sleepRating),
  };
}

function normalizeStatXp(value: unknown) {
  const statXp = createEmptyStatXp();

  if (!isRecord(value)) {
    return statXp;
  }

  Object.keys(statXp).forEach((statKey) => {
    const stat = statKey as CoreStatName;
    const xp = value[stat];

    if (typeof xp === "number" && Number.isFinite(xp)) {
      statXp[stat] = xp;
    }
  });

  return statXp;
}

function normalizeRating(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(10, Math.max(1, Math.round(value)))
    : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function saveUserSettingsSync(userId: string, settings: UserSettings) {
  writeJson(settingsKey(userId), settings);
}

function ensureUserSettings(userId: string) {
  if (!readJson<UserSettings>(settingsKey(userId))) {
    saveUserSettingsSync(userId, defaultUserSettings);
  }
}

function toPublicUser(user: StoredUser | null): User | null {
  if (!user) {
    return null;
  }

  return {
    email: user.email,
    id: user.id,
    name: user.name,
  };
}

function readJson<T>(key: string) {
  const savedValue = readStorageItem(key);

  if (!savedValue) {
    return null;
  }

  try {
    return JSON.parse(savedValue) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  writeStorageItem(key, JSON.stringify(value));
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getNameFromEmail(email: string) {
  const emailName = email.split("@")[0]?.trim();

  if (!emailName) {
    return "Wayfarer";
  }

  return emailName
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getUserIdFromEmail(email: string) {
  return `user-${email.replace(/[^a-z0-9]+/g, "-")}`;
}

function getDateOffsetKey(offset: number) {
  const date = new Date();

  date.setDate(date.getDate() + offset);

  return date.toISOString().slice(0, 10);
}

function dailyHistoryKey(userId: string) {
  return `notes-of-sisyphus:${userId}:daily-history`;
}

function legacyDashboardKey(email: string) {
  return `${LEGACY_DASHBOARD_STORAGE_KEY}:${email}`;
}

function legacyDailyLogKey(email: string, date: string) {
  return `${LEGACY_DAILY_LOG_STORAGE_KEY}:${email}:${date}`;
}

function legacyJournalKey(email: string, date: string) {
  return `${LEGACY_JOURNAL_STORAGE_KEY}:${email}:${date}`;
}

function legacyMigrationKey(email: string) {
  return `notes-of-sisyphus-fake-legacy-migration:${email}`;
}

function dailyLogKey(userId: string, date: string) {
  return `notes-of-sisyphus:${userId}:daily-log:${date}`;
}

function journalKey(userId: string, date: string) {
  return `notes-of-sisyphus:${userId}:journal:${date}`;
}

function settingsKey(userId: string) {
  return `notes-of-sisyphus:${userId}:settings`;
}

function statHistoryKey(userId: string) {
  return `notes-of-sisyphus:${userId}:stat-history`;
}
