import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: member } = await supabase
    .from("members")
    .select("role")
    .eq("user_id", user.id)
    .single()

  if (member?.role === "lead") {
    redirect("/lead/cell")
  }

  if (member?.role === "member") {
    redirect("/member/home")
  }

  // No members row — check if a profiles row exists
  // profiles row → self-signed-up user awaiting cell assignment → /onboarding
  // no profiles row → pre-seeded admin account → /admin/dashboard
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single()

  if (profile) {
    redirect("/onboarding")
  }

  redirect("/admin/dashboard")
}
