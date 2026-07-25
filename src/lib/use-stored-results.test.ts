import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useStoredResult, useAllStoredResults } from "./use-stored-results";
import type { StoredResult } from "@/types/quiz";

const stored = (submissionId: string): StoredResult => ({
  submissionId,
  scores: { a: 80 },
  archetype: null,
  archetypeCode: null,
  submittedAt: "2026-01-01T00:00:00.000Z",
});

const put = (slug: string, value: StoredResult) =>
  localStorage.setItem(`typolog_result:${slug}`, JSON.stringify(value));

beforeEach(() => localStorage.clear());

describe("useStoredResult", () => {
  it("returns null when nothing is stored", () => {
    const { result } = renderHook(() => useStoredResult("mbti"));
    expect(result.current).toBeNull();
  });

  it("returns the parsed result present at mount", () => {
    put("mbti", stored("s1"));
    const { result } = renderHook(() => useStoredResult("mbti"));
    expect(result.current?.submissionId).toBe("s1");
  });

  it("reacts to a cross-tab storage event", () => {
    const { result } = renderHook(() => useStoredResult("mbti"));
    expect(result.current).toBeNull();
    act(() => {
      put("mbti", stored("s2"));
      window.dispatchEvent(new StorageEvent("storage"));
    });
    expect(result.current?.submissionId).toBe("s2");
  });
});

describe("useAllStoredResults", () => {
  it("collects every stored result keyed by slug", () => {
    put("mbti", stored("s1"));
    put("enneagram", stored("s2"));
    const { result } = renderHook(() => useAllStoredResults());
    expect(Object.keys(result.current).sort()).toEqual(["enneagram", "mbti"]);
    expect(result.current.mbti.submissionId).toBe("s1");
  });
});
