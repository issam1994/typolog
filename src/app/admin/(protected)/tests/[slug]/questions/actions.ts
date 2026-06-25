"use server";

import { requireAdmin } from "@/lib/db/auth";
import { getQuestionKind } from "@/lib/db/queries";
import {
  createQuestion,
  softDeleteQuestion,
  swapQuestionOrder,
  updateQuestion,
} from "@/lib/db/mutations";
import { getBoolean, getNullableString, getString } from "@/lib/forms";
import {
  redirectWithError,
  revalidateAndRedirect,
} from "@/lib/admin/navigation";

const questionsPath = (slug: string) => `/admin/tests/${slug}/questions`;

export async function createQuestionAction(formData: FormData) {
  await requireAdmin();
  const test_id = formData.get("test_id") as string;
  const path = questionsPath(formData.get("test_slug") as string);
  const text = getString(formData, "text");
  const kind = formData.get("kind") as string;

  if (!text || !kind) redirectWithError(path, "Missing required fields");

  if (kind === "forced_choice") {
    const option0Label = getString(formData, "option_0_label");
    const option0TraitId = getString(formData, "option_0_trait_id");
    const option1Label = getString(formData, "option_1_label");
    const option1TraitId = getString(formData, "option_1_trait_id");

    if (!option0Label || !option1Label || !option0TraitId || !option1TraitId)
      redirectWithError(
        path,
        "Forced choice questions require two options with traits",
      );

    const { error } = await createQuestion(test_id, {
      kind: "forced_choice",
      text,
      options: [
        { label: option0Label, traitId: option0TraitId },
        { label: option1Label, traitId: option1TraitId },
      ],
    });
    if (error) redirectWithError(path, error);
  } else {
    const traitId = getNullableString(formData, "trait_id");

    if (!traitId) redirectWithError(path, "Likert questions require a trait");

    const { error } = await createQuestion(test_id, {
      kind: "likert",
      text,
      traitId,
      reverseKeyed: getBoolean(formData, "reverse_keyed"),
    });
    if (error) redirectWithError(path, error);
  }

  revalidateAndRedirect(path);
}

export async function updateQuestionAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const path = questionsPath(formData.get("test_slug") as string);
  const text = getString(formData, "text");

  if (!text) redirectWithError(path, "Missing question text");

  const kind = await getQuestionKind(id);

  if (kind === "forced_choice") {
    const options = [0, 1]
      .map((i) => ({
        id: formData.get(`option_${i}_id`) as string,
        label: getString(formData, `option_${i}_label`),
        traitId: getNullableString(formData, `option_${i}_trait_id`),
      }))
      .filter((o) => o.id && o.label);

    await updateQuestion(id, { kind: "forced_choice", text, options });
  } else {
    await updateQuestion(id, {
      kind: "likert",
      text,
      traitId: getNullableString(formData, "trait_id"),
      reverseKeyed: getBoolean(formData, "reverse_keyed"),
    });
  }

  revalidateAndRedirect(path);
}

export async function deleteQuestionAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;

  const { testSlug } = await softDeleteQuestion(id);

  revalidateAndRedirect(questionsPath(testSlug ?? ""));
}

export async function moveQuestionAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const direction = formData.get("direction") as "up" | "down";

  await swapQuestionOrder(id, direction);

  revalidateAndRedirect(questionsPath(formData.get("test_slug") as string));
}
