import type { AnswerMap, ScoreMap } from "@/types/quiz";
import { createClient } from "../supabase-server";

export async function createSubmission(
  testId: string,
  answers: AnswerMap,
  scores: ScoreMap,
  archetypeCode: string | null,
): Promise<{ id: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("submissions")
    .insert({
      test_id: testId,
      answers,
      scores,
      archetype_code: archetypeCode,
    })
    .select("id")
    .single();
  if (error) throw error;
  return { id: data.id };
}
