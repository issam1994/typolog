"use server";

import { requireAdmin } from "@/lib/db/auth";
import { createTrait, deleteTrait, updateTrait } from "@/lib/db/queries";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createTraitAction(formData: FormData) {
  await requireAdmin();
  const test_id = formData.get("test_id") as string;
  const test_slug = formData.get("test_slug") as string;
  const slug = (formData.get("slug") as string).trim();
  const label = (formData.get("label") as string).trim();
  const description =
    (formData.get("description") as string | null)?.trim() ?? "";
  const polarity = (formData.get("polarity") as string | null)?.trim() || null;

  if (!slug || !label)
    redirect(`/admin/tests/${test_slug}/traits?error=Missing+required+fields`);

  const { error } = await createTrait(test_id, {
    slug,
    label,
    description,
    polarity,
  });

  if (error)
    redirect(
      `/admin/tests/${test_slug}/traits?error=${encodeURIComponent(error)}`,
    );

  revalidatePath(`/admin/tests/${test_slug}/traits`);
  redirect(`/admin/tests/${test_slug}/traits`);
}

export async function updateTraitAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const test_slug = formData.get("test_slug") as string;
  const label = (formData.get("label") as string).trim();
  const description =
    (formData.get("description") as string | null)?.trim() ?? "";
  const polarity = (formData.get("polarity") as string | null)?.trim() || null;

  if (!label) redirect(`/admin/tests/${test_slug}/traits?error=Missing+label`);

  await updateTrait(id, { label, description, polarity });

  revalidatePath(`/admin/tests/${test_slug}/traits`);
  redirect(`/admin/tests/${test_slug}/traits`);
}

export async function deleteTraitAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;

  const { testSlug, hasQuestions } = await deleteTrait(id);

  if (hasQuestions) {
    redirect(
      `/admin/tests/${testSlug}/traits?error=Cannot+delete+a+trait+that+has+questions`,
    );
  }

  revalidatePath(`/admin/tests/${testSlug}/traits`);
  redirect(`/admin/tests/${testSlug}/traits`);
}
