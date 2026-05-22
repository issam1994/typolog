import type {
  Question,
  Trait,
  Submission,
  Test,
  Archetype,
} from "@/types/shared/quiz";
import { createClient } from "./supabase-server";

// ─── Tests ────────────────────────────────────────────────────────────────────

export async function getPublishedTests(): Promise<Test[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tests")
    .select("*")
    .eq("is_published", true)
    .order("sort_order");
  return data ?? [];
}

export async function getAllTests(): Promise<Test[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("tests").select("*").order("sort_order");
  return data ?? [];
}

export async function getTest(slug: string): Promise<Test | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tests")
    .select("*")
    .eq("slug", slug)
    .single();
  return data;
}

type TestBundle = {
  test: Test;
  traits: Trait[];
  questions: Question[];
};

export async function getTestBundle(slug: string): Promise<TestBundle | null> {
  const test = await getTest(slug);
  if (!test) return null;

  const supabase = await createClient();
  const [{ data: rawTraits }, { data: rawQuestions }] = await Promise.all([
    supabase
      .from("traits")
      .select("*")
      .eq("test_id", test.id)
      .order("sort_order"),
    supabase
      .from("questions")
      .select("*, question_options(*)")
      .eq("test_id", test.id)
      .is("deleted_at", null)
      .order("sort_order"),
  ]);

  const traits: Trait[] = rawTraits ?? [];
  const questions: Question[] = (rawQuestions ?? []).map((q) => {
    const { question_options, ...rest } = q as typeof q & {
      question_options: Question["options"];
    };
    const options = (question_options ?? []).sort(
      (a: { sort_order: number }, b: { sort_order: number }) =>
        a.sort_order - b.sort_order,
    );
    return { ...rest, options } as Question;
  });

  return { test, traits, questions };
}

// ─── Archetypes ───────────────────────────────────────────────────────────────

export async function getArchetypes(testId: string): Promise<Archetype[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("archetypes")
    .select("*")
    .eq("test_id", testId)
    .order("sort_order");
  return data ?? [];
}

export async function getArchetype(
  testId: string,
  code: string,
): Promise<Archetype | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("archetypes")
    .select("*")
    .eq("test_id", testId)
    .eq("code", code)
    .single();
  return data;
}

// ─── Traits ───────────────────────────────────────────────────────────────────

export async function getAllTraits(testId?: string): Promise<Trait[]> {
  const supabase = await createClient();
  let query = supabase.from("traits").select("*").order("sort_order");
  if (testId) query = query.eq("test_id", testId);
  const { data } = await query;
  return data ?? [];
}

// ─── Questions ────────────────────────────────────────────────────────────────

export async function getAllQuestions(testId?: string): Promise<Question[]> {
  const supabase = await createClient();
  let query = supabase
    .from("questions")
    .select("*, question_options(*)")
    .is("deleted_at", null)
    .order("sort_order");
  if (testId) query = query.eq("test_id", testId);
  const { data } = await query;
  return (data ?? []).map((q) => {
    const { question_options, ...rest } = q as typeof q & {
      question_options: Question["options"];
    };
    const options = (question_options ?? []).sort(
      (a: { sort_order: number }, b: { sort_order: number }) =>
        a.sort_order - b.sort_order,
    );
    return { ...rest, options } as Question;
  });
}

// ─── Submissions ──────────────────────────────────────────────────────────────

export async function getSubmissions(
  opts: { before?: string; limit?: number; testId?: string } = {},
): Promise<Submission[]> {
  const { before, limit = 50, testId } = opts;
  const supabase = await createClient();
  let query = supabase
    .from("submissions")
    .select("*")
    .order("submitted_at", { ascending: false })
    .limit(limit);
  if (before) query = query.lt("submitted_at", before);
  if (testId) query = query.eq("test_id", testId);
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

// ─── Stats ────────────────────────────────────────────────────────────────────

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
  const traitCounts2: Record<string, number> = {};
  traits.forEach(({ slug }) => {
    traitSums[slug] = 0;
    traitCounts2[slug] = 0;
  });
  last30dData.forEach((s) => {
    const scores = s.scores as Record<string, number>;
    Object.entries(scores).forEach(([slugKey, pct]) => {
      if (slugKey in traitSums) {
        traitSums[slugKey] += pct;
        traitCounts2[slugKey]++;
      }
    });
  });
  const traitAverages = traits.map((t) => ({
    id: t.id,
    label: t.label,
    average:
      traitCounts2[t.slug] > 0
        ? Math.round(traitSums[t.slug] / traitCounts2[t.slug])
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
