import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Post-mutation navigation helpers shared by admin Server Actions.
 *
 * Every admin action ends by either redirecting back with an `?error=` message
 * or revalidating the page it just mutated and redirecting to it. Both calls
 * throw (Next's `redirect` never returns), so the return type is `never`.
 */

/** Redirect back to `path` with an encoded `?error=` query param. */
export function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

/** Revalidate `path` and redirect to it after a successful mutation. */
export function revalidateAndRedirect(path: string): never {
  revalidatePath(path);
  redirect(path);
}
