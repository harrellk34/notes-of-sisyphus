export function EmptyTrackingState() {
  return (
    <section className="rounded-lg border border-white/10 bg-black/35 p-8 shadow-2xl shadow-black/30 backdrop-blur">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-200">
        Tracking
      </p>
      <h1 className="mt-3 text-4xl font-black text-white">No completed days yet</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300">
        Graphs appear after you complete daily check-ins. Your saved local
        history will power XP trends, consistency, fatigue, sleep, diet, and
        journal analytics here.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {["Complete a day", "Build a streak", "Watch the stone move"].map(
          (label) => (
            <div
              className="rounded-lg border border-dashed border-white/15 bg-zinc-900/60 p-4 text-sm font-bold text-zinc-300"
              key={label}
            >
              {label}
            </div>
          ),
        )}
      </div>
    </section>
  );
}
