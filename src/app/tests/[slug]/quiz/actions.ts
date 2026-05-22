"use server";

import { createClient } from "@/lib/db/supabase-server";
import { getTestBundle } from "@/lib/db/queries";
import { getScorer } from "@/lib/scoring";

export async function submitQuiz(
  testSlug: string,
  answers: Record<string, number>,
) {
  const bundle = await getTestBundle(testSlug);
  if (!bundle) throw new Error("Unknown test");

  const { test, traits, questions } = bundle;
  const scorer = getScorer(test.scoring_strategy);
  const { scores, archetypeCode } = scorer({
    test,
    traits,
    questions,
    answers,
    likertMaxValue: 5,
  });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("submissions")
    .insert({
      test_id: test.id,
      answers,
      scores,
      archetype_code: archetypeCode,
    })
    .select("id")
    .single();

  if (error) throw error;
  return { submissionId: data.id, archetypeCode };
}
