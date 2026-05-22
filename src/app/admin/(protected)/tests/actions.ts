"use server";

import { requireAdmin } from "@/lib/db/auth";
import { createClient } from "@/lib/db/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createTest(formData: FormData) {
  await requireAdmin();
  const name = (formData.get("name") as string).trim();
  const slug = (formData.get("slug") as string).trim();
  const tagline = (formData.get("tagline") as string | null)?.trim() ?? "";
  const description =
    (formData.get("description") as string | null)?.trim() ?? "";
  const question_kind = formData.get("question_kind") as string;
  const scoring_strategy = formData.get("scoring_strategy") as string;
  const result_template = formData.get("result_template") as string;
  const estimated_minutes = parseInt(
    formData.get("estimated_minutes") as string,
    10,
  );

  if (!name || !slug || !question_kind || !scoring_strategy || !result_template)
    redirect("/admin/tests?error=Missing+fields");

  const supabase = await createClient();
  const { error } = await supabase.from("tests").insert({
    name,
    slug,
    tagline,
    description,
    question_kind,
    scoring_strategy,
    result_template,
    estimated_minutes: isNaN(estimated_minutes) ? 5 : estimated_minutes,
  });

  if (error)
    redirect(`/admin/tests?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin/tests");
  redirect("/admin/tests");
}

export async function updateTest(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const name = (formData.get("name") as string).trim();
  const tagline = (formData.get("tagline") as string | null)?.trim() ?? "";
  const description =
    (formData.get("description") as string | null)?.trim() ?? "";
  const estimated_minutes = parseInt(
    formData.get("estimated_minutes") as string,
    10,
  );

  if (!name) redirect("/admin/tests?error=Missing+fields");

  const supabase = await createClient();
  const { data: test } = await supabase
    .from("tests")
    .select("slug")
    .eq("id", id)
    .single();

  await supabase
    .from("tests")
    .update({
      name,
      tagline,
      description,
      estimated_minutes: isNaN(estimated_minutes) ? 5 : estimated_minutes,
    })
    .eq("id", id);

  revalidatePath(`/admin/tests/${test?.slug}`);
  redirect(`/admin/tests/${test?.slug}`);
}

export async function togglePublished(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const is_published = formData.get("is_published") === "true";

  const supabase = await createClient();
  await supabase.from("tests").update({ is_published }).eq("id", id);

  revalidatePath("/admin/tests");
  redirect("/admin/tests");
}
