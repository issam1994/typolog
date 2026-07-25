import type { Trait } from "@/types/quiz";
import { createClient } from "../supabase-server";
import {
  archetypeDistribution,
  dailyCounts,
  traitAverages,
  type ArchetypeCount,
} from "@/lib/stats/aggregate";

export type { ArchetypeCount };

export async function getArchetypeDistribution(
  testId: string,
): Promise<ArchetypeCount[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("submissions")
    .select("archetype_code")
    .eq("test_id", testId);
  return archetypeDistribution(data ?? []);
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

  const last30dData = (recent ?? []) as {
    submitted_at: string;
    scores: Record<string, number>;
  }[];

  return {
    total: total ?? 0,
    last7d: last7d ?? 0,
    last30d: last30dData.length,
    dailyCounts: dailyCounts(last30dData, now),
    traitAverages: traitAverages(traits, last30dData),
  };
}
