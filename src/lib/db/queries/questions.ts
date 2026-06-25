import type { Question, QuestionOption } from "@/types/quiz";
import { createClient } from "../supabase-server";

/** A `questions` row with its joined `question_options` (pre-sorting). */
type QuestionRow = Omit<Question, "options"> & {
  question_options: QuestionOption[] | null;
};

/** Lift a joined DB row into a domain {@link Question} with sorted options. */
function rowToQuestion(row: QuestionRow): Question {
  const { question_options, ...rest } = row;
  const options = [...(question_options ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  return { ...rest, options } as Question;
}

export async function getAllQuestions(testId?: string): Promise<Question[]> {
  const supabase = await createClient();
  let query = supabase
    .from("questions")
    .select("*, question_options(*)")
    .is("deleted_at", null)
    .order("sort_order");
  if (testId) query = query.eq("test_id", testId);
  const { data } = await query;
  return ((data as QuestionRow[] | null) ?? []).map(rowToQuestion);
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
