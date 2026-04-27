const settings = [
  "Font size",
  "Light/dark mode",
  "Reduced motion",
  "Dashboard density",
  "XP display preferences",
];

export function SettingsPage() {
  return (
    <section className="rounded-lg border border-white/10 bg-black/35 p-6 shadow-2xl shadow-black/30 backdrop-blur">
      <div className="border-b border-white/10 pb-5">
        <p className="text-sm uppercase tracking-[0.24em] text-amber-200">
          Settings
        </p>
        <h1 className="mt-2 text-4xl font-black text-white">
          Future controls
        </h1>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {settings.map((setting) => (
          <label
            className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-zinc-900/80 p-5"
            key={setting}
          >
            <span>
              <span className="block font-bold text-white">{setting}</span>
              <span className="mt-1 block text-sm text-zinc-500">
                Placeholder setting
              </span>
            </span>
            <input className="h-4 w-4 accent-amber-200" type="checkbox" />
          </label>
        ))}
      </div>
    </section>
  );
}
