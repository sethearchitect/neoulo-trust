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

  // No profiles row either — check if user_metadata has a name (self-signup flow).
  // The signup form stores name/phone/profession in Supabase user_metadata so the data
  // survives across tabs and email confirmation links.
  if (user.user_metadata?.name) {
    await supabase.from("profiles").insert({
      id: user.id,
      name: user.user_metadata.name as string,
      phone: (user.user_metadata.phone as string | null) ?? null,
      email: user.email ?? null,
      profession: (user.user_metadata.profession as string | null) ?? null,
    })
    redirect("/onboarding")
  }

  redirect("/admin/dashboard")
}
