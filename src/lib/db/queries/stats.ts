import type { Trait } from "@/types/quiz";
import { createClient } from "../supabase-server";

export type ArchetypeCount = { archetype_code: string | null; count: number };

export async function getArchetypeDistribution(
  testId: string,
): Promise<ArchetypeCount[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("submissions")
    .select("archetype_code")
    .eq("test_id", testId);
  if (!data) return [];
  const counts: Record<string, number> = {};
  for (const row of data) {
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

export type OverviewStats = {
  total: number;
  last7d: number;
  last30d: number;
  dailyCounts: { date: string; count: number }[];
  traitAverages: { id: string; label: string; average: number }[];
};

export async function getOverviewStats(
  traits: Trait[],
  testId?: string,
): Promise<OverviewStats> {
  const supabase = await createClient();

  const now = new Date();
  const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const baseQuery = () => {
    let q = supabase.from("submissions").select("*", {
      count: "exact",
      head: true,
    });
    if (testId) q = q.eq("test_id", testId);
    return q;
  };

  const [{ count: total }, { count: last7d }, { data: recent }] =
    await Promise.all([
      baseQuery(),
      baseQuery().gte("submitted_at", d7),
      (() => {
        let q = supabase
          .from("submissions")
          .select("submitted_at, scores")
          .gte("submitted_at", d30)
          .order("submitted_at");
        if (testId) q = q.eq("test_id", testId);
        return q;
      })(),
    ]);

  const last30dData = recent ?? [];

  const dayCounts: Record<string, number> = {};
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    days.push(key);
    dayCounts[key] = 0;
  }
  last30dData.forEach((s) => {
    const key = (s.submitted_at as string).slice(0, 10);
    if (dayCounts[key] !== undefined) dayCounts[key]++;
  });
  const dailyCounts = days.map((date) => ({ date, count: dayCounts[date] }));

  const traitSums: Record<string, number> = {};
  const traitCounts: Record<string, number> = {};
  traits.forEach(({ slug }) => {
    traitSums[slug] = 0;
    traitCounts[slug] = 0;
  });
  last30dData.forEach((s) => {
    const scores = s.scores as Record<string, number>;
    Object.entries(scores).forEach(([slugKey, pct]) => {
      if (slugKey in traitSums) {
        traitSums[slugKey] += pct;
        traitCounts[slugKey]++;
      }
    });
  });
  const traitAverages = traits.map((t) => ({
    id: t.id,
    label: t.label,
    average:
      traitCounts[t.slug] > 0
        ? Math.round(traitSums[t.slug] / traitCounts[t.slug])
        : 0,
  }));

  return {
    total: total ?? 0,
    last7d: last7d ?? 0,
    last30d: last30dData.length,
    dailyCounts,
    traitAverages,
  };
}
