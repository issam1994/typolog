"use server";

import { requireAdmin } from "@/lib/db/auth";
import { getQuestionKind } from "@/lib/db/queries";
import {
  createQuestion,
  softDeleteQuestion,
  swapQuestionOrder,
  updateQuestion,
} from "@/lib/db/mutations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createQuestionAction(formData: FormData) {
  await requireAdmin();
  const test_id = formData.get("test_id") as string;
  const test_slug = formData.get("test_slug") as string;
  const text = (formData.get("text") as string).trim();
  const kind = formData.get("kind") as string;

  if (!text || !kind)
    redirect(
      `/admin/tests/${test_slug}/questions?error=Missing+required+fields`,
    );

  if (kind === "forced_choice") {
    const option0Label = (formData.get("option_0_label") as string)?.trim();
    const option0TraitId = formData.get("option_0_trait_id") as string;
    const option1Label = (formData.get("option_1_label") as string)?.trim();
    const option1TraitId = formData.get("option_1_trait_id") as string;

    if (!option0Label || !option1Label || !option0TraitId || !option1TraitId)
      redirect(
        `/admin/tests/${test_slug}/questions?error=Forced+choice+questions+require+two+options+with+traits`,
      );

    const { error } = await createQuestion(test_id, {
      kind: "forced_choice",
      text,
      options: [
        { label: option0Label, traitId: option0TraitId },
        { label: option1Label, traitId: option1TraitId },
      ],
    });
    if (error)
      redirect(
        `/admin/tests/${test_slug}/questions?error=${encodeURIComponent(error)}`,
      );
  } else {
    const trait_id = (formData.get("trait_id") as string) || null;
    const reverse_keyed = formData.get("reverse_keyed") === "true";

    if (!trait_id)
      redirect(
        `/admin/tests/${test_slug}/questions?error=Likert+questions+require+a+trait`,
      );

    const { error } = await createQuestion(test_id, {
      kind: "likert",
      text,
      traitId: trait_id,
      reverseKeyed: reverse_keyed,
    });
    if (error)
      redirect(
        `/admin/tests/${test_slug}/questions?error=${encodeURIComponent(error)}`,
      );
  }

  revalidatePath(`/admin/tests/${test_slug}/questions`);
  redirect(`/admin/tests/${test_slug}/questions`);
}

export async function updateQuestionAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const test_slug = formData.get("test_slug") as string;
  const text = (formData.get("text") as string).trim();

  if (!text)
    redirect(`/admin/tests/${test_slug}/questions?error=Missing+question+text`);

  const kind = await getQuestionKind(id);

  if (kind === "forced_choice") {
    const options = [0, 1]
      .map((i) => ({
        id: formData.get(`option_${i}_id`) as string,
        label: (formData.get(`option_${i}_label`) as string)?.trim(),
        traitId: (formData.get(`option_${i}_trait_id`) as string) || null,
      }))
      .filter((o) => o.id && o.label);

    await updateQuestion(id, {
      kind: "forced_choice",
      text,
      options,
    });
  } else {
    const trait_id = (formData.get("trait_id") as string) || null;
    const reverse_keyed = formData.get("reverse_keyed") === "true";
    await updateQuestion(id, {
      kind: "likert",
      text,
      traitId: trait_id,
      reverseKeyed: reverse_keyed,
    });
  }

  revalidatePath(`/admin/tests/${test_slug}/questions`);
  redirect(`/admin/tests/${test_slug}/questions`);
}

export async function deleteQuestionAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;

  const { testSlug } = await softDeleteQuestion(id);

  revalidatePath(`/admin/tests/${testSlug}/questions`);
  redirect(`/admin/tests/${testSlug}/questions`);
}

export async function moveQuestionAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const direction = formData.get("direction") as "up" | "down";
  const test_slug = formData.get("test_slug") as string;

  await swapQuestionOrder(id, direction);

  revalidatePath(`/admin/tests/${test_slug}/questions`);
  redirect(`/admin/tests/${test_slug}/questions`);
}
