type MetricCardProps = {
  detail?: string;
  label: string;
  tone?: "amber" | "emerald" | "red" | "sky" | "violet" | "zinc";
  value: string;
};

const toneClasses = {
  amber: "border-amber-300/25 bg-amber-300/5 text-amber-100",
  emerald: "border-emerald-300/25 bg-emerald-300/5 text-emerald-100",
  red: "border-red-300/25 bg-red-300/5 text-red-100",
  sky: "border-sky-300/25 bg-sky-300/5 text-sky-100",
  violet: "border-violet-300/25 bg-violet-300/5 text-violet-100",
  zinc: "border-white/10 bg-zinc-900/75 text-white",
};

export function MetricCard({
  detail,
  label,
  tone = "zinc",
  value,
}: MetricCardProps) {
  return (
    <div className={`rounded-lg border p-4 ${toneClasses[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
        {label}
      </p>
      <p className="mt-3 text-2xl font-black">{value}</p>
      {detail ? (
        <p className="mt-2 text-sm leading-5 text-zinc-400">{detail}</p>
      ) : null}
    </div>
  );
}
