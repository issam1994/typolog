"use server";

import { requireAdmin } from "@/lib/db/auth";
import { createClient } from "@/lib/db/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createTrait(formData: FormData) {
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

  const supabase = await createClient();

  const { data: last } = await supabase
    .from("traits")
    .select("sort_order")
    .eq("test_id", test_id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const { error } = await supabase.from("traits").insert({
    test_id,
    slug,
    label,
    description,
    polarity,
    sort_order: (last?.sort_order ?? 0) + 1,
  });

  if (error)
    redirect(
      `/admin/tests/${test_slug}/traits?error=${encodeURIComponent(error.message)}`,
    );

  revalidatePath(`/admin/tests/${test_slug}/traits`);
  redirect(`/admin/tests/${test_slug}/traits`);
}

export async function updateTrait(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const test_slug = formData.get("test_slug") as string;
  const label = (formData.get("label") as string).trim();
  const description =
    (formData.get("description") as string | null)?.trim() ?? "";
  const polarity = (formData.get("polarity") as string | null)?.trim() || null;

  if (!label) redirect(`/admin/tests/${test_slug}/traits?error=Missing+label`);

  const supabase = await createClient();
  await supabase
    .from("traits")
    .update({ label, description, polarity })
    .eq("id", id);

  revalidatePath(`/admin/tests/${test_slug}/traits`);
  redirect(`/admin/tests/${test_slug}/traits`);
}

export async function deleteTrait(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const supabase = await createClient();

  // Block deletion if any questions reference this trait
  const { count } = await supabase
    .from("questions")
    .select("*", { count: "exact", head: true })
    .eq("trait_id", id)
    .is("deleted_at", null);

  if (count && count > 0) {
    const { data: trait } = await supabase
      .from("traits")
      .select("test_id")
      .eq("id", id)
      .single();
    const { data: test } = await supabase
      .from("tests")
      .select("slug")
      .eq("id", trait?.test_id)
      .single();
    redirect(
      `/admin/tests/${test?.slug}/traits?error=Cannot+delete+a+trait+that+has+questions`,
    );
  }

  const { data: trait } = await supabase
    .from("traits")
    .select("test_id")
    .eq("id", id)
    .single();
  const { data: test } = await supabase
    .from("tests")
    .select("slug")
    .eq("id", trait?.test_id)
    .single();

  await supabase.from("traits").delete().eq("id", id);

  revalidatePath(`/admin/tests/${test?.slug}/traits`);
  redirect(`/admin/tests/${test?.slug}/traits`);
}
