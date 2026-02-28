import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  const { data: member } = await supabase
    .from("members")
    .select("role")
    .eq("user_id", session.user.id)
    .single()

  if (!member) {
    // No member row — treat as admin (formalised later via get_my_role())
    redirect("/admin/dashboard")
  }

  if (member.role === "lead") {
    redirect("/lead/cell")
  }

  if (member.role === "member") {
    redirect("/member/home")
  }

  redirect("/admin/dashboard")
}
