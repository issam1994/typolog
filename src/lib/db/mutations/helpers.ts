import type { DbClient } from "../supabase-server";

/**
 * Shared building blocks for the per-resource mutation modules. These are
 * internal to `src/lib/db/mutations/` and intentionally not re-exported from
 * `index.ts`.
 */

/**
 * Next `sort_order` for a new row in a test-scoped, ordered table (traits,
 * archetypes, questions). Pass `excludeDeleted` for tables that soft-delete.
 */
export async function nextSortOrder(
  supabase: DbClient,
  table: string,
  testId: string,
  { excludeDeleted = false }: { excludeDeleted?: boolean } = {},
): Promise<number> {
  let query = supabase.from(table).select("sort_order").eq("test_id", testId);
  if (excludeDeleted) query = query.is("deleted_at", null);

  const { data } = await query
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  return (data?.sort_order ?? 0) + 1;
}

/**
 * Slug of the test owning row `id` in a test-scoped `table`, or `null` if
 * either lookup fails. Used to revalidate/redirect after delete-style
 * mutations that only receive the child row id.
 */
export async function resolveTestSlug(
  supabase: DbClient,
  table: string,
  id: string,
): Promise<string | null> {
  const { data: row } = await supabase
    .from(table)
    .select("test_id")
    .eq("id", id)
    .single();
  if (!row?.test_id) return null;

  const { data: test } = await supabase
    .from("tests")
    .select("slug")
    .eq("id", row.test_id)
    .single();
  return test?.slug ?? null;
}
