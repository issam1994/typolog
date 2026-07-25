import type { ScoringInput } from "@/lib/scoring/types";
import { makeLikertQuestion, makeTest, makeTrait } from "./fixtures";

/**
 * Build a likert-based {@link ScoringInput}: one question per trait, keyed by
 * slug. Reused by the four likert scorers (percentage / cognitive / enneagram /
 * psychosophy). `answer` omitted means that question is left unanswered.
 */
export function likertInput(
  specs: { slug: string; answer?: number; reverseKeyed?: boolean }[],
  opts: { likertMaxValue?: number } = {},
): ScoringInput {
  const traits = specs.map((s, i) =>
    makeTrait({ id: `trait_${s.slug}`, slug: s.slug, sort_order: i + 1 }),
  );
  const questions = specs.map((s) =>
    makeLikertQuestion({
      id: `q_${s.slug}`,
      trait_id: `trait_${s.slug}`,
      reverse_keyed: s.reverseKeyed ?? false,
    }),
  );
  const answers: Record<string, number> = {};
  specs.forEach((s) => {
    if (s.answer !== undefined) answers[`q_${s.slug}`] = s.answer;
  });
  return {
    test: makeTest(),
    traits,
    questions,
    answers,
    likertMaxValue: opts.likertMaxValue ?? 5,
  };
}
