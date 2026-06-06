import { createClient } from "../supabase-server";

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
