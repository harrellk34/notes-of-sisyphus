import { useEffect, useState } from "react";
import {
  getUserSettings,
  saveUserSettings,
  subscribeToFakeBackend,
} from "@/lib/fakeBackend";
import type { User, UserSettings } from "@/lib/types";

const settingRows = [
  "Font size",
  "Light/dark mode",
  "Reduced motion",
  "Dashboard density",
  "XP display preferences",
];

const defaultSettings: UserSettings = {
  dashboardDensity: "comfortable",
  fontSize: "normal",
  reducedMotion: false,
  theme: "dark",
  xpDisplay: "total",
};

export function SettingsPage({ user }: { user: User }) {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);

  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      const nextSettings = await getUserSettings(user.id);

      if (isMounted) {
        setSettings(nextSettings);
      }
    }

    void loadSettings();

    const unsubscribe = subscribeToFakeBackend(() => {
      void loadSettings();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [user.id]);

  function updateSettings(nextSettings: UserSettings) {
    setSettings(nextSettings);
    void saveUserSettings(user.id, nextSettings);
  }

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
        {settingRows.map((setting) => (
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
            <input
              checked={getSettingChecked(setting, settings)}
              className="h-4 w-4 accent-amber-200"
              onChange={() => updateSettings(toggleSetting(setting, settings))}
              type="checkbox"
            />
          </label>
        ))}
      </div>
    </section>
  );
}

function getSettingChecked(setting: string, settings: UserSettings) {
  if (setting === "Font size") {
    return settings.fontSize === "large";
  }

  if (setting === "Light/dark mode") {
    return settings.theme === "light";
  }

  if (setting === "Reduced motion") {
    return settings.reducedMotion;
  }

  if (setting === "Dashboard density") {
    return settings.dashboardDensity === "compact";
  }

  return settings.xpDisplay === "level";
}

function toggleSetting(setting: string, settings: UserSettings): UserSettings {
  if (setting === "Font size") {
    return {
      ...settings,
      fontSize: settings.fontSize === "normal" ? "large" : "normal",
    };
  }

  if (setting === "Light/dark mode") {
    return {
      ...settings,
      theme: settings.theme === "dark" ? "light" : "dark",
    };
  }

  if (setting === "Reduced motion") {
    return {
      ...settings,
      reducedMotion: !settings.reducedMotion,
    };
  }

  if (setting === "Dashboard density") {
    return {
      ...settings,
      dashboardDensity:
        settings.dashboardDensity === "comfortable" ? "compact" : "comfortable",
    };
  }

  return {
    ...settings,
    xpDisplay: settings.xpDisplay === "total" ? "level" : "total",
  };
}
