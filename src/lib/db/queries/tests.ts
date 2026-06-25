import type { Question, Trait, Test } from "@/types/quiz";
import { createClient } from "../supabase-server";
import { getAllTraits } from "./traits";
import { getAllQuestions } from "./questions";

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

  const [traits, questions] = await Promise.all([
    getAllTraits(test.id),
    getAllQuestions(test.id),
  ]);

  return { test, traits, questions };
}
