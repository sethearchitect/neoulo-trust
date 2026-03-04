import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import { StartView } from "./StartView"

export default async function StartCellPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Only accessible to users without a members row
  const { data: member } = await supabase
    .from("members")
    .select("role")
    .eq("user_id", user.id)
    .single()

  if (member) redirect("/")

  return <StartView />
}
