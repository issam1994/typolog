import type { Archetype } from "@/types/quiz";
import { createClient } from "../supabase-server";

export async function getArchetypes(testId: string): Promise<Archetype[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("archetypes")
    .select("*")
    .eq("test_id", testId)
    .order("sort_order");
  return data ?? [];
}

export async function getArchetype(
  testId: string,
  code: string,
): Promise<Archetype | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("archetypes")
    .select("*")
    .eq("test_id", testId)
    .eq("code", code)
    .single();
  return data;
}
