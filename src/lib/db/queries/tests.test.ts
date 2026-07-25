import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockSupabase, type MockSupabase } from "@test/mocks/supabase";
import type { DbClient } from "../supabase-server";
import { makeLikertQuestion, makeTest, makeTrait } from "@test/fixtures";

const { createClientMock } = vi.hoisted(() => ({ createClientMock: vi.fn() }));
vi.mock("../supabase-server", () => ({ createClient: createClientMock }));

import { getPublishedTests, getTest, getTestBundle } from "./tests";

const use = (m: MockSupabase) =>
  createClientMock.mockResolvedValue(m as unknown as DbClient);

beforeEach(() => vi.clearAllMocks());

describe("getPublishedTests", () => {
  it("filters to published tests ordered by sort_order", async () => {
    const mock = createMockSupabase({
      tables: { tests: { data: [makeTest(), makeTest()] } },
    });
    use(mock);
    const tests = await getPublishedTests();
    expect(tests).toHaveLength(2);
    expect(mock.argsFor("tests", "eq")).toContainEqual(["is_published", true]);
    expect(mock.argsFor("tests", "order")).toContainEqual(["sort_order"]);
  });
});

describe("getTest", () => {
  it("returns null when no test matches the slug", async () => {
    use(createMockSupabase({ tables: { tests: { single: null } } }));
    expect(await getTest("ghost")).toBeNull();
  });
});

describe("getTestBundle", () => {
  it("composes the test with its traits and questions", async () => {
    const test = makeTest({ id: "t1", slug: "mbti" });
    use(
      createMockSupabase({
        tables: {
          tests: { single: test },
          traits: { data: [makeTrait({ test_id: "t1" })] },
          questions: {
            data: [
              {
                ...makeLikertQuestion({ test_id: "t1" }),
                question_options: [],
              },
            ],
          },
        },
      }),
    );
    const bundle = await getTestBundle("mbti");
    expect(bundle?.test.slug).toBe("mbti");
    expect(bundle?.traits).toHaveLength(1);
    expect(bundle?.questions).toHaveLength(1);
  });

  it("returns null when the test is missing", async () => {
    use(createMockSupabase({ tables: { tests: { single: null } } }));
    expect(await getTestBundle("ghost")).toBeNull();
  });
});
