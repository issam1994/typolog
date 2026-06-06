import { createClient } from "../supabase-server";

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
  const { data: last } = await supabase
    .from("traits")
    .select("sort_order")
    .eq("test_id", testId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const { error } = await supabase.from("traits").insert({
    test_id: testId,
    ...input,
    sort_order: (last?.sort_order ?? 0) + 1,
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

  const { data: trait } = await supabase
    .from("traits")
    .select("test_id")
    .eq("id", id)
    .single();
  const { data: test } = await supabase
    .from("tests")
    .select("slug")
    .eq("id", trait?.test_id)
    .single();

  if (count && count > 0) {
    return { testSlug: test?.slug ?? null, hasQuestions: true };
  }

  await supabase.from("traits").delete().eq("id", id);
  return { testSlug: test?.slug ?? null, hasQuestions: false };
}
