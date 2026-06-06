import type { Question } from "@/types/quiz";
import { createClient } from "../supabase-server";

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

export async function getQuestionKind(id: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("questions")
    .select("kind")
    .eq("id", id)
    .single();
  return data?.kind ?? null;
}
