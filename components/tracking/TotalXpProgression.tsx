import { formatShortDate } from "@/lib/tracking";
import { getStatProgress } from "@/lib/xp";
import { SimpleBarChart } from "./SimpleBarChart";
import { SimpleLineChart } from "./SimpleLineChart";

type TotalXpProgressionProps = {
  points: {
    date: string;
    totalXp: number;
  }[];
};

export function TotalXpProgression({ points }: TotalXpProgressionProps) {
  const cumulativePoints = points.reduce<number[]>((totals, point) => {
    const previousTotal = totals.at(-1) ?? 0;

    return [...totals, previousTotal + point.totalXp];
  }, []);
  const levelPoints = cumulativePoints.map((point) => getStatProgress(point).level);

  return (
    <section className="rounded-lg border border-white/10 bg-zinc-900/75 p-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-200">
            Total progression
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">
            XP, level, and daily effort
          </h2>
        </div>
        <div className="flex gap-3 text-xs text-zinc-400">
          <span className="flex items-center gap-2">
            <span className="h-2 w-5 rounded-full bg-amber-200" />
            Total XP
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-5 rounded-full bg-sky-300" />
            Level
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="h-64 rounded-md border border-white/10 bg-black/25 p-3">
          <SimpleLineChart
            ariaLabel="Total XP over time"
            color="#fcd34d"
            height={220}
            points={cumulativePoints}
          />
        </div>
        <div className="grid gap-4">
          <div className="h-28 rounded-md border border-white/10 bg-black/25 p-3">
            <SimpleLineChart
              ariaLabel="Estimated level progression"
              color="#7dd3fc"
              height={96}
              points={levelPoints}
            />
          </div>
          <SimpleBarChart
            bars={points.map((point) => ({
              label: formatShortDate(point.date),
              tone: "bg-amber-200/80",
              value: point.totalXp,
            }))}
          />
        </div>
      </div>
    </section>
  );
}
