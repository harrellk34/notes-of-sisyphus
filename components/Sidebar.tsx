import type { AppView } from "@/lib/types";

const navItems: { label: string; value: AppView }[] = [
  { label: "Dashboard", value: "dashboard" },
  { label: "Journal", value: "journal" },
  { label: "Tracking", value: "tracking" },
  { label: "Past Days", value: "past-days" },
  { label: "Account", value: "account" },
  { label: "Settings", value: "settings" },
];

type SidebarProps = {
  activeView: AppView;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  onViewChange: (view: AppView) => void;
};

export function Sidebar({
  activeView,
  collapsed,
  onCollapsedChange,
  onViewChange,
}: SidebarProps) {
  return (
    <aside
      className={`rounded-lg border border-white/10 bg-black/35 p-4 shadow-2xl shadow-black/30 backdrop-blur transition-all lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)] ${
        collapsed ? "lg:w-24" : "lg:w-72"
      }`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className={collapsed ? "lg:sr-only" : ""}>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-200">
            Sisyphus
          </p>
          <p className="mt-1 text-xs text-zinc-500">App navigation</p>
        </div>
        <button
          className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-white transition hover:border-amber-200/50 hover:bg-white/10"
          onClick={() => onCollapsedChange(!collapsed)}
          type="button"
        >
          {collapsed ? "Open" : "Close"}
        </button>
      </div>

      <nav className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {navItems.map((item) => {
          const isActive = activeView === item.value;

          return (
            <button
              className={`flex items-center gap-3 rounded-md px-3 py-3 text-left text-sm font-bold transition ${
                isActive
                  ? "bg-amber-200 text-zinc-950"
                  : "text-zinc-300 hover:bg-white/10 hover:text-white"
              }`}
              key={item.value}
              onClick={() => onViewChange(item.value)}
              type="button"
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded border text-xs ${
                  isActive
                    ? "border-zinc-950/20 bg-zinc-950/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                {item.label.slice(0, 2)}
              </span>
              <span className={collapsed ? "lg:sr-only" : ""}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
