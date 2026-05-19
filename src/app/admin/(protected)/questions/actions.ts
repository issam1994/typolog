"use server";

import { requireAdmin } from "@/lib/db/auth";
import { createClient } from "@/lib/db/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createQuestion(formData: FormData) {
  await requireAdmin();
  const text = (formData.get("text") as string).trim();
  const trait_id = formData.get("trait_id") as string;
  if (!text || !trait_id) redirect("/admin/questions?error=Missing+fields");

  const supabase = await createClient();
  const { data: last } = await supabase
    .from("questions")
    .select("sort_order")
    .is("deleted_at", null)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  await supabase.from("questions").insert({
    text,
    trait_id,
    sort_order: (last?.sort_order ?? 0) + 1,
  });

  revalidatePath("/admin/questions");
  redirect("/admin/questions");
}

export async function updateQuestion(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const text = (formData.get("text") as string).trim();
  const trait_id = formData.get("trait_id") as string;
  if (!text || !trait_id) redirect("/admin/questions?error=Missing+fields");

  const supabase = await createClient();
  await supabase.from("questions").update({ text, trait_id }).eq("id", id);

  revalidatePath("/admin/questions");
  redirect("/admin/questions");
}

export async function deleteQuestion(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const supabase = await createClient();
  await supabase
    .from("questions")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/admin/questions");
  redirect("/admin/questions");
}

export async function moveQuestion(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const direction = formData.get("direction") as "up" | "down";

  const supabase = await createClient();
  const { data: current } = await supabase
    .from("questions")
    .select("sort_order, trait_id")
    .eq("id", id)
    .single();
  if (!current) redirect("/admin/questions");

  const siblingQuery = supabase
    .from("questions")
    .select("id, sort_order")
    .eq("trait_id", current.trait_id)
    .is("deleted_at", null)
    .limit(1);

  const { data: sibling } =
    direction === "up"
      ? await siblingQuery
          .lt("sort_order", current.sort_order)
          .order("sort_order", { ascending: false })
          .single()
      : await siblingQuery
          .gt("sort_order", current.sort_order)
          .order("sort_order", { ascending: true })
          .single();

  if (!sibling) redirect("/admin/questions");

  await Promise.all([
    supabase
      .from("questions")
      .update({ sort_order: sibling.sort_order })
      .eq("id", id),
    supabase
      .from("questions")
      .update({ sort_order: current.sort_order })
      .eq("id", sibling.id),
  ]);

  revalidatePath("/admin/questions");
  redirect("/admin/questions");
}
