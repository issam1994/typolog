import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockSupabase, type MockSupabase } from "@test/mocks/supabase";
import type { DbClient } from "../supabase-server";

const { createClientMock } = vi.hoisted(() => ({ createClientMock: vi.fn() }));
vi.mock("../supabase-server", () => ({ createClient: createClientMock }));

import { createArchetype, deleteArchetype } from "./archetypes";

const use = (m: MockSupabase) =>
  createClientMock.mockResolvedValue(m as unknown as DbClient);

beforeEach(() => vi.clearAllMocks());

describe("createArchetype", () => {
  it("inserts with the next sort order", async () => {
    const mock = createMockSupabase({
      tables: { archetypes: { single: { sort_order: 1 } } },
    });
    use(mock);
    const result = await createArchetype("t1", {
      code: "INTJ",
      label: "The Architect",
      description: "d",
      long_form: "l",
    });
    expect(result).toEqual({ error: null });
    expect(mock.argsFor("archetypes", "insert")).toContainEqual([
      {
        test_id: "t1",
        code: "INTJ",
        label: "The Architect",
        description: "d",
        long_form: "l",
        sort_order: 2,
      },
    ]);
  });
});

describe("deleteArchetype", () => {
  it("deletes the archetype and resolves the owning test slug", async () => {
    const mock = createMockSupabase({
      tables: {
        archetypes: { single: { test_id: "t1" } },
        tests: { single: { slug: "mbti" } },
      },
    });
    use(mock);
    expect(await deleteArchetype("a1")).toEqual({ testSlug: "mbti" });
    expect(mock.argsFor("archetypes", "delete")).toHaveLength(1);
  });
});
