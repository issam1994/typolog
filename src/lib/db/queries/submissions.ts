import type { Submission } from "@/types/quiz";
import { createClient } from "../supabase-server";

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
