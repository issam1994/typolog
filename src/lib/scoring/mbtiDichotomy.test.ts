import { describe, it, expect } from "vitest";
import { mbtiDichotomy } from "./mbtiDichotomy";
import type { ScoringInput } from "./types";
import {
  makeForcedChoiceQuestion,
  makeQuestionOption,
  makeTest,
  makeTrait,
} from "@test/fixtures";

// Four reflexive polarity pairs: e/i, s/n, t/f, j/p.
const traits = [
  makeTrait({ id: "t_e", slug: "e", polarity: "i" }),
  makeTrait({ id: "t_i", slug: "i", polarity: "e" }),
  makeTrait({ id: "t_s", slug: "s", polarity: "n" }),
  makeTrait({ id: "t_n", slug: "n", polarity: "s" }),
  makeTrait({ id: "t_t", slug: "t", polarity: "f" }),
  makeTrait({ id: "t_f", slug: "f", polarity: "t" }),
  makeTrait({ id: "t_j", slug: "j", polarity: "p" }),
  makeTrait({ id: "t_p", slug: "p", polarity: "j" }),
];

// A forced-choice question: option value 0 → side A trait, value 1 → side B trait.
function pairQuestion(id: string, aTraitId: string, bTraitId: string) {
  return makeForcedChoiceQuestion({
    id,
    options: [
      makeQuestionOption({ value: 0, trait_id: aTraitId }),
      makeQuestionOption({ value: 1, trait_id: bTraitId }),
    ],
  });
}

const questions = [
  pairQuestion("q_ei", "t_e", "t_i"),
  pairQuestion("q_sn", "t_s", "t_n"),
  pairQuestion("q_tf", "t_t", "t_f"),
  pairQuestion("q_jp", "t_j", "t_p"),
];

function input(answers: Record<string, number>): ScoringInput {
  return {
    test: makeTest({ scoring_strategy: "mbti_dichotomy" }),
    traits,
    questions,
    answers,
    likertMaxValue: 5,
  };
}

describe("mbtiDichotomy", () => {
  it("assembles a 4-letter code from the chosen sides", () => {
    // Choose i, n, t, j.
    const { scores, archetypeCode } = mbtiDichotomy(
      input({ q_ei: 1, q_sn: 1, q_tf: 0, q_jp: 0 }),
    );
    expect(archetypeCode).toBe("INTJ");
    expect(scores.i).toBe(100);
    expect(scores.e).toBe(0);
  });

  it("defaults each side to 50% and lets the first letter win ties when there are no answers", () => {
    const { scores, archetypeCode } = mbtiDichotomy(input({}));
    expect(scores.e).toBe(50);
    expect(scores.i).toBe(50);
    expect(archetypeCode).toBe("ESTJ");
  });

  it("returns null when there are fewer than 4 polarity pairs", () => {
    const twoTraits = [
      makeTrait({ id: "t_e", slug: "e", polarity: "i" }),
      makeTrait({ id: "t_i", slug: "i", polarity: "e" }),
    ];
    const { archetypeCode } = mbtiDichotomy({
      test: makeTest(),
      traits: twoTraits,
      questions: [pairQuestion("q_ei", "t_e", "t_i")],
      answers: { q_ei: 0 },
      likertMaxValue: 5,
    });
    expect(archetypeCode).toBeNull();
  });
});
