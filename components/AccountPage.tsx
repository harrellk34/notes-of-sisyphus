import type { User } from "@/lib/types";
import type { ReactNode } from "react";

export function AccountPage({ user }: { user: User }) {
  return (
    <section className="rounded-lg border border-white/10 bg-black/35 p-6 shadow-2xl shadow-black/30 backdrop-blur">
      <div className="border-b border-white/10 pb-5">
        <p className="text-sm uppercase tracking-[0.24em] text-amber-200">
          Account
        </p>
        <h1 className="mt-2 text-4xl font-black text-white">Profile shell</h1>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <AccountBlock title="Avatar">Profile picture placeholder</AccountBlock>
        <AccountBlock title="Display name">{user.name}</AccountBlock>
        <AccountBlock title="Email">{user.email}</AccountBlock>
        <AccountBlock title="Account stats">Level, streaks, and totals later</AccountBlock>
      </div>

      <p className="mt-6 rounded-md border border-amber-200/20 bg-amber-200/10 p-4 text-sm leading-6 text-amber-50">
        Later this will connect to real account data and backend auth.
      </p>
    </section>
  );
}

function AccountBlock({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-zinc-900/80 p-5">
      <p className="text-sm uppercase tracking-[0.22em] text-zinc-500">
        {title}
      </p>
      <p className="mt-3 font-bold text-white">{children}</p>
    </div>
  );
}
