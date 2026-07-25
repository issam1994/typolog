import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { saveResult, loadResult, loadAllResults } from "./results-storage";
import type { StoredResult } from "@/types/quiz";

const result = (submissionId: string): StoredResult => ({
  submissionId,
  scores: { a: 80 },
  archetypeCode: "INTJ",
  archetype: null,
  submittedAt: "2026-01-01T00:00:00.000Z",
});

beforeEach(() => localStorage.clear());

describe("results-storage", () => {
  it("round-trips a stored result under a namespaced key", () => {
    saveResult("mbti", result("s1"));
    expect(localStorage.getItem("typolog_result:mbti")).not.toBeNull();
    expect(loadResult("mbti")).toEqual(result("s1"));
  });

  it("returns null for a missing slug", () => {
    expect(loadResult("nope")).toBeNull();
  });

  it("returns null (not throw) on corrupt JSON", () => {
    localStorage.setItem("typolog_result:bad", "{not json");
    expect(loadResult("bad")).toBeNull();
  });

  it("collects only typolog_result-prefixed keys", () => {
    saveResult("mbti", result("s1"));
    saveResult("enneagram", result("s2"));
    localStorage.setItem("unrelated", "x");
    const all = loadAllResults();
    expect(Object.keys(all).sort()).toEqual(["enneagram", "mbti"]);
    expect(all.mbti.submissionId).toBe("s1");
  });

  it("swallows write failures (e.g. quota exceeded)", () => {
    const spy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("QuotaExceeded");
      });
    expect(() => saveResult("mbti", result("s1"))).not.toThrow();
    spy.mockRestore();
  });

  afterEach(() => vi.restoreAllMocks());
});
