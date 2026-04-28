import {
  formatRecoveryStatus,
  formatShortDate,
  getBestRecoveryDay,
  getHighestFatigueDay,
  getRecoveryStatusCounts,
  safeNumber,
} from "@/lib/tracking";
import type { DailyHistoryEntry } from "@/lib/types";
import { SimpleBarChart } from "./SimpleBarChart";
import { SimpleLineChart } from "./SimpleLineChart";

type FatigueRecoveryChartProps = {
  averageFatigueChange: number;
  history: DailyHistoryEntry[];
};

export function FatigueRecoveryChart({
  averageFatigueChange,
  history,
}: FatigueRecoveryChartProps) {
  const bestRecoveryDay = getBestRecoveryDay(history);
  const highestFatigueDay = getHighestFatigueDay(history);
  const counts = getRecoveryStatusCounts(history);

  return (
    <section className="rounded-lg border border-white/10 bg-zinc-900/75 p-5">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-200">
            Fatigue and recovery
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">
            Load, sleep, diet, and recovery pressure
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-zinc-400">
          Fatigue is calculated from activities, sleep, and diet. It is not
          manually entered.
        </p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-md border border-white/10 bg-black/25 p-3">
          <SimpleLineChart
            ariaLabel="Fatigue trend over time"
            color="#fb7185"
            height={170}
            points={history.map((entry) => safeNumber(entry.fatigueChange))}
          />
        </div>
        <SimpleBarChart
          bars={history.map((entry) => ({
            label: formatShortDate(entry.date),
            tone: entry.fatigueChange <= 0 ? "bg-emerald-300/80" : "bg-red-300/80",
            value: Math.abs(entry.fatigueChange),
          }))}
        />
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-5">
        <FatigueFact label="Avg change" value={formatSigned(averageFatigueChange)} />
        <FatigueFact
          label="Best recovery"
          value={
            bestRecoveryDay
              ? `${formatShortDate(bestRecoveryDay.date)} ${formatSigned(bestRecoveryDay.fatigueChange)}`
              : "None"
          }
        />
        <FatigueFact
          label="Highest build"
          value={
            highestFatigueDay
              ? `${formatShortDate(highestFatigueDay.date)} ${formatSigned(highestFatigueDay.fatigueChange)}`
              : "None"
          }
        />
        {Object.entries(counts).map(([status, count]) => (
          <FatigueFact
            key={status}
            label={formatRecoveryStatus(status as keyof typeof counts)}
            value={`${count}`}
          />
        ))}
      </div>
    </section>
  );
}

function FatigueFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/25 p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className="mt-2 text-lg font-black text-white">{value}</p>
    </div>
  );
}

function formatSigned(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}`;
}
