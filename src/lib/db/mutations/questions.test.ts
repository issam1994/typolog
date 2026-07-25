import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockSupabase, type MockSupabase } from "@test/mocks/supabase";
import type { DbClient } from "../supabase-server";

const { createClientMock } = vi.hoisted(() => ({ createClientMock: vi.fn() }));
vi.mock("../supabase-server", () => ({ createClient: createClientMock }));

import {
  createQuestion,
  updateQuestion,
  softDeleteQuestion,
  swapQuestionOrder,
} from "./questions";

const use = (m: MockSupabase) =>
  createClientMock.mockResolvedValue(m as unknown as DbClient);

beforeEach(() => vi.clearAllMocks());

describe("updateQuestion", () => {
  it("updates a likert question's fields", async () => {
    const mock = createMockSupabase({ tables: { questions: {} } });
    use(mock);
    await updateQuestion("q1", {
      kind: "likert",
      text: "Updated",
      traitId: "trait_a",
      reverseKeyed: true,
    });
    expect(mock.argsFor("questions", "update")).toContainEqual([
      { text: "Updated", trait_id: "trait_a", reverse_keyed: true },
    ]);
  });
});

describe("softDeleteQuestion", () => {
  it("stamps deleted_at and resolves the test slug", async () => {
    const mock = createMockSupabase({
      tables: {
        questions: { single: { test_id: "t1" } },
        tests: { single: { slug: "mbti" } },
      },
    });
    use(mock);
    const result = await softDeleteQuestion("q1");
    expect(result).toEqual({ testSlug: "mbti" });
    const updateArgs = mock.argsFor("questions", "update");
    expect(updateArgs[0][0]).toHaveProperty("deleted_at");
  });
});

describe("createQuestion", () => {
  it("inserts a likert question with the next sort order", async () => {
    const mock = createMockSupabase({
      // 1st single → nextSortOrder lookup (max 0 → order 1)
      tables: { questions: { single: [{ sort_order: 0 }] } },
    });
    use(mock);
    const result = await createQuestion("t1", {
      kind: "likert",
      text: "Q1",
      traitId: "trait_a",
      reverseKeyed: true,
    });
    expect(result).toEqual({ error: null });
    expect(mock.argsFor("questions", "insert")).toContainEqual([
      {
        test_id: "t1",
        text: "Q1",
        kind: "likert",
        trait_id: "trait_a",
        reverse_keyed: true,
        sort_order: 1,
      },
    ]);
  });

  it("inserts a forced-choice question plus its two options", async () => {
    const mock = createMockSupabase({
      tables: {
        // 1st single → nextSortOrder (max 2 → order 3); 2nd single → inserted id
        questions: { single: [{ sort_order: 2 }, { id: "q9" }] },
      },
    });
    use(mock);
    const result = await createQuestion("t1", {
      kind: "forced_choice",
      text: "Pick",
      options: [
        { label: "A", traitId: "trait_a" },
        { label: "B", traitId: "trait_b" },
      ],
    });
    expect(result).toEqual({ error: null });
    expect(mock.argsFor("questions", "insert")).toContainEqual([
      { test_id: "t1", text: "Pick", kind: "forced_choice", sort_order: 3 },
    ]);
    expect(mock.argsFor("question_options", "insert")).toContainEqual([
      [
        {
          question_id: "q9",
          label: "A",
          value: 0,
          trait_id: "trait_a",
          sort_order: 1,
        },
        {
          question_id: "q9",
          label: "B",
          value: 1,
          trait_id: "trait_b",
          sort_order: 2,
        },
      ],
    ]);
  });
});

describe("swapQuestionOrder", () => {
  it("swaps sort_order with the adjacent sibling", async () => {
    const mock = createMockSupabase({
      tables: {
        questions: {
          single: [
            { sort_order: 2, test_id: "t1" }, // current
            { id: "q2", sort_order: 1 }, // sibling above
          ],
        },
      },
    });
    use(mock);
    const result = await swapQuestionOrder("q1", "up");
    expect(result).toEqual({ swapped: true });
    expect(mock.argsFor("questions", "update")).toContainEqual([
      { sort_order: 1 },
    ]);
    expect(mock.argsFor("questions", "update")).toContainEqual([
      { sort_order: 2 },
    ]);
  });

  it("does nothing at a boundary with no sibling", async () => {
    const mock = createMockSupabase({
      tables: {
        questions: {
          single: [{ sort_order: 1, test_id: "t1" }, null],
        },
      },
    });
    use(mock);
    expect(await swapQuestionOrder("q1", "up")).toEqual({ swapped: false });
    expect(mock.argsFor("questions", "update")).toEqual([]);
  });

  it("does nothing when the question is not found", async () => {
    const mock = createMockSupabase({
      tables: { questions: { single: [null] } },
    });
    use(mock);
    expect(await swapQuestionOrder("ghost", "down")).toEqual({
      swapped: false,
    });
  });
});
