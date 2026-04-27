import { useEffect, useState } from "react";
import {
  getDailyHistory,
  getStatHistory,
  subscribeToFakeBackend,
} from "@/lib/fakeBackend";
import type {
  CoreStatName,
  DailyHistoryEntry,
  StatHistoryEntry,
  User,
} from "@/lib/types";
import { statDefinitions } from "@/lib/xp";

export function ProgressTrackingPage({ user }: { user: User }) {
  const [dailyHistory, setDailyHistory] = useState<DailyHistoryEntry[]>([]);
  const [statHistory, setStatHistory] = useState<StatHistoryEntry[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadTrackingData() {
      const [nextDailyHistory, nextStatHistory] = await Promise.all([
        getDailyHistory(user.id),
        getStatHistory(user.id),
      ]);

      if (!isMounted) {
        return;
      }

      setDailyHistory(nextDailyHistory);
      setStatHistory(nextStatHistory);
    }

    void loadTrackingData();

    const unsubscribe = subscribeToFakeBackend(() => {
      void loadTrackingData();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [user.id]);

  const latestStats = statHistory.at(-1)?.statXp;

  // TODO: Replace placeholder cards with persisted graphs after daily settlements exist.
  return (
    <section className="rounded-lg border border-white/10 bg-black/35 p-6 shadow-2xl shadow-black/30 backdrop-blur">
      <div className="border-b border-white/10 pb-5">
        <p className="text-sm uppercase tracking-[0.24em] text-amber-200">
          Tracking
        </p>
        <h1 className="mt-2 text-4xl font-black text-white">
          Progress graphs
        </h1>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statDefinitions.map((stat) => (
          <TrackingCard
            key={stat.key}
            label={`${stat.name} progress`}
            points={getStatPoints(statHistory, stat.key)}
            value={latestStats?.[stat.key] ?? 0}
          />
        ))}
        <TrackingCard
          label="XP multiplier trend"
          points={dailyHistory.map((entry) => entry.xpMultiplier)}
          value={dailyHistory.at(-1)?.xpMultiplier ?? 0}
          valueSuffix="x"
        />
        <TrackingCard
          label="Fatigue trend"
          points={dailyHistory.map((entry) => entry.fatigueChange)}
          value={dailyHistory.at(-1)?.fatigueChange ?? 0}
        />
      </div>
    </section>
  );
}

function TrackingCard({
  label,
  points,
  value,
  valueSuffix = "",
}: {
  label: string;
  points: number[];
  value: number;
  valueSuffix?: string;
}) {
  const visiblePoints = points.slice(-7);
  const maxPoint = Math.max(...visiblePoints.map((point) => Math.abs(point)), 1);

  return (
    <div className="min-h-40 rounded-lg border border-white/10 bg-zinc-900/80 p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="font-bold text-white">{label}</p>
        <p className="text-sm font-black text-amber-100">
          {formatValue(value)}
          {valueSuffix}
        </p>
      </div>
      <div className="mt-6 flex h-20 items-end gap-1 rounded-md border border-dashed border-white/15 bg-black/25 p-2">
        {visiblePoints.length > 0 ? (
          visiblePoints.map((point, index) => (
            <div
              className="flex-1 rounded-sm bg-amber-200/80"
              key={`${label}-${index}`}
              style={{ height: `${Math.max(10, (Math.abs(point) / maxPoint) * 100)}%` }}
            />
          ))
        ) : (
          <p className="self-center text-xs text-zinc-600">No history yet</p>
        )}
      </div>
    </div>
  );
}

function getStatPoints(
  history: StatHistoryEntry[],
  stat: CoreStatName,
) {
  return history.map((entry) => entry.statXp[stat]);
}

function formatValue(value: number) {
  return Number.isInteger(value) ? value : value.toFixed(2);
}
