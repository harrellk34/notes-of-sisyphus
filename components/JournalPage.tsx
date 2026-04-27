import { useSyncExternalStore } from "react";
import {
  getJournalSnapshot,
  getJournalWordCount,
  getServerJournalSnapshot,
  getTodayJournalStorageKey,
  getTodayKey,
  saveTodayJournal,
  subscribeToDashboard,
} from "@/lib/storage";
import type { User } from "@/lib/types";
import { estimateJournalInsightXp } from "@/lib/xp";

type JournalPageProps = {
  user: User;
};

export function JournalPage({ user }: JournalPageProps) {
  const today = getTodayKey();
  const storageKey = getTodayJournalStorageKey(user.email, today);
  const journalText = useSyncExternalStore(
    subscribeToDashboard,
    () => getJournalSnapshot(storageKey),
    getServerJournalSnapshot,
  );
  const wordCount = getJournalWordCount(journalText);
  const insightXp = estimateJournalInsightXp(wordCount);

  return (
    <section className="rounded-lg border border-white/10 bg-black/35 p-6 shadow-2xl shadow-black/30 backdrop-blur">
      <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-amber-200">
            Journal
          </p>
          <h1 className="mt-2 text-4xl font-black text-white">
            Today&apos;s reflection
          </h1>
        </div>
        <div className="rounded-md border border-white/10 bg-zinc-900/80 px-4 py-3 text-sm text-zinc-300">
          {wordCount} words · est. {insightXp} Insight XP
        </div>
      </div>

      <textarea
        className="mt-6 min-h-[26rem] w-full resize-none rounded-lg border border-white/10 bg-zinc-900/80 p-5 text-base leading-8 text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-200/60 focus:ring-2 focus:ring-amber-200/20"
        onChange={(event) => saveTodayJournal(storageKey, event.target.value)}
        placeholder="Write what happened, what you noticed, and what the next ascent asks of you."
        value={journalText}
      />

      <div className="mt-5 rounded-md border border-amber-200/20 bg-amber-200/10 p-4 text-sm leading-6 text-amber-50">
        Later, Insight XP may be based on journal word count, completion, and
        reflective depth. For now, this page saves today&apos;s entry locally and
        feeds word count back to the dashboard.
      </div>
    </section>
  );
}
