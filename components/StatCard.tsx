import type { StatDefinition, StatProgress } from "@/lib/types";

type StatCardProps = {
  progress: StatProgress;
  stat: StatDefinition;
};

export function StatCard({ progress, stat }: StatCardProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-zinc-900/80 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white">{stat.name}</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-400">{stat.focus}</p>
        </div>
        <div className="rounded-md bg-white/5 px-3 py-2 text-sm font-black text-amber-100">
          Lv {progress.level}
        </div>
      </div>
      <div className="mt-5 h-2 rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${stat.accent}`}
          style={{ width: `${progress.progress}%` }}
        />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-md border border-white/10 bg-black/25 p-3">
          <p className="text-zinc-500">Level XP</p>
          <p className="mt-1 font-bold text-white">{progress.currentXp}</p>
        </div>
        <div className="rounded-md border border-white/10 bg-black/25 p-3">
          <p className="text-zinc-500">Next level</p>
          <p className="mt-1 font-bold text-white">{progress.xpNeeded}</p>
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-zinc-500">
        Est. daily decay at this level: {progress.estimatedDailyDecay} XP
      </p>
    </div>
  );
}
