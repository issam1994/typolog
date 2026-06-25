import { createClient } from "../supabase-server";
import { nextSortOrder, resolveTestSlug } from "./helpers";

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
  const { error } = await supabase.from("archetypes").insert({
    test_id: testId,
    ...input,
    sort_order: await nextSortOrder(supabase, "archetypes", testId),
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
  const testSlug = await resolveTestSlug(supabase, "archetypes", id);
  await supabase.from("archetypes").delete().eq("id", id);
  return { testSlug };
}
