"use server";

import { requireAdmin } from "@/lib/db/auth";
import {
  createArchetype,
  deleteArchetype,
  updateArchetype,
} from "@/lib/db/mutations";
import { getString } from "@/lib/forms";
import {
  redirectWithError,
  revalidateAndRedirect,
} from "@/lib/admin/navigation";

const archetypesPath = (slug: string) => `/admin/tests/${slug}/archetypes`;

export async function createArchetypeAction(formData: FormData) {
  await requireAdmin();
  const test_id = formData.get("test_id") as string;
  const path = archetypesPath(formData.get("test_slug") as string);
  const code = getString(formData, "code");
  const label = getString(formData, "label");

  if (!code || !label) redirectWithError(path, "Missing required fields");

  const { error } = await createArchetype(test_id, {
    code,
    label,
    description: getString(formData, "description"),
    long_form: getString(formData, "long_form"),
  });

  if (error) redirectWithError(path, error);

  revalidateAndRedirect(path);
}

export async function updateArchetypeAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const path = archetypesPath(formData.get("test_slug") as string);
  const code = getString(formData, "code");
  const label = getString(formData, "label");

  if (!code || !label) redirectWithError(path, "Missing required fields");

  await updateArchetype(id, {
    code,
    label,
    description: getString(formData, "description"),
    long_form: getString(formData, "long_form"),
  });

  revalidateAndRedirect(path);
}

export async function deleteArchetypeAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;

  const { testSlug } = await deleteArchetype(id);

  revalidateAndRedirect(archetypesPath(testSlug ?? ""));
}
