import type { DailyHistoryEntry } from "@/lib/types";
import {
  formatRecoveryStatus,
  formatShortDate,
  getDailyTotalXp,
  safeNumber,
} from "@/lib/tracking";
import { getRecoveryStatus } from "@/lib/xp";

type ActivityDetailTableProps = {
  history: DailyHistoryEntry[];
};

export function ActivityDetailTable({ history }: ActivityDetailTableProps) {
  return (
    <section className="rounded-lg border border-white/10 bg-zinc-900/75 p-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-200">
            Activity ledger
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">
            Day-by-day details
          </h2>
        </div>
        <p className="text-sm text-zinc-400">Scrollable on smaller screens.</p>
      </div>

      <div className="mt-5 hidden overflow-x-auto rounded-md border border-white/10 md:block">
        <table className="min-w-[980px] w-full border-collapse text-left text-sm">
          <thead className="bg-black/40 text-xs uppercase tracking-[0.16em] text-zinc-500">
            <tr>
              {[
                "Date",
                "Sleep",
                "Diet",
                "Lift",
                "Cardio",
                "Stretch",
                "Words",
                "XP",
                "Mult",
                "Fatigue",
                "Status",
              ].map((heading) => (
                <th className="px-3 py-3 font-bold" key={heading}>{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {history.map((entry) => (
              <tr className="bg-zinc-950/40" key={entry.date}>
                <td className="px-3 py-3 font-bold text-white">{formatShortDate(entry.date)}</td>
                <td className="px-3 py-3 text-zinc-300">{rating(entry.dailyLog?.sleepRating)}</td>
                <td className="px-3 py-3 text-zinc-300">{rating(entry.dailyLog?.dietRating)}</td>
                <td className="px-3 py-3 text-zinc-300">{activity(entry, "lifting")}</td>
                <td className="px-3 py-3 text-zinc-300">{activity(entry, "cardio")}</td>
                <td className="px-3 py-3 text-zinc-300">{activity(entry, "stretching")}</td>
                <td className="px-3 py-3 text-zinc-300">{safeNumber(entry.journalWordCount)}</td>
                <td className="px-3 py-3 font-black text-amber-100">{Math.round(getDailyTotalXp(entry))}</td>
                <td className="px-3 py-3 text-zinc-300">{safeNumber(entry.xpMultiplier).toFixed(2)}x</td>
                <td className="px-3 py-3 text-zinc-300">{formatSigned(safeNumber(entry.fatigueChange))}</td>
                <td className="px-3 py-3 text-zinc-300">{formatRecoveryStatus(getRecoveryStatus(safeNumber(entry.fatigueChange)))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 grid gap-3 md:hidden">
        {history.map((entry) => (
          <article className="rounded-md border border-white/10 bg-black/25 p-4" key={entry.date}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-black text-white">{formatShortDate(entry.date)}</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  {formatRecoveryStatus(getRecoveryStatus(safeNumber(entry.fatigueChange)))}
                </p>
              </div>
              <p className="text-xl font-black text-amber-100">
                {Math.round(getDailyTotalXp(entry))} XP
              </p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <MobileFact label="Sleep" value={rating(entry.dailyLog?.sleepRating)} />
              <MobileFact label="Diet" value={rating(entry.dailyLog?.dietRating)} />
              <MobileFact label="Lift" value={activity(entry, "lifting")} />
              <MobileFact label="Cardio" value={activity(entry, "cardio")} />
              <MobileFact label="Stretch" value={activity(entry, "stretching")} />
              <MobileFact label="Journal" value={`${safeNumber(entry.journalWordCount)} words`} />
              <MobileFact label="Multiplier" value={`${safeNumber(entry.xpMultiplier).toFixed(2)}x`} />
              <MobileFact label="Fatigue" value={formatSigned(safeNumber(entry.fatigueChange))} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function MobileFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-zinc-950/50 p-2">
      <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className="mt-1 font-bold text-zinc-200">{value}</p>
    </div>
  );
}

function activity(
  entry: DailyHistoryEntry,
  key: "lifting" | "cardio" | "stretching",
) {
  const item = entry.dailyLog?.activities?.[key];

  return item?.completed ? `${safeNumber(item.rating)}/10` : "Missed";
}

function rating(value: unknown) {
  return `${safeNumber(value)}/10`;
}

function formatSigned(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}`;
}
