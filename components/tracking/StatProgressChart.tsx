import type { DailyHistoryEntry, StatDefinition } from "@/lib/types";
import { formatShortDate, getBestStatDay, safeNumber } from "@/lib/tracking";
import { getStatProgress } from "@/lib/xp";
import { SimpleBarChart } from "./SimpleBarChart";
import { statChartColors, statTextClasses, statToneClasses } from "./statStyles";

type StatProgressChartProps = {
  currentTotalXp: number;
  dailyPoints: {
    date: string;
    value: number;
  }[];
  rangeHistory: DailyHistoryEntry[];
  stat: StatDefinition;
  totalRangeXp: number;
};

export function StatProgressChart({
  currentTotalXp,
  dailyPoints,
  rangeHistory,
  stat,
  totalRangeXp,
}: StatProgressChartProps) {
  const progress = getStatProgress(currentTotalXp);
  const bestDay = getBestStatDay(rangeHistory, stat.key);
  const bestDayXp = bestDay ? safeNumber(bestDay.estimatedXp?.[stat.key]) : 0;

  return (
    <article className="rounded-lg border border-white/10 bg-zinc-900/75 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className={`text-xl font-black ${statTextClasses[stat.key]}`}>
            {stat.name}
          </h3>
          <p className="mt-2 text-sm leading-6 text-zinc-400">{stat.focus}</p>
        </div>
        <div className="rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm font-black text-white">
          Lv {progress.level}
        </div>
      </div>

      <div className="mt-5 h-2 rounded-full bg-black/40">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${stat.accent}`}
          style={{ width: `${progress.progress}%` }}
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-400">
        <span>{Math.round(progress.currentXp)} / {progress.xpNeeded} XP</span>
        <span className="text-zinc-600">|</span>
        <span>{Math.round(totalRangeXp)} XP in range</span>
      </div>

      <div className="mt-5">
        <SimpleBarChart
          bars={dailyPoints.map((point) => ({
            label: formatShortDate(point.date),
            tone: statToneClasses[stat.key],
            value: point.value,
          }))}
        />
      </div>

      <div className="mt-4 rounded-md border border-white/10 bg-black/25 p-3 text-sm text-zinc-400">
        <p>
          Best day:{" "}
          <span className="font-bold text-white">
            {bestDay ? formatShortDate(bestDay.date) : "None"}
          </span>{" "}
          <span className="text-zinc-500">({Math.round(bestDayXp)} XP)</span>
        </p>
        <p className="mt-1">
          Actions: <span style={{ color: statChartColors[stat.key] }}>{stat.focus}</span>.
        </p>
      </div>
    </article>
  );
}
