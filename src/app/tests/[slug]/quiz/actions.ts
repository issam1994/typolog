"use server";

import { createSubmission, getTestBundle } from "@/lib/db/queries";
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

  const { id } = await createSubmission(
    test.id,
    answers,
    scores,
    archetypeCode,
  );
  return { submissionId: id, archetypeCode };
}
