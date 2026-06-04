import type {
  AnswerMap,
  Question,
  ScoreMap,
  Trait,
  Submission,
  Test,
  Archetype,
} from "@/types/quiz";
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

export type CreateTestInput = {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  question_kind: string;
  scoring_strategy: string;
  result_template: string;
  estimated_minutes: number;
};

export async function createTest(
  input: CreateTestInput,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("tests").insert(input);
  return { error: error?.message ?? null };
}

export type UpdateTestInput = {
  name: string;
  tagline: string;
  description: string;
  estimated_minutes: number;
};

export async function updateTest(
  id: string,
  input: UpdateTestInput,
): Promise<{ slug: string | null }> {
  const supabase = await createClient();
  const { data: test } = await supabase
    .from("tests")
    .select("slug")
    .eq("id", id)
    .single();

  await supabase.from("tests").update(input).eq("id", id);
  return { slug: test?.slug ?? null };
}

export async function setTestPublished(
  id: string,
  isPublished: boolean,
): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("tests")
    .update({ is_published: isPublished })
    .eq("id", id);
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

export type ArchetypeInput = {
  code: string;
  label: string;
  description: string;
  long_form: string;
};

export async function createArchetype(
  testId: string,
  input: ArchetypeInput,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data: last } = await supabase
    .from("archetypes")
    .select("sort_order")
    .eq("test_id", testId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const { error } = await supabase.from("archetypes").insert({
    test_id: testId,
    ...input,
    sort_order: (last?.sort_order ?? 0) + 1,
  });
  return { error: error?.message ?? null };
}

export async function updateArchetype(
  id: string,
  input: ArchetypeInput,
): Promise<void> {
  const supabase = await createClient();
  await supabase.from("archetypes").update(input).eq("id", id);
}

export async function deleteArchetype(
  id: string,
): Promise<{ testSlug: string | null }> {
  const supabase = await createClient();
  const { data: archetype } = await supabase
    .from("archetypes")
    .select("test_id")
    .eq("id", id)
    .single();
  const { data: test } = await supabase
    .from("tests")
    .select("slug")
    .eq("id", archetype?.test_id)
    .single();

  await supabase.from("archetypes").delete().eq("id", id);
  return { testSlug: test?.slug ?? null };
}

// ─── Traits ───────────────────────────────────────────────────────────────────

export async function getAllTraits(testId?: string): Promise<Trait[]> {
  const supabase = await createClient();
  let query = supabase.from("traits").select("*").order("sort_order");
  if (testId) query = query.eq("test_id", testId);
  const { data } = await query;
  return data ?? [];
}

export type CreateTraitInput = {
  slug: string;
  label: string;
  description: string;
  polarity: string | null;
};

export async function createTrait(
  testId: string,
  input: CreateTraitInput,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data: last } = await supabase
    .from("traits")
    .select("sort_order")
    .eq("test_id", testId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const { error } = await supabase.from("traits").insert({
    test_id: testId,
    ...input,
    sort_order: (last?.sort_order ?? 0) + 1,
  });
  return { error: error?.message ?? null };
}

export type UpdateTraitInput = {
  label: string;
  description: string;
  polarity: string | null;
};

export async function updateTrait(
  id: string,
  input: UpdateTraitInput,
): Promise<void> {
  const supabase = await createClient();
  await supabase.from("traits").update(input).eq("id", id);
}

