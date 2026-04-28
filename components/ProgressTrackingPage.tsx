import { useEffect, useMemo, useState } from "react";
import {
  getDailyHistory,
  getStatHistory,
  subscribeToFakeBackend,
} from "@/lib/fakeBackend";
import {
  filterHistoryByRange,
  getDailyTotalXp,
  formatShortDate,
  getDailyTrackingPoints,
  getHabitMetrics,
  getLatestStatXp,
  getRangeLabel,
  getStatXpTotals,
  getTrackingSummary,
  trackingRanges,
  type TrackingRange,
} from "@/lib/tracking";
import type { DailyHistoryEntry, StatHistoryEntry, User } from "@/lib/types";
import { statDefinitions } from "@/lib/xp";
import { ActivityDetailTable } from "@/components/tracking/ActivityDetailTable";
import { DailyXpBreakdown } from "@/components/tracking/DailyXpBreakdown";
import { EmptyTrackingState } from "@/components/tracking/EmptyTrackingState";
import { FatigueRecoveryChart } from "@/components/tracking/FatigueRecoveryChart";
import { HabitConsistencyCard } from "@/components/tracking/HabitConsistencyCard";
import { MetricCard } from "@/components/tracking/MetricCard";
import { SleepDietModifierSection } from "@/components/tracking/SleepDietModifierSection";
import { StatProgressChart } from "@/components/tracking/StatProgressChart";
import { TotalXpProgression } from "@/components/tracking/TotalXpProgression";

export function ProgressTrackingPage({ user }: { user: User }) {
  const [dailyHistory, setDailyHistory] = useState<DailyHistoryEntry[]>([]);
  const [statHistory, setStatHistory] = useState<StatHistoryEntry[]>([]);
  const [range, setRange] = useState<TrackingRange>("14D");

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

  const filteredHistory = useMemo(
    () => filterHistoryByRange(dailyHistory, range),
    [dailyHistory, range],
  );
  const summary = useMemo(
    () => getTrackingSummary(filteredHistory, range),
    [filteredHistory, range],
  );
  const statTotals = useMemo(
    () => getStatXpTotals(filteredHistory),
    [filteredHistory],
  );
  const dailyPoints = useMemo(
    () => getDailyTrackingPoints(filteredHistory),
    [filteredHistory],
  );
  const habitMetrics = useMemo(
    () => getHabitMetrics(filteredHistory, range),
    [filteredHistory, range],
  );

  if (dailyHistory.length === 0) {
    return <EmptyTrackingState />;
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      <section className="rounded-lg border border-white/10 bg-black/35 p-6 shadow-2xl shadow-black/30 backdrop-blur">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-200">
              Tracking
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-6xl">
              Tracking
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-300 sm:text-lg">
              Long-term progression, consistency, fatigue, recovery, and daily
              effort from your saved local history.
            </p>
            <p className="mt-3 text-sm font-bold text-zinc-500">
              Showing {getRangeLabel(filteredHistory, range)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {trackingRanges.map((rangeOption) => (
              <button
                className={`rounded-md border px-4 py-2 text-sm font-black transition ${
                  range === rangeOption
                    ? "border-amber-200/70 bg-amber-200 text-zinc-950"
                    : "border-white/10 bg-white/5 text-zinc-300 hover:border-amber-200/50 hover:text-white"
                }`}
                key={rangeOption}
                onClick={() => setRange(rangeOption)}
                type="button"
              >
                {rangeOption === "ALL" ? "All" : rangeOption}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          detail={`${filteredHistory.length} completed days in range`}
          label="Total XP"
          tone="amber"
          value={Math.round(summary.totalXp).toLocaleString()}
        />
        <MetricCard
          label="Average daily XP"
          value={Math.round(summary.averageDailyXp).toLocaleString()}
        />
        <MetricCard
          detail={
            summary.bestDayByXp
              ? formatShortDate(summary.bestDayByXp.date)
              : "No best day yet"
          }
          label="Best day"
          tone="sky"
          value={
            summary.bestDayByXp
              ? `${Math.round(getDailyTotalXp(summary.bestDayByXp))} XP`
              : "0 XP"
          }
        />
        <MetricCard
          detail="Current range average"
          label="XP multiplier"
          tone="violet"
          value={`${summary.averageMultiplier.toFixed(2)}x`}
        />
        <MetricCard
          label="Average fatigue"
          tone={summary.averageFatigueChange > 0 ? "red" : "emerald"}
          value={`${summary.averageFatigueChange > 0 ? "+" : ""}${summary.averageFatigueChange.toFixed(1)}`}
        />
        <MetricCard
          label="Consistency"
          tone="emerald"
          value={`${Math.round(summary.consistencyPercentage)}%`}
        />
        <MetricCard
          label="Journal words"
          value={summary.totalJournalWords.toLocaleString()}
        />
        <MetricCard
          detail="Across all six stats"
          label="Current total XP"
          value={statDefinitions
            .reduce(
              (total, stat) => total + getLatestStatXp(statHistory, stat.key),
              0,
            )
            .toLocaleString()}
        />
      </section>

      <section>
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-200">
              Core stats
            </p>
            <h2 className="mt-2 text-3xl font-black text-white">
              Stat progression
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-zinc-400">
            Each card shows current level, level XP, XP gained in this range,
            the strongest day, and a daily trend.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {statDefinitions.map((stat) => (
            <StatProgressChart
              currentTotalXp={getLatestStatXp(statHistory, stat.key)}
              dailyPoints={dailyPoints.map((point) => ({
                date: point.date,
                value: point.statXp[stat.key],
              }))}
              key={stat.key}
              rangeHistory={filteredHistory}
              stat={stat}
              totalRangeXp={statTotals[stat.key]}
            />
          ))}
        </div>
      </section>

      <TotalXpProgression points={dailyPoints} />
      <DailyXpBreakdown points={dailyPoints} />

      <section>
        <div className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-200">
            Habit consistency
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">
            Streaks and completions
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {habitMetrics.map((metric) => (
            <HabitConsistencyCard key={metric.key} metric={metric} />
          ))}
        </div>
      </section>

      <FatigueRecoveryChart
        averageFatigueChange={summary.averageFatigueChange}
        history={filteredHistory}
      />
      <SleepDietModifierSection history={filteredHistory} />
      <ActivityDetailTable history={filteredHistory} />
    </div>
  );
}
