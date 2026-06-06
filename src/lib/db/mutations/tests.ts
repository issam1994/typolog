import { createClient } from "../supabase-server";

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
