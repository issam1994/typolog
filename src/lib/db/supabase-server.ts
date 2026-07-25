import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Server-side Supabase client returned by {@link createClient}. */
export type DbClient = Awaited<ReturnType<typeof createClient>>;

export async function createClient() {
  // E2E runs against an in-memory stand-in so journeys need no real database.
  if (process.env.E2E_TEST_MODE === "1") {
    const { createFakeClient } = await import("./e2e-fake");
    return createFakeClient();
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Read-only in Server Components; Proxy handles session refresh
          }
        },
      },
    },
  );
}
