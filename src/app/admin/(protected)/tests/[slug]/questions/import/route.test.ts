// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";
import type { Test } from "@/types/quiz";
import { makeTest, makeTrait } from "@test/fixtures";

const h = vi.hoisted(() => ({
  requireAdmin: vi.fn(async () => ({ id: "u1" })),
  getTest: vi.fn(async (): Promise<Test | null> => makeTestValue()),
  getAllTraits: vi.fn(async () => traitsValue()),
  createQuestion: vi.fn(async () => ({ error: null as string | null })),
}));
vi.mock("@/lib/db/auth", () => ({ requireAdmin: h.requireAdmin }));
vi.mock("@/lib/db/queries", () => ({
  getTest: h.getTest,
  getAllTraits: h.getAllTraits,
}));
vi.mock("@/lib/db/mutations", () => ({ createQuestion: h.createQuestion }));

import { POST } from "./route";

// Declared as hoisted-safe function declarations so the mock factory can call them.
function makeTestValue() {
  return makeTest({ id: "t1", slug: "mbti" });
}
function traitsValue() {
  return [
    makeTrait({ id: "trait_c", slug: "curiosity" }),
    makeTrait({ id: "trait_o", slug: "order" }),
  ];
}

function postWithFile(file: File): NextRequest {
  const fd = new FormData();
  fd.set("file", file);
  return new Request("http://test/import", {
    method: "POST",
    body: fd,
  }) as unknown as NextRequest;
}

const params = { params: Promise.resolve({ slug: "mbti" }) };

beforeEach(() => vi.clearAllMocks());

describe("POST /questions/import", () => {
  it("returns 401 when not authenticated", async () => {
    h.requireAdmin.mockRejectedValueOnce(new Error("no auth"));
    const res = await POST(postWithFile(new File(["x"], "q.csv")), params);
    expect(res.status).toBe(401);
  });

  it("returns 404 when the test does not exist", async () => {
    h.getTest.mockResolvedValueOnce(null);
    const res = await POST(postWithFile(new File(["x"], "q.csv")), params);
    expect(res.status).toBe(404);
  });

  it("returns 400 when no file is provided", async () => {
    const res = await POST(
      new Request("http://test/import", {
        method: "POST",
        body: new FormData(),
      }) as unknown as NextRequest,
      params,
    );
    expect(res.status).toBe(400);
  });

  it("imports valid CSV rows and reports how many were created", async () => {
    const csv = [
      "kind,text,trait_slug",
      "likert,I love exploring,curiosity",
      "likert,I keep things tidy,order",
    ].join("\n");
    const res = await POST(
      postWithFile(new File([csv], "questions.csv")),
      params,
    );
    const body = await res.json();
    expect(body).toEqual({ created: 2, errors: [] });
    expect(h.createQuestion).toHaveBeenCalledTimes(2);
  });

  it("collects per-row errors for invalid CSV", async () => {
    const csv = ["kind,text,trait_slug", "likert,Missing trait,ghost"].join(
      "\n",
    );
    const res = await POST(postWithFile(new File([csv], "q.csv")), params);
    const body = await res.json();
    expect(body.created).toBe(0);
    expect(body.errors[0].message).toContain('Unknown trait_slug "ghost"');
  });

  it("imports valid JSON rows", async () => {
    const json = JSON.stringify([
      { kind: "likert", text: "Q1", trait_slug: "curiosity" },
    ]);
    const res = await POST(postWithFile(new File([json], "q.json")), params);
    const body = await res.json();
    expect(body).toEqual({ created: 1, errors: [] });
  });
});
