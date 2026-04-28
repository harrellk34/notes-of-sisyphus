import type { HabitMetric } from "@/lib/tracking";

type HabitConsistencyCardProps = {
  metric: HabitMetric;
};

export function HabitConsistencyCard({ metric }: HabitConsistencyCardProps) {
  const completionText = `${metric.completedDays}/${metric.totalDays || 0}`;

  return (
    <article className="rounded-lg border border-white/10 bg-zinc-900/75 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-black text-white">{metric.label}</h3>
          <p className="mt-1 text-sm text-zinc-500">Days completed</p>
        </div>
        <p className="text-xl font-black text-amber-100">{completionText}</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-md border border-white/10 bg-black/25 p-2">
          <p className="text-zinc-500">Current</p>
          <p className="font-bold text-white">{metric.currentStreak} day</p>
        </div>
        <div className="rounded-md border border-white/10 bg-black/25 p-2">
          <p className="text-zinc-500">Best</p>
          <p className="font-bold text-white">{metric.bestStreak} day</p>
        </div>
      </div>

      <div className="mt-4 flex h-9 items-end gap-1 rounded-md border border-white/10 bg-black/25 p-1.5">
        {metric.history.map((completed, index) => (
          <div
            className={`h-full flex-1 rounded-sm ${
              completed ? "bg-emerald-300/80" : "bg-zinc-800"
            }`}
            key={`${metric.key}-${index}`}
          />
        ))}
      </div>

      <p className="mt-3 text-sm text-zinc-400">
        {metric.key === "journaling"
          ? `${metric.totalWords} words total, ${Math.round(
              metric.averageWords ?? 0,
            )} avg on journaling days`
          : `Average rating ${
              metric.averageRating ? metric.averageRating.toFixed(1) : "0.0"
            }/10`}
      </p>
    </article>
  );
}