export async function deleteTrait(
  id: string,
): Promise<{ testSlug: string | null; hasQuestions: boolean }> {
  const supabase = await createClient();

  const { count } = await supabase
    .from("questions")
    .select("*", { count: "exact", head: true })
    .eq("trait_id", id)
    .is("deleted_at", null);

  const { data: trait } = await supabase
    .from("traits")
    .select("test_id")
    .eq("id", id)
    .single();
  const { data: test } = await supabase
    .from("tests")
    .select("slug")
    .eq("id", trait?.test_id)
    .single();

  if (count && count > 0) {
    return { testSlug: test?.slug ?? null, hasQuestions: true };
  }

  await supabase.from("traits").delete().eq("id", id);
  return { testSlug: test?.slug ?? null, hasQuestions: false };
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

export type ForcedChoiceOption = { label: string; traitId: string };

export type CreateQuestionInput =
  | { kind: "likert"; text: string; traitId: string; reverseKeyed: boolean }
  | {
      kind: "forced_choice";
      text: string;
      options: [ForcedChoiceOption, ForcedChoiceOption];
    };

export async function createQuestion(
  testId: string,
  input: CreateQuestionInput,
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { data: last } = await supabase
    .from("questions")
    .select("sort_order")
    .eq("test_id", testId)
    .is("deleted_at", null)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();
  const nextOrder = (last?.sort_order ?? 0) + 1;

  if (input.kind === "forced_choice") {
    const { data: question, error } = await supabase
      .from("questions")
      .insert({
        test_id: testId,
        text: input.text,
        kind: "forced_choice",
        sort_order: nextOrder,
      })
      .select("id")
      .single();
    if (error) return { error: error.message };

    await supabase.from("question_options").insert(
      input.options.map((opt, i) => ({
        question_id: question.id,
        label: opt.label,
        value: i,
        trait_id: opt.traitId,
        sort_order: i + 1,
      })),
    );
    return { error: null };
  }

  const { error } = await supabase.from("questions").insert({
    test_id: testId,
    text: input.text,
    kind: "likert",
    trait_id: input.traitId,
    reverse_keyed: input.reverseKeyed,
    sort_order: nextOrder,
  });
  return { error: error?.message ?? null };
}

export type UpdateForcedChoiceOption = {
  id: string;
  label: string;
  traitId: string | null;
};

export type UpdateQuestionInput =
  | {
      kind: "likert";
      text: string;
      traitId: string | null;
      reverseKeyed: boolean;
    }
  | {
      kind: "forced_choice";
      text: string;
      options: UpdateForcedChoiceOption[];
    };

export async function updateQuestion(
  id: string,
  input: UpdateQuestionInput,
): Promise<void> {
  const supabase = await createClient();

  if (input.kind === "forced_choice") {
    await supabase.from("questions").update({ text: input.text }).eq("id", id);
    for (const opt of input.options) {
      await supabase
        .from("question_options")
        .update({ label: opt.label, trait_id: opt.traitId })
        .eq("id", opt.id);
    }
    return;
  }

  await supabase
    .from("questions")
    .update({
      text: input.text,
      trait_id: input.traitId,
      reverse_keyed: input.reverseKeyed,
    })
    .eq("id", id);
}

export async function getQuestionKind(id: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("questions")
    .select("kind")
    .eq("id", id)
    .single();
  return data?.kind ?? null;
}

export async function softDeleteQuestion(
  id: string,
): Promise<{ testSlug: string | null }> {
  const supabase = await createClient();
  const { data: question } = await supabase
    .from("questions")
    .select("test_id")
    .eq("id", id)
    .single();
  const { data: test } = await supabase
    .from("tests")
    .select("slug")
    .eq("id", question?.test_id)
    .single();

  await supabase
    .from("questions")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  return { testSlug: test?.slug ?? null };
}

export async function swapQuestionOrder(
  id: string,
  direction: "up" | "down",
): Promise<{ swapped: boolean }> {
  const supabase = await createClient();
  const { data: current } = await supabase
    .from("questions")
    .select("sort_order, test_id")
    .eq("id", id)
    .single();
  if (!current) return { swapped: false };

  const siblingQuery = supabase
    .from("questions")
    .select("id, sort_order")
    .eq("test_id", current.test_id)
    .is("deleted_at", null)
    .limit(1);

  const { data: sibling } =
    direction === "up"
      ? await siblingQuery
          .lt("sort_order", current.sort_order)
          .order("sort_order", { ascending: false })
          .single()
      : await siblingQuery
          .gt("sort_order", current.sort_order)
          .order("sort_order", { ascending: true })
          .single();

  if (!sibling) return { swapped: false };

  await Promise.all([
    supabase
      .from("questions")
      .update({ sort_order: sibling.sort_order })
      .eq("id", id),
    supabase
      .from("questions")
      .update({ sort_order: current.sort_order })
      .eq("id", sibling.id),
  ]);
  return { swapped: true };
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

export async function createSubmission(
  testId: string,
  answers: AnswerMap,
  scores: ScoreMap,
  archetypeCode: string | null,
): Promise<{ id: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("submissions")
    .insert({
      test_id: testId,
      answers,
      scores,
      archetype_code: archetypeCode,
    })
    .select("id")
    .single();
  if (error) throw error;
  return { id: data.id };
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
