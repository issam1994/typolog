import { createClient } from "../supabase-server";

export type ArchetypeInput = {
  code: string;
  label: string;
  description: string;
  long_form: string;
};

export async function createArchetype(
  testId: string,
  input: ArchetypeInput,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data: last } = await supabase
    .from("archetypes")
    .select("sort_order")
    .eq("test_id", testId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const { error } = await supabase.from("archetypes").insert({
    test_id: testId,
    ...input,
    sort_order: (last?.sort_order ?? 0) + 1,
  });
  return { error: error?.message ?? null };
}

export async function updateArchetype(
  id: string,
  input: ArchetypeInput,
): Promise<void> {
  const supabase = await createClient();
  await supabase.from("archetypes").update(input).eq("id", id);
}

export async function deleteArchetype(
  id: string,
): Promise<{ testSlug: string | null }> {
  const supabase = await createClient();
  const { data: archetype } = await supabase
    .from("archetypes")
    .select("test_id")
    .eq("id", id)
    .single();
  const { data: test } = await supabase
    .from("tests")
    .select("slug")
    .eq("id", archetype?.test_id)
    .single();

  await supabase.from("archetypes").delete().eq("id", id);
  return { testSlug: test?.slug ?? null };
}
