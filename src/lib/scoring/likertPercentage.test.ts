import { describe, it, expect } from "vitest";
import { likertPercentage } from "./likertPercentage";
import { likertInput } from "@test/scoring";
import { makeLikertQuestion, makeTest, makeTrait } from "@test/fixtures";

describe("likertPercentage", () => {
  it("normalizes each trait to a 0-100 percentage of the max", () => {
    const { scores, archetypeCode } = likertPercentage(
      likertInput([
        { slug: "a", answer: 5 },
        { slug: "b", answer: 3 },
        { slug: "c", answer: 1 },
      ]),
    );
    expect(scores).toEqual({ a: 100, b: 60, c: 20 });
    expect(archetypeCode).toBeNull();
  });

  it("averages multiple questions on the same trait", () => {
    const trait = makeTrait({ id: "t", slug: "a" });
    const input = {
      test: makeTest(),
      traits: [trait],
      questions: [
        makeLikertQuestion({ id: "q1", trait_id: "t" }),
        makeLikertQuestion({ id: "q2", trait_id: "t" }),
      ],
      answers: { q1: 5, q2: 3 }, // avg 4 → 80%
      likertMaxValue: 5,
    };
    expect(likertPercentage(input).scores).toEqual({ a: 80 });
  });

  it("inverts reverse-keyed answers", () => {
    const { scores } = likertPercentage(
      likertInput([{ slug: "a", answer: 1, reverseKeyed: true }]),
    );
    expect(scores).toEqual({ a: 100 }); // 5 + 1 - 1 = 5 → 100%
  });

  it("scores unanswered traits as 0", () => {
    const { scores } = likertPercentage(
      likertInput([{ slug: "a", answer: 4 }, { slug: "b" }]),
    );
    expect(scores).toEqual({ a: 80, b: 0 });
  });

  it("ignores answers whose trait cannot be resolved", () => {
    const input = {
      test: makeTest(),
      traits: [makeTrait({ id: "t", slug: "a" })],
      questions: [makeLikertQuestion({ id: "q", trait_id: "missing" })],
      answers: { q: 5 },
      likertMaxValue: 5,
    };
    expect(likertPercentage(input).scores).toEqual({ a: 0 });
  });
});
