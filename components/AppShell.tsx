import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import type { ReactNode } from "react";
import type { AppView, User } from "@/lib/types";

type AppShellProps = {
  activeView: AppView;
  children: ReactNode;
  onLogout: () => void;
  onViewChange: (view: AppView) => void;
  user: User;
};

export function AppShell({
  activeView,
  children,
  onLogout,
  onViewChange,
  user,
}: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
      <Sidebar
        activeView={activeView}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        onViewChange={onViewChange}
      />

      <div className="min-w-0">
        <header className="mb-6 flex flex-col justify-between gap-4 rounded-lg border border-white/10 bg-black/25 p-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-amber-200">
              Logged in
            </p>
            <p className="mt-1 text-lg font-bold text-white">{user.name}</p>
            <p className="text-sm text-zinc-500">{user.email}</p>
          </div>
          <button
            className="rounded-md border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:border-amber-200/50 hover:bg-white/10"
            onClick={onLogout}
            type="button"
          >
            Logout
          </button>
        </header>

        {children}
      </div>
    </div>
  );
}
