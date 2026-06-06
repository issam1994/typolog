import type { Question, Trait, Test } from "@/types/quiz";
import { createClient } from "../supabase-server";

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
