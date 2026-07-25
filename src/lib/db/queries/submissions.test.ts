import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockSupabase, type MockSupabase } from "@test/mocks/supabase";
import type { DbClient } from "../supabase-server";
import { makeSubmission } from "@test/fixtures";

const { createClientMock } = vi.hoisted(() => ({ createClientMock: vi.fn() }));
vi.mock("../supabase-server", () => ({ createClient: createClientMock }));

import { getSubmissions } from "./submissions";

const use = (m: MockSupabase) =>
  createClientMock.mockResolvedValue(m as unknown as DbClient);

beforeEach(() => vi.clearAllMocks());

describe("getSubmissions", () => {
  it("defaults to a newest-first page of 50", async () => {
    const mock = createMockSupabase({
      tables: { submissions: { data: [makeSubmission()] } },
    });
    use(mock);
    const rows = await getSubmissions();
    expect(rows).toHaveLength(1);
    expect(mock.argsFor("submissions", "order")).toContainEqual([
      "submitted_at",
      { ascending: false },
    ]);
    expect(mock.argsFor("submissions", "limit")).toContainEqual([50]);
  });

  it("applies the cursor, limit, and test filter", async () => {
    const mock = createMockSupabase({
      tables: { submissions: { data: [] } },
    });
    use(mock);
    await getSubmissions({ before: "2026-01-01", limit: 20, testId: "t1" });
    expect(mock.argsFor("submissions", "limit")).toContainEqual([20]);
    expect(mock.argsFor("submissions", "lt")).toContainEqual([
      "submitted_at",
      "2026-01-01",
    ]);
    expect(mock.argsFor("submissions", "eq")).toContainEqual(["test_id", "t1"]);
  });
});
