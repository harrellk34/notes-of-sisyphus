const graphCards = [
  "Strength progress",
  "Agility progress",
  "Stamina progress",
  "Vitality progress",
  "Willpower progress",
  "Insight progress",
  "XP multiplier trend",
  "Fatigue trend",
];

export function TrackingPage() {
  // TODO: Replace placeholder cards with persisted history graphs once daily settlements exist.
  return (
    <section className="rounded-lg border border-white/10 bg-black/35 p-6 shadow-2xl shadow-black/30 backdrop-blur">
      <div className="border-b border-white/10 pb-5">
        <p className="text-sm uppercase tracking-[0.24em] text-amber-200">
          Tracking
        </p>
        <h1 className="mt-2 text-4xl font-black text-white">
          Progress graphs
        </h1>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {graphCards.map((card) => (
          <div
            className="min-h-40 rounded-lg border border-white/10 bg-zinc-900/80 p-5"
            key={card}
          >
            <p className="font-bold text-white">{card}</p>
            <div className="mt-6 h-20 rounded-md border border-dashed border-white/15 bg-black/25" />
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-zinc-600">
              TODO: graph implementation
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
