"use server";

import { requireAdmin } from "@/lib/db/auth";
import { createClient } from "@/lib/db/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createArchetype(formData: FormData) {
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

  const supabase = await createClient();

  const { data: last } = await supabase
    .from("archetypes")
    .select("sort_order")
    .eq("test_id", test_id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const { error } = await supabase.from("archetypes").insert({
    test_id,
    code,
    label,
    description,
    long_form,
    sort_order: (last?.sort_order ?? 0) + 1,
  });

  if (error)
    redirect(
      `/admin/tests/${test_slug}/archetypes?error=${encodeURIComponent(error.message)}`,
    );

  revalidatePath(`/admin/tests/${test_slug}/archetypes`);
  redirect(`/admin/tests/${test_slug}/archetypes`);
}

export async function updateArchetype(formData: FormData) {
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

  const supabase = await createClient();
  await supabase
    .from("archetypes")
    .update({ code, label, description, long_form })
    .eq("id", id);

  revalidatePath(`/admin/tests/${test_slug}/archetypes`);
  redirect(`/admin/tests/${test_slug}/archetypes`);
}

export async function deleteArchetype(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const supabase = await createClient();

  const { data: archetype } = await supabase
    .from("archetypes")
    .select("test_id")
    .eq("id", id)
    .single();
  const { data: test } = await supabase
    .from("tests")
    .select("slug")
    .eq("id", archetype?.test_id)
    .single();

  await supabase.from("archetypes").delete().eq("id", id);

  revalidatePath(`/admin/tests/${test?.slug}/archetypes`);
  redirect(`/admin/tests/${test?.slug}/archetypes`);
}
