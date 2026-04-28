import type { CoreStatName } from "@/lib/types";
import { formatShortDate } from "@/lib/tracking";
import { statDefinitions } from "@/lib/xp";
import { statToneClasses } from "./statStyles";

type DailyXpBreakdownProps = {
  points: {
    date: string;
    statXp: Record<CoreStatName, number>;
    totalXp: number;
  }[];
};

export function DailyXpBreakdown({ points }: DailyXpBreakdownProps) {
  const maxTotal = Math.max(...points.map((point) => point.totalXp), 1);

  return (
    <section className="rounded-lg border border-white/10 bg-zinc-900/75 p-5">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-200">
            Daily breakdown
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">
            Estimated XP by stat
          </h2>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-zinc-400">
          {statDefinitions.map((stat) => (
            <span className="flex items-center gap-2" key={stat.key}>
              <span className={`h-2 w-4 rounded-full ${statToneClasses[stat.key]}`} />
              {stat.name}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {points.map((point) => (
          <div className="grid gap-2 sm:grid-cols-[5rem_1fr_4rem] sm:items-center" key={point.date}>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
              {formatShortDate(point.date)}
            </p>
            <div className="flex h-7 overflow-hidden rounded-md border border-white/10 bg-black/30">
              {statDefinitions.map((stat) => {
                const value = point.statXp[stat.key];
                const width = point.totalXp > 0 ? (value / point.totalXp) * 100 : 0;

                return (
                  <div
                    className={statToneClasses[stat.key]}
                    key={stat.key}
                    style={{ width: `${width}%` }}
                    title={`${stat.name}: ${Math.round(value)} XP`}
                  />
                );
              })}
            </div>
            <p className="text-sm font-black text-amber-100 sm:text-right">
              {Math.round(point.totalXp)}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-4 h-1 rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-amber-200/70"
          style={{
            width: `${Math.min(100, (Math.max(...points.map((point) => point.totalXp), 0) / maxTotal) * 100)}%`,
          }}
        />
      </div>
    </section>
  );
}
