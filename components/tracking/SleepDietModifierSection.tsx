import type { DailyHistoryEntry } from "@/lib/types";
import { safeNumber } from "@/lib/tracking";
import { SimpleLineChart } from "./SimpleLineChart";

type SleepDietModifierSectionProps = {
  history: DailyHistoryEntry[];
};

export function SleepDietModifierSection({
  history,
}: SleepDietModifierSectionProps) {
  const sleepRatings = history.map((entry) => safeNumber(entry.dailyLog?.sleepRating));
  const dietRatings = history.map((entry) => safeNumber(entry.dailyLog?.dietRating));
  const multipliers = history.map((entry) => safeNumber(entry.xpMultiplier));
  const averageSleep = average(sleepRatings);
  const averageDiet = average(dietRatings);
  const averageMultiplier = average(multipliers);
  const multiplierDelta = averageMultiplier - 1;

  return (
    <section className="rounded-lg border border-white/10 bg-zinc-900/75 p-5">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-200">
            Sleep and diet
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">
            Recovery modifiers and XP multiplier
          </h2>
        </div>
        <p className="text-sm text-zinc-400">
          Avg multiplier impact:{" "}
          <span className="font-black text-amber-100">
            {multiplierDelta >= 0 ? "+" : ""}
            {(multiplierDelta * 100).toFixed(0)}%
          </span>
        </p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <ModifierPanel
          color="#7dd3fc"
          label="Sleep trend"
          points={sleepRatings}
          value={`${averageSleep.toFixed(1)}/10 avg`}
        />
        <ModifierPanel
          color="#bef264"
          label="Diet trend"
          points={dietRatings}
          value={`${averageDiet.toFixed(1)}/10 avg`}
        />
        <ModifierPanel
          color="#fcd34d"
          label="XP multiplier"
          points={multipliers}
          value={`${averageMultiplier.toFixed(2)}x avg`}
        />
      </div>
    </section>
  );
}

function ModifierPanel({
  color,
  label,
  points,
  value,
}: {
  color: string;
  label: string;
  points: number[];
  value: string;
}) {
  return (
    <div className="rounded-md border border-white/10 bg-black/25 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-black text-white">{label}</h3>
        <p className="text-sm font-bold text-zinc-300">{value}</p>
      </div>
      <div className="mt-4 h-32">
        <SimpleLineChart ariaLabel={label} color={color} points={points} />
      </div>
    </div>
  );
}

function average(values: number[]) {
  return values.length > 0
    ? values.reduce((total, value) => total + value, 0) / values.length
    : 0;
}
