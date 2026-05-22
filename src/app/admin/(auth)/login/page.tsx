import { loginAction } from "./actions";

export const metadata = {
  title: "Admin Login — Typolog",
};

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight mb-8">Admin</h1>

        {error && (
          <p className="text-sm text-danger mb-6 border border-danger/30 px-4 py-3">
            {decodeURIComponent(error)}
          </p>
        )}

        <form action={loginAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="email"
              className="text-xs text-muted tracking-widest uppercase"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="bg-transparent border border-border px-4 py-3 text-sm text-foreground placeholder-foreground/30 focus:outline-none focus:border-foreground/60 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="password"
              className="text-xs text-muted tracking-widest uppercase"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="bg-transparent border border-border px-4 py-3 text-sm text-foreground placeholder-foreground/30 focus:outline-none focus:border-foreground/60 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="mt-2 px-6 py-3 bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
