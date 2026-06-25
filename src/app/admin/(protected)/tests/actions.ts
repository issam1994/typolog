"use server";

import { requireAdmin } from "@/lib/db/auth";
import { createTest, setTestPublished, updateTest } from "@/lib/db/mutations";
import { getBoolean, getInt, getString } from "@/lib/forms";
import {
  redirectWithError,
  revalidateAndRedirect,
} from "@/lib/admin/navigation";

const TESTS_PATH = "/admin/tests";

export async function createTestAction(formData: FormData) {
  await requireAdmin();
  const name = getString(formData, "name");
  const slug = getString(formData, "slug");
  const question_kind = formData.get("question_kind") as string;
  const scoring_strategy = formData.get("scoring_strategy") as string;
  const result_template = formData.get("result_template") as string;

  if (!name || !slug || !question_kind || !scoring_strategy || !result_template)
    redirectWithError(TESTS_PATH, "Missing fields");

  const { error } = await createTest({
    name,
    slug,
    tagline: getString(formData, "tagline"),
    description: getString(formData, "description"),
    question_kind,
    scoring_strategy,
    result_template,
    estimated_minutes: getInt(formData, "estimated_minutes", 5),
  });

  if (error) redirectWithError(TESTS_PATH, error);

  revalidateAndRedirect(TESTS_PATH);
}

export async function updateTestAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const name = getString(formData, "name");

  if (!name) redirectWithError(TESTS_PATH, "Missing fields");

  const { slug } = await updateTest(id, {
    name,
    tagline: getString(formData, "tagline"),
    description: getString(formData, "description"),
    estimated_minutes: getInt(formData, "estimated_minutes", 5),
  });

  revalidateAndRedirect(`${TESTS_PATH}/${slug}`);
}

export async function togglePublished(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;

  await setTestPublished(id, getBoolean(formData, "is_published"));

  revalidateAndRedirect(TESTS_PATH);
}
