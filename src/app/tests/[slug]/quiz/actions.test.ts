import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeLikertQuestion, makeTest, makeTrait } from "@test/fixtures";

const h = vi.hoisted(() => ({
  getTestBundle: vi.fn(),
  createSubmission: vi.fn(async () => ({ id: "sub_1" })),
}));
vi.mock("@/lib/db/queries", () => ({ getTestBundle: h.getTestBundle }));
vi.mock("@/lib/db/mutations", () => ({ createSubmission: h.createSubmission }));

import { submitQuiz } from "./actions";

beforeEach(() => vi.clearAllMocks());

describe("submitQuiz", () => {
  it("throws for an unknown test", async () => {
    h.getTestBundle.mockResolvedValueOnce(null);
    await expect(submitQuiz("ghost", {})).rejects.toThrow("Unknown test");
  });

  it("scores the answers, records a submission, and returns the result", async () => {
    h.getTestBundle.mockResolvedValueOnce({
      test: makeTest({ id: "t1", scoring_strategy: "likert_percentage" }),
      traits: [makeTrait({ id: "trait_a", slug: "a" })],
      questions: [makeLikertQuestion({ id: "q1", trait_id: "trait_a" })],
    });

    const result = await submitQuiz("mbti", { q1: 5 });

    expect(result).toEqual({
      submissionId: "sub_1",
      archetypeCode: null,
      scores: { a: 100 },
    });
    expect(h.createSubmission).toHaveBeenCalledWith(
      "t1",
      { q1: 5 },
      { a: 100 },
      null,
    );
  });
});
