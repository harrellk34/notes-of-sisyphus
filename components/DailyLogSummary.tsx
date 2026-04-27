import type { DailyLog, RecoveryStatus, StatXpEstimate } from "@/lib/types";
import {
  dailyActivityTypes,
  formatActivityType,
  statDefinitions,
} from "@/lib/xp";

type DailyLogSummaryProps = {
  dailyLog: DailyLog;
  estimates: StatXpEstimate;
};

export function DailyLogSummary({
  dailyLog,
  estimates,
}: DailyLogSummaryProps) {
  return (
    <section className="rounded-lg border border-white/10 bg-zinc-900/70 p-6">
      <div className="border-b border-white/10 pb-5">
        <p className="text-sm uppercase tracking-[0.24em] text-amber-200">
          Daily Log
        </p>
        <h2 className="mt-2 text-2xl font-bold text-white">
          Today&apos;s estimates
        </h2>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <SummaryTile
          label="Multiplier"
          value={`${estimates.modifier.multiplier.toFixed(2)}x`}
        />
        <SummaryTile
          label="Fatigue"
          value={`${estimates.fatigue.change > 0 ? "+" : ""}${
            estimates.fatigue.change
          }`}
        />
        <SummaryTile
          label="Recovery"
          value={formatRecoveryStatus(estimates.fatigue.status)}
        />
      </div>

      <div className="mt-6">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">
          Entered today
        </p>
        <div className="mt-3 space-y-2">
          {dailyActivityTypes.map((activityType) => {
            const activity = dailyLog.activities[activityType];

            return (
              <div
                className="flex items-center justify-between rounded-md border border-white/10 bg-black/25 px-4 py-3 text-sm"
                key={activityType}
              >
                <span className="font-bold text-white">
                  {formatActivityType(activityType)}
                </span>
                <span className="text-zinc-400">
                  {activity.completed ? `Rating ${activity.rating}/10` : "Open"}
                </span>
              </div>
            );
          })}
          <div className="flex items-center justify-between rounded-md border border-white/10 bg-black/25 px-4 py-3 text-sm">
            <span className="font-bold text-white">Journal</span>
            <span className="text-zinc-400">
              {estimates.journalWordCount} words
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">
          Estimated XP by stat
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {statDefinitions.map((stat) => (
            <div
              className="rounded-md border border-white/10 bg-black/25 p-3"
              key={stat.key}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-bold text-white">{stat.name}</span>
                <span className="text-sm font-black text-amber-100">
                  +{estimates.statXp[stat.key]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-md border border-white/10 bg-black/25 p-4 text-sm leading-6 text-zinc-400">
        Diet {dailyLog.dietRating}/10 and sleep {dailyLog.sleepRating}/10 are
        shaping Vitality, recovery, and the XP multiplier. Journaling is still a
        rating input for now.
      </div>
    </section>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/25 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-xl font-black text-white">{value}</p>
    </div>
  );
}

function formatRecoveryStatus(status: RecoveryStatus) {
  return status
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
