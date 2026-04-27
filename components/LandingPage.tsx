import { AuthCard } from "@/components/AuthCard";
import type { AuthMode, AuthSubmitHandler } from "@/lib/types";

const pillars = ["Lifting", "Stretching", "Cardio", "Journaling", "Diet", "Sleep"];

type LandingPageProps = {
  authMode: AuthMode;
  email: string;
  name: string;
  onAuthModeChange: (mode: AuthMode) => void;
  onEmailChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: AuthSubmitHandler) => void;
  password: string;
};

export function LandingPage(props: LandingPageProps) {
  return (
    <div className="grid flex-1 items-center gap-10 py-8 lg:grid-cols-[1.08fr_0.92fr]">
      <section className="max-w-3xl">
        <div className="mb-5 inline-flex rounded-full border border-amber-200/20 bg-amber-200/10 px-4 py-2 text-sm font-medium text-amber-100">
          Forge your daily rituals into character progression
        </div>
        <h1 className="text-5xl font-black tracking-tight text-white sm:text-7xl lg:text-8xl">
          Notes of Sisyphus
        </h1>
        <p className="mt-5 text-2xl font-semibold text-amber-100 sm:text-3xl">
          Turn discipline into progression.
        </p>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
          A dark fantasy fitness and habit tracker where lifting, stretching,
          cardio, journaling, diet, and sleep become RPG actions. Earn stat XP
          through effort, consistency, rest, and lifestyle modifiers.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {pillars.map((pillar) => (
            <div
              className="rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-zinc-200"
              key={pillar}
            >
              {pillar}
            </div>
          ))}
        </div>

        <figure className="mt-8 rounded-lg border border-white/10 bg-black/30 p-5">
          <blockquote className="text-xl font-semibold leading-8 text-white">
            &quot;One must imagine Sisyphus happy.&quot;
          </blockquote>
          <figcaption className="mt-3 text-sm uppercase tracking-[0.22em] text-zinc-500">
            Albert Camus
          </figcaption>
        </figure>
      </section>

      <AuthCard {...props} />
    </div>
  );
}
