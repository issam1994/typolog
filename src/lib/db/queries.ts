import type { Question, Trait, Submission } from "@/types/shared/quiz";
import { createClient } from "./supabase-server";

export async function getQuiz(): Promise<{
  questions: Question[];
  traits: Trait[];
}> {
  const supabase = await createClient();
  const [{ data: questions }, { data: traits }] = await Promise.all([
    supabase
      .from("questions")
      .select("*")
      .is("deleted_at", null)
      .order("sort_order"),
    supabase.from("traits").select("*").order("sort_order"),
  ]);
  return { questions: questions ?? [], traits: traits ?? [] };
}

export async function getAllQuestions(): Promise<Question[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("questions")
    .select("*")
    .is("deleted_at", null)
    .order("sort_order");
  return data ?? [];
}

export async function getAllTraits(): Promise<Trait[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("traits")
    .select("*")
    .order("sort_order");
  return data ?? [];
}

export async function getSubmissions(
  opts: { before?: string; limit?: number } = {},
): Promise<Submission[]> {
  const { before, limit = 50 } = opts;
  const supabase = await createClient();
  let query = supabase
    .from("submissions")
    .select("*")
    .order("submitted_at", { ascending: false })
    .limit(limit);
  if (before) query = query.lt("submitted_at", before);
  const { data } = await query;
  return data ?? [];
}

export async function getSubmission(id: string): Promise<Submission | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", id)
    .single();
  return data;
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
): Promise<OverviewStats> {
  const supabase = await createClient();

  const now = new Date();
  const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [{ count: total }, { count: last7d }, { data: recent }] =
    await Promise.all([
      supabase.from("submissions").select("*", { count: "exact", head: true }),
      supabase
        .from("submissions")
        .select("*", { count: "exact", head: true })
        .gte("submitted_at", d7),
      supabase
        .from("submissions")
        .select("submitted_at, scores")
        .gte("submitted_at", d30)
        .order("submitted_at"),
    ]);

  const last30dData = recent ?? [];

  // Submissions per day (last 30 days)
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

  // Per-trait averages
  const traitSums: Record<string, number> = {};
  const traitCounts2: Record<string, number> = {};
  traits.forEach(({ id }) => {
    traitSums[id] = 0;
    traitCounts2[id] = 0;
  });
  last30dData.forEach((s) => {
    const scores = s.scores as Record<string, number>;
    Object.entries(scores).forEach(([tid, pct]) => {
      if (tid in traitSums) {
        traitSums[tid] += pct;
        traitCounts2[tid]++;
      }
    });
  });
  const traitAverages = traits.map((t) => ({
    id: t.id,
    label: t.label,
    average:
      traitCounts2[t.id] > 0
        ? Math.round(traitSums[t.id] / traitCounts2[t.id])
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
