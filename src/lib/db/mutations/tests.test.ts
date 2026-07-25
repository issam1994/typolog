import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockSupabase, type MockSupabase } from "@test/mocks/supabase";
import type { DbClient } from "../supabase-server";

const { createClientMock } = vi.hoisted(() => ({ createClientMock: vi.fn() }));
vi.mock("../supabase-server", () => ({ createClient: createClientMock }));

import { createTest, updateTest, setTestPublished } from "./tests";

const use = (m: MockSupabase) =>
  createClientMock.mockResolvedValue(m as unknown as DbClient);

const input = {
  name: "MBTI",
  slug: "mbti",
  tagline: "",
  description: "",
  question_kind: "forced_choice",
  scoring_strategy: "mbti_dichotomy",
  result_template: "mbti_code",
  estimated_minutes: 8,
};

beforeEach(() => vi.clearAllMocks());

describe("createTest", () => {
  it("inserts the test and returns no error", async () => {
    const mock = createMockSupabase({ tables: { tests: {} } });
    use(mock);
    expect(await createTest(input)).toEqual({ error: null });
    expect(mock.argsFor("tests", "insert")).toContainEqual([input]);
  });

  it("surfaces the insert error message", async () => {
    use(
      createMockSupabase({
        tables: { tests: { error: { message: "slug taken" } } },
      }),
    );
    expect(await createTest(input)).toEqual({ error: "slug taken" });
  });
});

describe("updateTest", () => {
  it("updates fields and returns the existing slug", async () => {
    const mock = createMockSupabase({
      tables: { tests: { single: { slug: "mbti" } } },
    });
    use(mock);
    const result = await updateTest("t1", {
      name: "MBTI v2",
      tagline: "t",
      description: "d",
      estimated_minutes: 9,
    });
    expect(result).toEqual({ slug: "mbti" });
    expect(mock.argsFor("tests", "update")).toContainEqual([
      { name: "MBTI v2", tagline: "t", description: "d", estimated_minutes: 9 },
    ]);
  });
});

describe("setTestPublished", () => {
  it("updates the is_published flag", async () => {
    const mock = createMockSupabase({ tables: { tests: {} } });
    use(mock);
    await setTestPublished("t1", true);
    expect(mock.argsFor("tests", "update")).toContainEqual([
      { is_published: true },
    ]);
    expect(mock.argsFor("tests", "eq")).toContainEqual(["id", "t1"]);
  });
});
