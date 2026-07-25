import { describe, it, expect } from "vitest";
import { nextSortOrder, resolveTestSlug } from "./helpers";
import { createMockSupabase, type MockSupabase } from "@test/mocks/supabase";
import type { DbClient } from "../supabase-server";

const asClient = (m: MockSupabase) => m as unknown as DbClient;

describe("nextSortOrder", () => {
  it("returns the current max sort_order plus one", async () => {
    const mock = createMockSupabase({
      tables: { traits: { single: { sort_order: 4 } } },
    });
    expect(await nextSortOrder(asClient(mock), "traits", "t1")).toBe(5);
  });

  it("returns 1 for an empty table", async () => {
    const mock = createMockSupabase({ tables: { traits: { single: null } } });
    expect(await nextSortOrder(asClient(mock), "traits", "t1")).toBe(1);
  });

  it("excludes soft-deleted rows when asked", async () => {
    const mock = createMockSupabase({
      tables: { questions: { single: { sort_order: 2 } } },
    });
    await nextSortOrder(asClient(mock), "questions", "t1", {
      excludeDeleted: true,
    });
    expect(mock.argsFor("questions", "is")).toContainEqual([
      "deleted_at",
      null,
    ]);
  });
});

describe("resolveTestSlug", () => {
  it("resolves child row → test_id → test slug", async () => {
    const mock = createMockSupabase({
      tables: {
        traits: { single: { test_id: "test1" } },
        tests: { single: { slug: "mbti" } },
      },
    });
    expect(await resolveTestSlug(asClient(mock), "traits", "row1")).toBe(
      "mbti",
    );
  });

  it("returns null when the child row is missing", async () => {
    const mock = createMockSupabase({ tables: { traits: { single: null } } });
    expect(await resolveTestSlug(asClient(mock), "traits", "x")).toBeNull();
  });
});
