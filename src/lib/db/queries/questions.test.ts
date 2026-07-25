import { describe, it, expect } from "vitest";
import { rowToQuestion } from "./questions";
import { makeLikertQuestion, makeQuestionOption } from "@test/fixtures";

describe("rowToQuestion", () => {
  it("sorts joined options by sort_order", () => {
    const q = rowToQuestion({
      ...makeLikertQuestion({ id: "q1" }),
      question_options: [
        makeQuestionOption({ id: "o2", sort_order: 2 }),
        makeQuestionOption({ id: "o1", sort_order: 1 }),
      ],
    });
    expect(q.options.map((o) => o.id)).toEqual(["o1", "o2"]);
  });

  it("treats null joined options as an empty list", () => {
    const q = rowToQuestion({
      ...makeLikertQuestion({ id: "q1" }),
      question_options: null,
    });
    expect(q.options).toEqual([]);
  });
});
