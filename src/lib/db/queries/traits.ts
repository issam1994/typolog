import type { Trait } from "@/types/quiz";
import { createClient } from "../supabase-server";

export async function getAllTraits(testId?: string): Promise<Trait[]> {
  const supabase = await createClient();
  let query = supabase.from("traits").select("*").order("sort_order");
  if (testId) query = query.eq("test_id", testId);
  const { data } = await query;
  return data ?? [];
}
