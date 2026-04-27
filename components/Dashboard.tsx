import { useEffect, useState } from "react";
import { DailyLogForm } from "@/components/DailyLogForm";
import { DailyLogSummary } from "@/components/DailyLogSummary";
import { StatCard } from "@/components/StatCard";
import {
  getDashboardData,
  getJournalEntry,
  getTodayLog,
  saveTodayLog,
  subscribeToFakeBackend,
} from "@/lib/fakeBackend";
import {
  createDefaultDailyLog,
  getJournalWordCount,
  getTodayKey,
} from "@/lib/storage";
import type { AppView, AuthSubmitHandler, DailyLog, User } from "@/lib/types";
import {
  calculateDailyStatEstimatesWithJournal,
  createEmptyStatXp,
  estimateJournalInsightXp,
  getStatProgress,
  statDefinitions,
} from "@/lib/xp";

type DashboardProps = {
  onViewChange: (view: AppView) => void;
  user: User;
};

export function Dashboard({ onViewChange, user }: DashboardProps) {
  const today = getTodayKey();
  const [dashboardData, setDashboardData] = useState(() => ({
    statXp: createEmptyStatXp(),
  }));
  const [dailyLog, setDailyLogDraft] = useState<DailyLog>(() =>
    createDefaultDailyLog(today),
  );
  const [journalText, setJournalText] = useState("");
  const journalWordCount = getJournalWordCount(journalText);
  const estimates = calculateDailyStatEstimatesWithJournal(
    dailyLog,
    journalWordCount,
  );
  const estimatedJournalXp = estimateJournalInsightXp(
    journalWordCount,
    estimates.modifier,
  );

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      const [nextDashboardData, nextDailyLog, nextJournalEntry] =
        await Promise.all([
          getDashboardData(user.id),
          getTodayLog(user.id),
          getJournalEntry(user.id, today),
        ]);

      if (!isMounted) {
        return;
      }

      setDashboardData(nextDashboardData);
      setDailyLogDraft(nextDailyLog);
      setJournalText(nextJournalEntry.text);
    }

    void loadDashboard();

    const unsubscribe = subscribeToFakeBackend(() => {
      void loadDashboard();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [today, user.id]);

  async function handleDailySubmit(event: AuthSubmitHandler) {
    event.preventDefault();
    await saveTodayLog(user.id, dailyLog);
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-lg border border-white/10 bg-black/35 p-6 shadow-2xl shadow-black/30 backdrop-blur">
        <p className="text-sm uppercase tracking-[0.24em] text-amber-200">
          Dashboard
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-6xl">
          Welcome, {user.name}
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-300">
          Treat today like an editable character sheet. Estimate XP and fatigue
          all day, then apply permanent XP later during an end-of-day check-in.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <TodayMetricCard
          label="XP Multiplier"
          value={`${estimates.modifier.multiplier.toFixed(2)}x`}
          detail={`Recovery score ${estimates.modifier.recoveryScore}/100`}
        />
        <TodayMetricCard
          label="Fatigue Change"
          value={`${estimates.fatigue.change > 0 ? "+" : ""}${
            estimates.fatigue.change
          }`}
          detail="Calculated from work, sleep, and diet"
        />
        <TodayMetricCard
          label="Recovery Status"
          value={formatRecoveryStatus(estimates.fatigue.status)}
          detail="Fatigue is separate from core stats"
        />
        <TodayMetricCard
          label="Journal"
          value={`${journalWordCount} words`}
          detail={`Est. ${estimatedJournalXp} Insight XP`}
        />
      </section>

      <section>
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-200">
              Six core stats
            </p>
            <h2 className="mt-2 text-3xl font-black text-white">
              Current build
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-zinc-400">
            Lifting, cardio, stretching, and journaling can affect multiple
            stats. Diet, sleep, and fatigue shape recovery and multiplier.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {statDefinitions.map((stat) => (
            <StatCard
              key={stat.key}
              progress={getStatProgress(dashboardData.statXp[stat.key])}
              stat={stat}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <DailyLogForm
          dailyLog={dailyLog}
          estimates={estimates}
          onDailyLogChange={setDailyLogDraft}
          onSubmit={handleDailySubmit}
          onWriteJournal={() => onViewChange("journal")}
        />
        <DailyLogSummary dailyLog={dailyLog} estimates={estimates} />
      </section>
    </div>
  );
}

function TodayMetricCard({
  detail,
  label,
  value,
}: {
  detail: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-zinc-900/70 p-5">
      <p className="text-sm uppercase tracking-[0.22em] text-zinc-500">
        {label}
      </p>
      <p className="mt-3 text-3xl font-black text-white">{value}</p>
      <p className="mt-2 text-sm text-zinc-400">{detail}</p>
    </div>
  );
}

function formatRecoveryStatus(status: string) {
  return status
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
