// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeSubmission, makeTest, makeTrait } from "@test/fixtures";

const h = vi.hoisted(() => ({
  requireAdmin: vi.fn(async () => ({ id: "u1" })),
  getTest: vi.fn(),
  getAllTraits: vi.fn(),
  getSubmissions: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));
vi.mock("@/lib/db/auth", () => ({ requireAdmin: h.requireAdmin }));
vi.mock("@/lib/db/queries", () => ({
  getTest: h.getTest,
  getAllTraits: h.getAllTraits,
  getSubmissions: h.getSubmissions,
}));
vi.mock("next/navigation", () => ({ notFound: h.notFound }));

import { GET } from "./route";

const req = () => new Request("http://test/export");
const params = { params: Promise.resolve({ slug: "mbti" }) };

beforeEach(() => vi.clearAllMocks());

describe("GET /results/export", () => {
  it("returns a CSV attachment with a header and one row per submission", async () => {
    h.getTest.mockResolvedValue(makeTest({ id: "t1", slug: "mbti" }));
    h.getAllTraits.mockResolvedValue([
      makeTrait({ slug: "curiosity" }),
      makeTrait({ slug: "order" }),
    ]);
    h.getSubmissions.mockResolvedValue([
      makeSubmission({
        id: "s1",
        submitted_at: "2026-01-01T00:00:00.000Z",
        archetype_code: "INTJ",
        scores: { curiosity: 80, order: 20 },
      }),
    ]);

    const res = await GET(req(), params);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/csv");
    expect(res.headers.get("Content-Disposition")).toContain(
      'filename="typolog-mbti-',
    );

    const [header, row] = (await res.text()).split("\n");
    expect(header).toBe("id,submitted_at,archetype_code,curiosity,order");
    expect(row).toBe("s1,2026-01-01T00:00:00.000Z,INTJ,80,20");
  });

  it("404s when the test does not exist", async () => {
    h.getTest.mockResolvedValue(null);
    await expect(GET(req(), params)).rejects.toThrow();
    expect(h.notFound).toHaveBeenCalled();
  });
});
