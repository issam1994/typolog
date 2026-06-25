"use server";

import { requireAdmin } from "@/lib/db/auth";
import { createTrait, deleteTrait, updateTrait } from "@/lib/db/mutations";
import { getNullableString, getString } from "@/lib/forms";
import {
  redirectWithError,
  revalidateAndRedirect,
} from "@/lib/admin/navigation";

const traitsPath = (slug: string) => `/admin/tests/${slug}/traits`;

export async function createTraitAction(formData: FormData) {
  await requireAdmin();
  const test_id = formData.get("test_id") as string;
  const path = traitsPath(formData.get("test_slug") as string);
  const slug = getString(formData, "slug");
  const label = getString(formData, "label");

  if (!slug || !label) redirectWithError(path, "Missing required fields");

  const { error } = await createTrait(test_id, {
    slug,
    label,
    description: getString(formData, "description"),
    polarity: getNullableString(formData, "polarity"),
  });

  if (error) redirectWithError(path, error);

  revalidateAndRedirect(path);
}

export async function updateTraitAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const path = traitsPath(formData.get("test_slug") as string);
  const label = getString(formData, "label");

  if (!label) redirectWithError(path, "Missing label");

  await updateTrait(id, {
    label,
    description: getString(formData, "description"),
    polarity: getNullableString(formData, "polarity"),
  });

  revalidateAndRedirect(path);
}

export async function deleteTraitAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;

  const { testSlug, hasQuestions } = await deleteTrait(id);
  const path = traitsPath(testSlug ?? "");

  if (hasQuestions)
    redirectWithError(path, "Cannot delete a trait that has questions");

  revalidateAndRedirect(path);
}
