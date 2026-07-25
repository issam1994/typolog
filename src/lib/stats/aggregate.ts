import type { Trait } from "@/types/quiz";

// Pure aggregation helpers for the admin dashboard. Extracted from
// src/lib/db/queries/stats.ts so the grouping/bucketing math can be
// unit-tested without hitting the database.

export type ArchetypeCount = { archetype_code: string | null; count: number };

/** Count submissions per archetype code (null grouped together), sorted desc. */
export function archetypeDistribution(
  rows: { archetype_code: string | null }[],
): ArchetypeCount[] {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    const code = row.archetype_code ?? "__none__";
    counts[code] = (counts[code] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([code, count]) => ({
      archetype_code: code === "__none__" ? null : code,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

/** Submissions bucketed by day for the 30-day window ending at `now`. */
export function dailyCounts(
  submissions: { submitted_at: string }[],
  now: Date,
): { date: string; count: number }[] {
  const dayCounts: Record<string, number> = {};
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    days.push(key);
    dayCounts[key] = 0;
  }
  submissions.forEach((s) => {
    const key = s.submitted_at.slice(0, 10);
    if (dayCounts[key] !== undefined) dayCounts[key]++;
  });
  return days.map((date) => ({ date, count: dayCounts[date] }));
}

/** Average per-trait score percentage across submissions, rounded. */
export function traitAverages(
  traits: Trait[],
  submissions: { scores: Record<string, number> }[],
): { id: string; label: string; average: number }[] {
  const traitSums: Record<string, number> = {};
  const traitCounts: Record<string, number> = {};
  traits.forEach(({ slug }) => {
    traitSums[slug] = 0;
    traitCounts[slug] = 0;
  });
  submissions.forEach((s) => {
    Object.entries(s.scores).forEach(([slugKey, pct]) => {
      if (slugKey in traitSums) {
        traitSums[slugKey] += pct;
        traitCounts[slugKey]++;
      }
    });
  });
  return traits.map((t) => ({
    id: t.id,
    label: t.label,
    average:
      traitCounts[t.slug] > 0
        ? Math.round(traitSums[t.slug] / traitCounts[t.slug])
        : 0,
  }));
}
