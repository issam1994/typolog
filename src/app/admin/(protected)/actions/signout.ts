"use server";

import { createClient } from "@/lib/db/supabase-server";
import { redirect } from "next/navigation";

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
