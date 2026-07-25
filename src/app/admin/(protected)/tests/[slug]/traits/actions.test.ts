import { describe, it, expect, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => ({
  requireAdmin: vi.fn(async () => ({ id: "u1" })),
  createTrait: vi.fn(async () => ({ error: null as string | null })),
  updateTrait: vi.fn(async () => {}),
  deleteTrait: vi.fn(async () => ({
    testSlug: "mbti" as string | null,
    hasQuestions: false,
  })),
  redirectWithError: vi.fn((path: string, message: string) => {
    throw new Error(`ERR:${path}:${message}`);
  }),
  revalidateAndRedirect: vi.fn((path: string) => {
    throw new Error(`OK:${path}`);
  }),
}));
vi.mock("@/lib/db/auth", () => ({ requireAdmin: h.requireAdmin }));
vi.mock("@/lib/db/mutations", () => ({
  createTrait: h.createTrait,
  updateTrait: h.updateTrait,
  deleteTrait: h.deleteTrait,
}));
vi.mock("@/lib/admin/navigation", () => ({
  redirectWithError: h.redirectWithError,
  revalidateAndRedirect: h.revalidateAndRedirect,
}));

import { createTraitAction, deleteTraitAction } from "./actions";

function form(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(entries)) fd.set(k, v);
  return fd;
}

beforeEach(() => vi.clearAllMocks());

describe("createTraitAction", () => {
  it("requires slug and label", async () => {
    await expect(
      createTraitAction(form({ test_id: "t1", test_slug: "mbti", slug: "" })),
    ).rejects.toThrow();
    expect(h.redirectWithError).toHaveBeenCalledWith(
      "/admin/tests/mbti/traits",
      "Missing required fields",
    );
    expect(h.createTrait).not.toHaveBeenCalled();
  });

  it("creates the trait and redirects back to the traits page", async () => {
    await expect(
      createTraitAction(
        form({
          test_id: "t1",
          test_slug: "mbti",
          slug: "curiosity",
          label: "Curiosity",
          polarity: "",
        }),
      ),
    ).rejects.toThrow("OK:/admin/tests/mbti/traits");
    expect(h.createTrait).toHaveBeenCalledWith("t1", {
      slug: "curiosity",
      label: "Curiosity",
      description: "",
      polarity: null,
    });
  });
});

describe("deleteTraitAction", () => {
  it("blocks deletion when the trait still has questions", async () => {
    h.deleteTrait.mockResolvedValueOnce({
      testSlug: "mbti",
      hasQuestions: true,
    });
    await expect(deleteTraitAction(form({ id: "trait_a" }))).rejects.toThrow();
    expect(h.redirectWithError).toHaveBeenCalledWith(
      "/admin/tests/mbti/traits",
      "Cannot delete a trait that has questions",
    );
  });

  it("deletes and redirects when there are no questions", async () => {
    await expect(deleteTraitAction(form({ id: "trait_a" }))).rejects.toThrow(
      "OK:/admin/tests/mbti/traits",
    );
    expect(h.revalidateAndRedirect).toHaveBeenCalledWith(
      "/admin/tests/mbti/traits",
    );
  });
});
