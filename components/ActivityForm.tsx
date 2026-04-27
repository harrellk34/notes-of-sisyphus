import type {
  AuthSubmitHandler,
  DailyActivityEntry,
  DailyActivityType,
  DailyLog,
  StatXpEstimate,
} from "@/lib/types";
import {
  dailyActivityTypes,
  effortRatings,
  formatActivityType,
} from "@/lib/xp";

type ActivityFormProps = {
  dailyLog: DailyLog;
  estimates: StatXpEstimate;
  onDailyLogChange: (dailyLog: DailyLog) => void;
  onWriteJournal: () => void;
  onSubmit: (event: AuthSubmitHandler) => void;
};

export function ActivityForm({
  dailyLog,
  estimates,
  onDailyLogChange,
  onWriteJournal,
  onSubmit,
}: ActivityFormProps) {
  function updateActivity(
    activityType: DailyActivityType,
    activity: DailyActivityEntry,
  ) {
    onDailyLogChange({
      ...dailyLog,
      activities: {
        ...dailyLog.activities,
        [activityType]: activity,
      },
    });
  }

  return (
    <form
      className="rounded-lg border border-white/10 bg-black/35 p-6 shadow-2xl shadow-black/30 backdrop-blur"
      onSubmit={onSubmit}
    >
      <div className="border-b border-white/10 pb-5">
        <p className="text-sm uppercase tracking-[0.24em] text-amber-200">
          Today
        </p>
        <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <h2 className="text-2xl font-bold text-white">
            Update the daily ledger
          </h2>
          <button
            className="rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold text-white transition hover:border-amber-200/50 hover:bg-white/10"
            onClick={onWriteJournal}
            type="button"
          >
            Write Journal
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {dailyActivityTypes.map((activityType) => {
          const activity = dailyLog.activities[activityType];

          return (
            <div
              className="grid gap-3 rounded-md border border-white/10 bg-zinc-900/80 p-4 sm:grid-cols-[1fr_8rem]"
              key={activityType}
            >
              <label className="flex items-center gap-3">
                <input
                  checked={activity.completed}
                  className="h-4 w-4 accent-amber-200"
                  onChange={(event) =>
                    updateActivity(activityType, {
                      ...activity,
                      completed: event.target.checked,
                    })
                  }
                  type="checkbox"
                />
                <span>
                  <span className="block font-bold text-white">
                    {formatActivityType(activityType)}
                  </span>
                  <span className="block text-sm text-zinc-500">
                    {activityType === "lifting" && "Strength plus Stamina XP"}
                    {activityType === "cardio" && "Stamina plus Strength XP"}
                    {activityType === "stretching" &&
                      "Agility, tiny Vitality, less fatigue"}
                  </span>
                </span>
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Rating
                </span>
                <select
                  className="mt-1 w-full rounded-md border border-white/10 bg-black/35 px-3 py-2 text-white outline-none transition focus:border-amber-200/60 focus:ring-2 focus:ring-amber-200/20"
                  onChange={(event) =>
                    updateActivity(activityType, {
                      ...activity,
                      rating: Number(event.target.value),
                    })
                  }
                  value={activity.rating}
                >
                  {effortRatings.map((rating) => (
                    <option key={rating} value={rating}>
                      {rating}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <RatingField
          label="Diet"
          onChange={(value) =>
            onDailyLogChange({ ...dailyLog, dietRating: value })
          }
          value={dailyLog.dietRating}
        />
        <RatingField
          label="Sleep"
          onChange={(value) =>
            onDailyLogChange({ ...dailyLog, sleepRating: value })
          }
          value={dailyLog.sleepRating}
        />
      </div>

      <label className="mt-5 block">
        <span className="text-sm font-semibold text-zinc-300">Notes</span>
        <textarea
          className="mt-2 min-h-28 w-full resize-none rounded-md border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-200/60 focus:ring-2 focus:ring-amber-200/20"
          onChange={(event) =>
            onDailyLogChange({ ...dailyLog, notes: event.target.value })
          }
          placeholder="What did today ask of you? How did recovery feel?"
          value={dailyLog.notes}
        />
      </label>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-amber-200/20 bg-amber-200/10 p-4 text-sm text-amber-50">
          Estimated XP multiplier:{" "}
          <span className="font-black">
            {estimates.modifier.multiplier.toFixed(2)}x
          </span>
        </div>
        <div className="rounded-md border border-white/10 bg-black/25 p-4 text-sm text-zinc-300">
          Estimated fatigue change:{" "}
          <span className="font-black text-white">
            {estimates.fatigue.change > 0 ? "+" : ""}
            {estimates.fatigue.change}
          </span>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-zinc-500">
        Saving updates today&apos;s editable log only. Permanent XP will be
        applied by a future end-of-day confirmation.
      </p>

      <button
        className="mt-5 w-full rounded-md bg-amber-200 px-7 py-4 text-base font-bold text-zinc-950 shadow-[0_0_30px_rgba(251,191,36,0.24)] transition hover:bg-amber-100"
        type="submit"
      >
        Save Daily Log
      </button>
    </form>
  );
}

function RatingField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-zinc-300">{label}</span>
      <select
        className="mt-2 w-full rounded-md border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-amber-200/60 focus:ring-2 focus:ring-amber-200/20"
        onChange={(event) => onChange(Number(event.target.value))}
        value={value}
      >
        {effortRatings.map((rating) => (
          <option key={rating} value={rating}>
            {rating}
          </option>
        ))}
      </select>
    </label>
  );
}
