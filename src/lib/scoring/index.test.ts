import { describe, it, expect } from "vitest";
import { getScorer } from "./index";
import { likertPercentage } from "./likertPercentage";
import { mbtiDichotomy } from "./mbtiDichotomy";
import { enneagramDominant } from "./enneagramDominant";
import { cognitiveStack } from "./cognitiveStack";
import { psychosophyStack } from "./psychosophyStack";

describe("getScorer", () => {
  it("returns the matching scorer for each strategy", () => {
    expect(getScorer("likert_percentage")).toBe(likertPercentage);
    expect(getScorer("mbti_dichotomy")).toBe(mbtiDichotomy);
    expect(getScorer("enneagram_dominant")).toBe(enneagramDominant);
    expect(getScorer("cognitive_stack")).toBe(cognitiveStack);
    expect(getScorer("psychosophy_stack")).toBe(psychosophyStack);
  });

  it("throws on an unknown strategy", () => {
    // @ts-expect-error — exercising the runtime guard with an invalid strategy
    expect(() => getScorer("nope")).toThrow(/Unknown scoring strategy/);
  });
});
