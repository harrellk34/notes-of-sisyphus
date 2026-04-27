import { useEffect, useState } from "react";
import {
  getDailyHistory,
  subscribeToFakeBackend,
} from "@/lib/fakeBackend";
import type { DailyHistoryEntry, User } from "@/lib/types";

const intensityClasses = [
  "bg-zinc-900",
  "bg-emerald-950",
  "bg-emerald-800",
  "bg-emerald-600",
  "bg-amber-300 text-zinc-950",
];

export function PastDaysPage({ user }: { user: User }) {
  const [history, setHistory] = useState<DailyHistoryEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const selectedDay =
    history.find((entry) => entry.date === selectedDate) ?? history.at(-1);

  useEffect(() => {
    let isMounted = true;

    async function loadHistory() {
      const dailyHistory = await getDailyHistory(user.id);

      if (!isMounted) {
        return;
      }

      setHistory(dailyHistory);
      setSelectedDate(
        (currentDate) => currentDate ?? dailyHistory.at(-1)?.date ?? null,
      );
    }

    void loadHistory();

    const unsubscribe = subscribeToFakeBackend(() => {
      void loadHistory();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [user.id]);

  return (
    <section className="rounded-lg border border-white/10 bg-black/35 p-6 shadow-2xl shadow-black/30 backdrop-blur">
      <div className="border-b border-white/10 pb-5">
        <p className="text-sm uppercase tracking-[0.24em] text-amber-200">
          Past Days
        </p>
        <h1 className="mt-2 text-4xl font-black text-white">
          Calendar memory
        </h1>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="grid grid-cols-7 gap-2 rounded-lg border border-white/10 bg-zinc-900/70 p-4">
          {history.length > 0 ? (
            history.map((entry) => (
              <button
                className={`aspect-square rounded border border-white/10 text-xs font-bold text-white transition hover:ring-2 hover:ring-amber-200/40 ${
                  intensityClasses[getDayIntensity(entry)]
                }`}
                key={entry.date}
                onClick={() => setSelectedDate(entry.date)}
                type="button"
              >
                {Number(entry.date.slice(-2))}
              </button>
            ))
          ) : (
            <p className="col-span-7 p-4 text-sm text-zinc-500">
              No completed days yet.
            </p>
          )}
        </div>

        <div className="rounded-lg border border-white/10 bg-zinc-900/80 p-5">
          <p className="text-sm uppercase tracking-[0.22em] text-zinc-500">
            Selected day
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white">
            {selectedDay ? selectedDay.date : "No day selected"}
          </h2>
          <div className="mt-5 space-y-3 text-sm text-zinc-400">
            {selectedDay ? (
              <>
                <p>Sleep: {selectedDay.dailyLog.sleepRating}/10</p>
                <p>Diet: {selectedDay.dailyLog.dietRating}/10</p>
                <p>
                  Lifting/Cardio/Stretching:{" "}
                  {formatActivity(selectedDay.dailyLog.activities.lifting)} /{" "}
                  {formatActivity(selectedDay.dailyLog.activities.cardio)} /{" "}
                  {formatActivity(selectedDay.dailyLog.activities.stretching)}
                </p>
                <p>Journal word count: {selectedDay.journalWordCount}</p>
                <p>
                  Estimated XP: {getTotalXp(selectedDay)} | Fatigue:{" "}
                  {selectedDay.fatigueChange > 0 ? "+" : ""}
                  {selectedDay.fatigueChange}
                </p>
              </>
            ) : (
              <p>Complete a day to build local history.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function getDayIntensity(entry: DailyHistoryEntry) {
  const completedActivities = Object.values(entry.dailyLog.activities).filter(
    (activity) => activity.completed,
  ).length;
  const recoveryBonus = entry.recoveryScore >= 70 ? 1 : 0;

  return Math.min(4, completedActivities + recoveryBonus);
}

function getTotalXp(entry: DailyHistoryEntry) {
  return Object.values(entry.estimatedXp).reduce((total, xp) => total + xp, 0);
}

function formatActivity(activity: { completed: boolean; rating: number }) {
  return activity.completed ? `${activity.rating}/10` : "open";
}
