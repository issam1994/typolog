import { describe, it, expect, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => ({
  requireAdmin: vi.fn(async () => ({ id: "u1" })),
  createTest: vi.fn(async () => ({ error: null as string | null })),
  updateTest: vi.fn(async () => ({ slug: "mbti" as string | null })),
  setTestPublished: vi.fn(async () => {}),
  redirectWithError: vi.fn((path: string, message: string) => {
    throw new Error(`ERR:${path}:${message}`);
  }),
  revalidateAndRedirect: vi.fn((path: string) => {
    throw new Error(`OK:${path}`);
  }),
}));
vi.mock("@/lib/db/auth", () => ({ requireAdmin: h.requireAdmin }));
vi.mock("@/lib/db/mutations", () => ({
  createTest: h.createTest,
  updateTest: h.updateTest,
  setTestPublished: h.setTestPublished,
}));
vi.mock("@/lib/admin/navigation", () => ({
  redirectWithError: h.redirectWithError,
  revalidateAndRedirect: h.revalidateAndRedirect,
}));

import { createTestAction, togglePublished } from "./actions";

function form(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(entries)) fd.set(k, v);
  return fd;
}

const validTest = {
  name: "MBTI",
  slug: "mbti",
  question_kind: "forced_choice",
  scoring_strategy: "mbti_dichotomy",
  result_template: "mbti_code",
  estimated_minutes: "8",
};

beforeEach(() => vi.clearAllMocks());

describe("createTestAction", () => {
  it("rejects when a required field is missing", async () => {
    await expect(
      createTestAction(form({ ...validTest, slug: "" })),
    ).rejects.toThrow();
    expect(h.redirectWithError).toHaveBeenCalledWith(
      "/admin/tests",
      "Missing fields",
    );
    expect(h.createTest).not.toHaveBeenCalled();
  });

  it("creates the test then revalidates and redirects", async () => {
    await expect(createTestAction(form(validTest))).rejects.toThrow(
      "OK:/admin/tests",
    );
    expect(h.createTest).toHaveBeenCalledWith({
      name: "MBTI",
      slug: "mbti",
      tagline: "",
      description: "",
      question_kind: "forced_choice",
      scoring_strategy: "mbti_dichotomy",
      result_template: "mbti_code",
      estimated_minutes: 8,
    });
    expect(h.revalidateAndRedirect).toHaveBeenCalledWith("/admin/tests");
  });

  it("surfaces a mutation error via redirectWithError", async () => {
    h.createTest.mockResolvedValueOnce({ error: "slug taken" });
    await expect(createTestAction(form(validTest))).rejects.toThrow();
    expect(h.redirectWithError).toHaveBeenCalledWith(
      "/admin/tests",
      "slug taken",
    );
  });
});

describe("togglePublished", () => {
  it("parses the boolean flag and publishes", async () => {
    await expect(
      togglePublished(form({ id: "t1", is_published: "true" })),
    ).rejects.toThrow("OK:/admin/tests");
    expect(h.setTestPublished).toHaveBeenCalledWith("t1", true);
  });
});
