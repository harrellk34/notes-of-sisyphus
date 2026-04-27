import type { AuthMode, AuthSubmitHandler } from "@/lib/types";

type AuthCardProps = {
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

export function AuthCard({
  authMode,
  email,
  name,
  onAuthModeChange,
  onEmailChange,
  onNameChange,
  onPasswordChange,
  onSubmit,
  password,
}: AuthCardProps) {
  const isCreatingAccount = authMode === "create";

  return (
    <section className="rounded-lg border border-white/10 bg-black/40 p-6 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="border-b border-white/10 pb-5">
        <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">
          Enter the ledger
        </p>
        <h2 className="mt-2 text-2xl font-bold text-white">
          {isCreatingAccount ? "Create your account" : "Welcome back"}
        </h2>
      </div>

      <div className="mt-6 grid grid-cols-2 rounded-md border border-white/10 bg-zinc-900 p-1">
        <button
          className={`rounded px-4 py-3 text-sm font-bold transition ${
            authMode === "login"
              ? "bg-amber-200 text-zinc-950"
              : "text-zinc-400 hover:text-white"
          }`}
          onClick={() => onAuthModeChange("login")}
          type="button"
        >
          Login
        </button>
        <button
          className={`rounded px-4 py-3 text-sm font-bold transition ${
            authMode === "create"
              ? "bg-amber-200 text-zinc-950"
              : "text-zinc-400 hover:text-white"
          }`}
          onClick={() => onAuthModeChange("create")}
          type="button"
        >
          Create Account
        </button>
      </div>

      <form className="mt-6 space-y-5" onSubmit={onSubmit}>
        {isCreatingAccount && (
          <label className="block">
            <span className="text-sm font-semibold text-zinc-300">Name</span>
            <input
              className="mt-2 w-full rounded-md border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-200/60 focus:ring-2 focus:ring-amber-200/20"
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="Sisyphus"
              required={isCreatingAccount}
              type="text"
              value={name}
            />
          </label>
        )}

        <label className="block">
          <span className="text-sm font-semibold text-zinc-300">Email</span>
          <input
            className="mt-2 w-full rounded-md border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-200/60 focus:ring-2 focus:ring-amber-200/20"
            onChange={(event) => onEmailChange(event.target.value)}
            placeholder="sisyphus@example.com"
            required
            type="email"
            value={email}
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-zinc-300">Password</span>
          <input
            className="mt-2 w-full rounded-md border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-200/60 focus:ring-2 focus:ring-amber-200/20"
            onChange={(event) => onPasswordChange(event.target.value)}
            placeholder="Enter any password for now"
            required
            type="password"
            value={password}
          />
        </label>

        <button
          className="w-full rounded-md bg-amber-200 px-7 py-4 text-base font-bold text-zinc-950 shadow-[0_0_30px_rgba(251,191,36,0.24)] transition hover:bg-amber-100"
          type="submit"
        >
          {isCreatingAccount ? "Create Account" : "Login"}
        </button>
      </form>

      <p className="mt-5 text-sm leading-6 text-zinc-500">
        This is a local prototype login. No password is sent anywhere or saved.
      </p>
    </section>
  );
}
