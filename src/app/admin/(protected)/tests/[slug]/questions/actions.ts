"use server";

import { requireAdmin } from "@/lib/db/auth";
import { createClient } from "@/lib/db/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createQuestion(formData: FormData) {
  await requireAdmin();
  const test_id = formData.get("test_id") as string;
  const test_slug = formData.get("test_slug") as string;
  const text = (formData.get("text") as string).trim();
  const kind = formData.get("kind") as string;

  if (!text || !kind)
    redirect(
      `/admin/tests/${test_slug}/questions?error=Missing+required+fields`,
    );

  const supabase = await createClient();

  const { data: last } = await supabase
    .from("questions")
    .select("sort_order")
    .eq("test_id", test_id)
    .is("deleted_at", null)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();
  const nextOrder = (last?.sort_order ?? 0) + 1;

  if (kind === "forced_choice") {
    const option0Label = (formData.get("option_0_label") as string)?.trim();
    const option0TraitId = formData.get("option_0_trait_id") as string;
    const option1Label = (formData.get("option_1_label") as string)?.trim();
    const option1TraitId = formData.get("option_1_trait_id") as string;

    if (!option0Label || !option1Label || !option0TraitId || !option1TraitId)
      redirect(
        `/admin/tests/${test_slug}/questions?error=Forced+choice+questions+require+two+options+with+traits`,
      );

    const { data: question, error } = await supabase
      .from("questions")
      .insert({ test_id, text, kind: "forced_choice", sort_order: nextOrder })
      .select("id")
      .single();
    if (error)
      redirect(
        `/admin/tests/${test_slug}/questions?error=${encodeURIComponent(error.message)}`,
      );

    await supabase.from("question_options").insert([
      {
        question_id: question.id,
        label: option0Label,
        value: 0,
        trait_id: option0TraitId,
        sort_order: 1,
      },
      {
        question_id: question.id,
        label: option1Label,
        value: 1,
        trait_id: option1TraitId,
        sort_order: 2,
      },
    ]);
  } else {
    const trait_id = (formData.get("trait_id") as string) || null;
    const reverse_keyed = formData.get("reverse_keyed") === "true";

    if (!trait_id)
      redirect(
        `/admin/tests/${test_slug}/questions?error=Likert+questions+require+a+trait`,
      );

    const { error } = await supabase.from("questions").insert({
      test_id,
      text,
      kind: "likert",
      trait_id,
      reverse_keyed,
      sort_order: nextOrder,
    });
    if (error)
      redirect(
        `/admin/tests/${test_slug}/questions?error=${encodeURIComponent(error.message)}`,
      );
  }

  revalidatePath(`/admin/tests/${test_slug}/questions`);
  redirect(`/admin/tests/${test_slug}/questions`);
}

export async function updateQuestion(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const test_slug = formData.get("test_slug") as string;
  const text = (formData.get("text") as string).trim();

  if (!text)
    redirect(`/admin/tests/${test_slug}/questions?error=Missing+question+text`);

  const supabase = await createClient();

  const { data: question } = await supabase
    .from("questions")
    .select("kind")
    .eq("id", id)
    .single();

  if (question?.kind === "forced_choice") {
    await supabase.from("questions").update({ text }).eq("id", id);

    for (const i of [0, 1]) {
      const optId = formData.get(`option_${i}_id`) as string;
      const optLabel = (formData.get(`option_${i}_label`) as string)?.trim();
      const optTraitId = formData.get(`option_${i}_trait_id`) as string;
      if (optId && optLabel) {
        await supabase
          .from("question_options")
          .update({
            label: optLabel,
            trait_id: optTraitId || null,
          })
          .eq("id", optId);
      }
    }
  } else {
    const trait_id = (formData.get("trait_id") as string) || null;
    const reverse_keyed = formData.get("reverse_keyed") === "true";
    await supabase
      .from("questions")
      .update({ text, trait_id, reverse_keyed })
      .eq("id", id);
  }

  revalidatePath(`/admin/tests/${test_slug}/questions`);
  redirect(`/admin/tests/${test_slug}/questions`);
}

export async function deleteQuestion(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
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

  revalidatePath(`/admin/tests/${test?.slug}/questions`);
  redirect(`/admin/tests/${test?.slug}/questions`);
}

export async function moveQuestion(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const direction = formData.get("direction") as "up" | "down";
  const test_slug = formData.get("test_slug") as string;

  const supabase = await createClient();
  const { data: current } = await supabase
    .from("questions")
    .select("sort_order, test_id")
    .eq("id", id)
    .single();
  if (!current) redirect(`/admin/tests/${test_slug}/questions`);

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

  if (!sibling) redirect(`/admin/tests/${test_slug}/questions`);

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

  revalidatePath(`/admin/tests/${test_slug}/questions`);
  redirect(`/admin/tests/${test_slug}/questions`);
}
