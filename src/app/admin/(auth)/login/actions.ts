"use server";

import { signIn } from "@/lib/db/auth";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await signIn(email, password);

  if (error) {
    redirect(`/admin/login?error=${encodeURIComponent(error)}`);
  }

  redirect("/admin");
}
