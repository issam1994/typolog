import { createClient } from "../supabase-server";
import { nextSortOrder, resolveTestSlug } from "./helpers";

export type CreateTraitInput = {
  slug: string;
  label: string;
  description: string;
  polarity: string | null;
};

export async function createTrait(
  testId: string,
  input: CreateTraitInput,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("traits").insert({
    test_id: testId,
    ...input,
    sort_order: await nextSortOrder(supabase, "traits", testId),
  });
  return { error: error?.message ?? null };
}

export type UpdateTraitInput = {
  label: string;
  description: string;
  polarity: string | null;
};

export async function updateTrait(
  id: string,
  input: UpdateTraitInput,
): Promise<void> {
  const supabase = await createClient();
  await supabase.from("traits").update(input).eq("id", id);
}

export async function deleteTrait(
  id: string,
): Promise<{ testSlug: string | null; hasQuestions: boolean }> {
  const supabase = await createClient();

  const { count } = await supabase
    .from("questions")
    .select("*", { count: "exact", head: true })
    .eq("trait_id", id)
    .is("deleted_at", null);

  const testSlug = await resolveTestSlug(supabase, "traits", id);

  if (count && count > 0) {
    return { testSlug, hasQuestions: true };
  }

  await supabase.from("traits").delete().eq("id", id);
  return { testSlug, hasQuestions: false };
}
