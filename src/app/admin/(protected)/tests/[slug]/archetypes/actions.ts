"use server";

import { requireAdmin } from "@/lib/db/auth";
import {
  createArchetype,
  deleteArchetype,
  updateArchetype,
} from "@/lib/db/queries";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createArchetypeAction(formData: FormData) {
  await requireAdmin();
  const test_id = formData.get("test_id") as string;
  const test_slug = formData.get("test_slug") as string;
  const code = (formData.get("code") as string).trim();
  const label = (formData.get("label") as string).trim();
  const description =
    (formData.get("description") as string | null)?.trim() ?? "";
  const long_form = (formData.get("long_form") as string | null)?.trim() ?? "";

  if (!code || !label)
    redirect(
      `/admin/tests/${test_slug}/archetypes?error=Missing+required+fields`,
    );

  const { error } = await createArchetype(test_id, {
    code,
    label,
    description,
    long_form,
  });

  if (error)
    redirect(
      `/admin/tests/${test_slug}/archetypes?error=${encodeURIComponent(error)}`,
    );

  revalidatePath(`/admin/tests/${test_slug}/archetypes`);
  redirect(`/admin/tests/${test_slug}/archetypes`);
}

export async function updateArchetypeAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const test_slug = formData.get("test_slug") as string;
  const code = (formData.get("code") as string).trim();
  const label = (formData.get("label") as string).trim();
  const description =
    (formData.get("description") as string | null)?.trim() ?? "";
  const long_form = (formData.get("long_form") as string | null)?.trim() ?? "";

  if (!code || !label)
    redirect(
      `/admin/tests/${test_slug}/archetypes?error=Missing+required+fields`,
    );

  await updateArchetype(id, { code, label, description, long_form });

  revalidatePath(`/admin/tests/${test_slug}/archetypes`);
  redirect(`/admin/tests/${test_slug}/archetypes`);
}

export async function deleteArchetypeAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;

  const { testSlug } = await deleteArchetype(id);

  revalidatePath(`/admin/tests/${testSlug}/archetypes`);
  redirect(`/admin/tests/${testSlug}/archetypes`);
}
