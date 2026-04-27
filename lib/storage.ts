import type { DailyLog } from "./types";

export const FAKE_BACKEND_EVENT = "notes-of-sisyphus-fake-backend-change";

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

export function subscribeToStorage(onStoreChange: () => void) {
  if (!canUseBrowserStorage()) {
    return () => {};
  }

  window.addEventListener("storage", onStoreChange);
  window.addEventListener(FAKE_BACKEND_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(FAKE_BACKEND_EVENT, onStoreChange);
  };
}

export function readStorageItem(key: string) {
  if (!canUseBrowserStorage()) {
    return null;
  }

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorageItem(key: string, value: string) {
  if (!canUseBrowserStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(key, value);
    dispatchStorageChange();
  } catch {
    // Ignore storage quota/privacy failures; callers keep their in-memory state.
  }
}

export function removeStorageItem(key: string) {
  if (!canUseBrowserStorage()) {
    return;
  }

  try {
    window.localStorage.removeItem(key);
    dispatchStorageChange();
  } catch {
    // Ignore unavailable storage in restricted browser contexts.
  }
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

function dispatchStorageChange() {
  if (!canUseBrowserStorage()) {
    return;
  }

  window.dispatchEvent(new Event(FAKE_BACKEND_EVENT));
}

function canUseBrowserStorage() {
  return (
    typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined"
  );
}
