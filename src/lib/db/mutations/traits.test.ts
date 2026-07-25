import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockSupabase, type MockSupabase } from "@test/mocks/supabase";
import type { DbClient } from "../supabase-server";

const { createClientMock } = vi.hoisted(() => ({ createClientMock: vi.fn() }));
vi.mock("../supabase-server", () => ({ createClient: createClientMock }));

import { createTrait, updateTrait, deleteTrait } from "./traits";

const use = (m: MockSupabase) =>
  createClientMock.mockResolvedValue(m as unknown as DbClient);

beforeEach(() => vi.clearAllMocks());

describe("createTrait", () => {
  it("inserts the trait with the next sort order", async () => {
    const mock = createMockSupabase({
      tables: { traits: { single: { sort_order: 2 } } },
    });
    use(mock);
    const result = await createTrait("t1", {
      slug: "openness",
      label: "Openness",
      description: "d",
      polarity: null,
    });
    expect(result).toEqual({ error: null });
    expect(mock.argsFor("traits", "insert")).toContainEqual([
      {
        test_id: "t1",
        slug: "openness",
        label: "Openness",
        description: "d",
        polarity: null,
        sort_order: 3,
      },
    ]);
  });
});

describe("updateTrait", () => {
  it("updates the trait by id", async () => {
    const mock = createMockSupabase({ tables: { traits: {} } });
    use(mock);
    await updateTrait("tr1", {
      label: "New",
      description: "d",
      polarity: null,
    });
    expect(mock.argsFor("traits", "update")).toContainEqual([
      { label: "New", description: "d", polarity: null },
    ]);
    expect(mock.argsFor("traits", "eq")).toContainEqual(["id", "tr1"]);
  });
});

describe("deleteTrait", () => {
  it("refuses to delete a trait that still has questions", async () => {
    const mock = createMockSupabase({
      tables: {
        questions: { count: 3 },
        traits: { single: { test_id: "t1" } },
        tests: { single: { slug: "mbti" } },
      },
    });
    use(mock);
    const result = await deleteTrait("trait_a");
    expect(result).toEqual({ testSlug: "mbti", hasQuestions: true });
    expect(mock.argsFor("traits", "delete")).toEqual([]);
  });

  it("deletes a trait with no questions and reports its test slug", async () => {
    const mock = createMockSupabase({
      tables: {
        questions: { count: 0 },
        traits: { single: { test_id: "t1" } },
        tests: { single: { slug: "mbti" } },
      },
    });
    use(mock);
    const result = await deleteTrait("trait_a");
    expect(result).toEqual({ testSlug: "mbti", hasQuestions: false });
    expect(mock.argsFor("traits", "delete")).toHaveLength(1);
  });
});
