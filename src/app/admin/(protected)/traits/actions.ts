"use server";

import { requireAdmin } from "@/lib/db/auth";
import { createClient } from "@/lib/db/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateTrait(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const label = (formData.get("label") as string).trim();
  const description = (formData.get("description") as string).trim();
  if (!label || !description) redirect("/admin/traits?error=Missing+fields");

  const supabase = await createClient();
  await supabase.from("traits").update({ label, description }).eq("id", id);

  revalidatePath("/admin/traits");
  redirect("/admin/traits");
}
