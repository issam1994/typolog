import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockSupabase, type MockSupabase } from "@test/mocks/supabase";
import type { DbClient } from "../supabase-server";

const { createClientMock } = vi.hoisted(() => ({ createClientMock: vi.fn() }));
vi.mock("../supabase-server", () => ({ createClient: createClientMock }));

import { createSubmission } from "./submissions";

const use = (m: MockSupabase) =>
  createClientMock.mockResolvedValue(m as unknown as DbClient);

beforeEach(() => vi.clearAllMocks());

describe("createSubmission", () => {
  it("inserts the submission and returns its id", async () => {
    const mock = createMockSupabase({
      tables: { submissions: { single: { id: "sub_1" } } },
    });
    use(mock);
    const result = await createSubmission("t1", { q1: 5 }, { a: 100 }, "INTJ");
    expect(result).toEqual({ id: "sub_1" });
    expect(mock.argsFor("submissions", "insert")).toContainEqual([
      {
        test_id: "t1",
        answers: { q1: 5 },
        scores: { a: 100 },
        archetype_code: "INTJ",
      },
    ]);
  });

  it("throws when the insert fails", async () => {
    use(
      createMockSupabase({
        tables: { submissions: { single: null, error: { message: "boom" } } },
      }),
    );
    await expect(createSubmission("t1", {}, {}, null)).rejects.toMatchObject({
      message: "boom",
    });
  });
});
