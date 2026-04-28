import type { CoreStatName } from "@/lib/types";

export const statToneClasses: Record<CoreStatName, string> = {
  agility: "bg-emerald-300/80",
  insight: "bg-amber-200/85",
  stamina: "bg-sky-300/80",
  strength: "bg-red-400/80",
  vitality: "bg-lime-300/80",
  willpower: "bg-violet-300/80",
};

export const statTextClasses: Record<CoreStatName, string> = {
  agility: "text-emerald-100",
  insight: "text-amber-100",
  stamina: "text-sky-100",
  strength: "text-red-100",
  vitality: "text-lime-100",
  willpower: "text-violet-100",
};

export const statChartColors: Record<CoreStatName, string> = {
  agility: "#6ee7b7",
  insight: "#fde68a",
  stamina: "#7dd3fc",
  strength: "#f87171",
  vitality: "#bef264",
  willpower: "#c4b5fd",
};
