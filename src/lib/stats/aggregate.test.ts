import { describe, it, expect } from "vitest";
import { archetypeDistribution, dailyCounts, traitAverages } from "./aggregate";
import { makeTrait } from "@test/fixtures";

describe("archetypeDistribution", () => {
  it("counts per code, groups nulls, and sorts by count desc", () => {
    const dist = archetypeDistribution([
      { archetype_code: "INTJ" },
      { archetype_code: "INTJ" },
      { archetype_code: "ENFP" },
      { archetype_code: null },
    ]);
    expect(dist).toEqual([
      { archetype_code: "INTJ", count: 2 },
      { archetype_code: "ENFP", count: 1 },
      { archetype_code: null, count: 1 },
    ]);
  });

  it("returns [] for no rows", () => {
    expect(archetypeDistribution([])).toEqual([]);
  });
});

describe("dailyCounts", () => {
  const now = new Date("2026-01-30T12:00:00.000Z");

  it("produces a 30-day window ending today", () => {
    const out = dailyCounts([], now);
    expect(out).toHaveLength(30);
    expect(out[0].date).toBe("2026-01-01");
    expect(out[29].date).toBe("2026-01-30");
  });

  it("buckets submissions by day and ignores out-of-window ones", () => {
    const out = dailyCounts(
      [
        { submitted_at: "2026-01-30T09:00:00.000Z" },
        { submitted_at: "2026-01-30T22:00:00.000Z" },
        { submitted_at: "2026-01-01T00:00:00.000Z" },
        { submitted_at: "2025-12-15T00:00:00.000Z" }, // outside window
      ],
      now,
    );
    expect(out[29]).toEqual({ date: "2026-01-30", count: 2 });
    expect(out[0]).toEqual({ date: "2026-01-01", count: 1 });
    expect(out.reduce((n, d) => n + d.count, 0)).toBe(3);
  });
});

describe("traitAverages", () => {
  it("averages each trait's score and rounds", () => {
    const traits = [
      makeTrait({ id: "a", slug: "a", label: "Alpha" }),
      makeTrait({ id: "b", slug: "b", label: "Beta" }),
      makeTrait({ id: "c", slug: "c", label: "Gamma" }),
    ];
    const out = traitAverages(traits, [
      { scores: { a: 80, b: 41 } },
      { scores: { a: 100 } },
    ]);
    expect(out).toEqual([
      { id: "a", label: "Alpha", average: 90 },
      { id: "b", label: "Beta", average: 41 },
      { id: "c", label: "Gamma", average: 0 },
    ]);
  });
});
