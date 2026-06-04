"use server";

import { signOut } from "@/lib/db/auth";
import { redirect } from "next/navigation";

export async function signOutAction() {
  await signOut();
  redirect("/admin/login");
}
