// Helpers for asserting Next.js `redirect()` calls in Server Action tests.
//
// `redirect()` normally throws a framework-internal error to halt execution.
// In tests we mock it (via `vi.hoisted`) to throw an Error tagged with this
// prefix, then use `redirectUrl()` to extract the target from a caught error.
//
// Example:
//   const { redirect, revalidatePath } = vi.hoisted(() => ({
//     redirect: vi.fn((url: string) => {
//       throw new Error("NEXT_REDIRECT:" + url);
//     }),
//     revalidatePath: vi.fn(),
//   }));
//   vi.mock("next/navigation", () => ({ redirect }));
//   vi.mock("next/cache", () => ({ revalidatePath }));

export const REDIRECT_PREFIX = "NEXT_REDIRECT:";

/** Extract the redirect target from a caught error, or null if not a redirect. */
export function redirectUrl(err: unknown): string | null {
  if (err instanceof Error && err.message.startsWith(REDIRECT_PREFIX)) {
    return err.message.slice(REDIRECT_PREFIX.length);
  }
  return null;
}
