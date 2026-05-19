"use server";

import { createClient } from "@/lib/db/supabase-server";

export async function submitQuiz(
  answers: Record<string, number>,
  scores: Record<string, number>,
) {
  const supabase = await createClient();
  await supabase.from("submissions").insert({ answers, scores });
}
