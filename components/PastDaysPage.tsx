import { useState } from "react";

const mockDays = Array.from({ length: 35 }, (_, index) => ({
  day: index + 1,
  intensity: index % 7 === 0 ? 0 : (index % 4) + 1,
}));

const intensityClasses = [
  "bg-zinc-900",
  "bg-emerald-950",
  "bg-emerald-800",
  "bg-emerald-600",
  "bg-amber-300",
];

export function PastDaysPage() {
  const [selectedDay, setSelectedDay] = useState(mockDays[0]);

  return (
    <section className="rounded-lg border border-white/10 bg-black/35 p-6 shadow-2xl shadow-black/30 backdrop-blur">
      <div className="border-b border-white/10 pb-5">
        <p className="text-sm uppercase tracking-[0.24em] text-amber-200">
          Past Days
        </p>
        <h1 className="mt-2 text-4xl font-black text-white">
          Calendar memory
        </h1>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="grid grid-cols-7 gap-2 rounded-lg border border-white/10 bg-zinc-900/70 p-4">
          {mockDays.map((day) => (
            <button
              className={`aspect-square rounded border border-white/10 text-xs font-bold text-white transition hover:ring-2 hover:ring-amber-200/40 ${
                intensityClasses[day.intensity]
              }`}
              key={day.day}
              onClick={() => setSelectedDay(day)}
              type="button"
            >
              {day.day}
            </button>
          ))}
        </div>

        <div className="rounded-lg border border-white/10 bg-zinc-900/80 p-5">
          <p className="text-sm uppercase tracking-[0.22em] text-zinc-500">
            Selected day
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white">
            Day {selectedDay.day}
          </h2>
          <div className="mt-5 space-y-3 text-sm text-zinc-400">
            <p>Sleep: placeholder</p>
            <p>Diet: placeholder</p>
            <p>Lifting/Cardio/Stretching: placeholder</p>
            <p>Journal word count: placeholder</p>
            <p>Estimated XP and fatigue: placeholder</p>
          </div>
        </div>
      </div>
    </section>
  );
}
