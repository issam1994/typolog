import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockSupabase, type MockSupabase } from "@test/mocks/supabase";
import type { DbClient } from "../supabase-server";
import { makeArchetype } from "@test/fixtures";

const { createClientMock } = vi.hoisted(() => ({ createClientMock: vi.fn() }));
vi.mock("../supabase-server", () => ({ createClient: createClientMock }));

import { getArchetypes, getArchetype } from "./archetypes";

const use = (m: MockSupabase) =>
  createClientMock.mockResolvedValue(m as unknown as DbClient);

beforeEach(() => vi.clearAllMocks());

describe("getArchetypes", () => {
  it("returns the archetypes for a test ordered by sort_order", async () => {
    const mock = createMockSupabase({
      tables: { archetypes: { data: [makeArchetype(), makeArchetype()] } },
    });
    use(mock);
    expect(await getArchetypes("t1")).toHaveLength(2);
    expect(mock.argsFor("archetypes", "eq")).toContainEqual(["test_id", "t1"]);
    expect(mock.argsFor("archetypes", "order")).toContainEqual(["sort_order"]);
  });
});

describe("getArchetype", () => {
  it("looks up a single archetype by test and code", async () => {
    const arch = makeArchetype({ code: "INTJ" });
    const mock = createMockSupabase({
      tables: { archetypes: { single: arch } },
    });
    use(mock);
    expect(await getArchetype("t1", "INTJ")).toEqual(arch);
    expect(mock.argsFor("archetypes", "eq")).toContainEqual(["code", "INTJ"]);
  });

  it("returns null when no archetype matches", async () => {
    use(createMockSupabase({ tables: { archetypes: { single: null } } }));
    expect(await getArchetype("t1", "ZZZZ")).toBeNull();
  });
});
