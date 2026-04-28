type SimpleBarChartProps = {
  bars: {
    label: string;
    tone?: string;
    value: number;
  }[];
  max?: number;
};

export function SimpleBarChart({ bars, max }: SimpleBarChartProps) {
  const maxValue = Math.max(max ?? 0, ...bars.map((bar) => Math.abs(bar.value)), 1);

  return (
    <div className="flex h-28 items-end gap-1 rounded-md border border-white/10 bg-black/25 p-2">
      {bars.length > 0 ? (
        bars.map((bar) => (
          <div
            className="group flex h-full min-w-3 flex-1 items-end"
            key={bar.label}
            title={`${bar.label}: ${Math.round(bar.value)}`}
          >
            <div
              className={`w-full rounded-sm ${bar.tone ?? "bg-amber-200/75"}`}
              style={{
                height: `${Math.max(6, (Math.abs(bar.value) / maxValue) * 100)}%`,
              }}
            />
          </div>
        ))
      ) : (
        <p className="m-auto text-xs text-zinc-600">No chart data</p>
      )}
    </div>
  );
}
