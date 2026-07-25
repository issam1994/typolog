import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockSupabase, type MockSupabase } from "@test/mocks/supabase";
import type { DbClient } from "../supabase-server";

const { createClientMock } = vi.hoisted(() => ({ createClientMock: vi.fn() }));
vi.mock("../supabase-server", () => ({ createClient: createClientMock }));

import { getArchetypeDistribution } from "./stats";

const use = (m: MockSupabase) =>
  createClientMock.mockResolvedValue(m as unknown as DbClient);

beforeEach(() => vi.clearAllMocks());

describe("getArchetypeDistribution", () => {
  it("fetches submissions for the test and returns the sorted distribution", async () => {
    const mock = createMockSupabase({
      tables: {
        submissions: {
          data: [
            { archetype_code: "INTJ" },
            { archetype_code: "INTJ" },
            { archetype_code: null },
          ],
        },
      },
    });
    use(mock);
    const dist = await getArchetypeDistribution("t1");
    expect(dist).toEqual([
      { archetype_code: "INTJ", count: 2 },
      { archetype_code: null, count: 1 },
    ]);
    expect(mock.argsFor("submissions", "eq")).toContainEqual(["test_id", "t1"]);
  });
});
