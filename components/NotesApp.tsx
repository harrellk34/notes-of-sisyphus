"use client";

import { useEffect, useState } from "react";
import { AccountPage } from "@/components/AccountPage";
import { AppShell } from "@/components/AppShell";
import { Dashboard } from "@/components/Dashboard";
import { JournalPage } from "@/components/JournalPage";
import { LandingPage } from "@/components/LandingPage";
import { PastDaysPage } from "@/components/PastDaysPage";
import { ProgressTrackingPage } from "@/components/ProgressTrackingPage";
import { SettingsPage } from "@/components/SettingsPage";
import {
  createFakeUser,
  getCurrentUser,
  loginFakeUser,
  logoutFakeUser,
  subscribeToFakeBackend,
} from "@/lib/fakeBackend";
import type { AppView, AuthMode, AuthSubmitHandler, User } from "@/lib/types";

export function NotesApp() {
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentView, setCurrentView] = useState<AppView>("dashboard");

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      const currentUser = await getCurrentUser();

      if (isMounted) {
        setUser(currentUser);
      }
    }

    void loadUser();

    const unsubscribe = subscribeToFakeBackend(() => {
      void loadUser();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  async function handleAuthSubmit(event: AuthSubmitHandler) {
    event.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedName = name.trim();

    if (!trimmedEmail || !password) {
      return;
    }

    if (authMode === "create" && !trimmedName) {
      return;
    }

    const authenticatedUser =
      authMode === "create"
        ? await createFakeUser(trimmedName, trimmedEmail, password)
        : await loginFakeUser(trimmedEmail, password);

    if (authenticatedUser) {
      setUser(authenticatedUser);
      setPassword("");
    }
  }

  async function handleLogout() {
    await logoutFakeUser();
    setUser(null);
    setName("");
    setEmail("");
    setPassword("");
    setAuthMode("login");
    setCurrentView("dashboard");
  }

  return (
    <main className="min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <section className="relative isolate min-h-screen px-6 py-8 sm:px-8 lg:px-12">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.2),transparent_34%),radial-gradient(circle_at_top_right,rgba(234,179,8,0.15),transparent_30%),radial-gradient(circle_at_bottom,rgba(20,184,166,0.08),transparent_32%),linear-gradient(135deg,rgba(24,24,27,0.95),rgba(9,9,11,1)_58%)]" />
        <div className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-amber-300/60 to-transparent" />

        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col gap-10">
          <header className="flex items-center justify-between border-b border-white/10 pb-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-200">
                Notes of Sisyphus
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Mythic training log
              </p>
            </div>
          </header>

          {user ? (
            <AppShell
              activeView={currentView}
              onLogout={handleLogout}
              onViewChange={setCurrentView}
              user={user}
            >
              {currentView === "dashboard" && (
                <Dashboard user={user} onViewChange={setCurrentView} />
              )}
              {currentView === "journal" && <JournalPage user={user} />}
              {currentView === "tracking" && (
                <ProgressTrackingPage user={user} />
              )}
              {currentView === "past-days" && <PastDaysPage user={user} />}
              {currentView === "account" && <AccountPage user={user} />}
              {currentView === "settings" && <SettingsPage user={user} />}
            </AppShell>
          ) : (
            <LandingPage
              authMode={authMode}
              email={email}
              name={name}
              onAuthModeChange={setAuthMode}
              onEmailChange={setEmail}
              onNameChange={setName}
              onPasswordChange={setPassword}
              onSubmit={handleAuthSubmit}
              password={password}
            />
          )}
        </div>
      </section>
    </main>
  );
}
