import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import { OnboardingView } from "./OnboardingView"
import type { CellRequest, Profile } from "@/types"
import { createProfile } from "@/lib/actions"

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Check if already a member — redirect to portal
  const { data: member } = await supabase
    .from("members")
    .select("role")
    .eq("user_id", user.id)
    .single()

  if (member?.role === "lead") redirect("/lead/cell")
  if (member?.role === "member") redirect("/member/home")

  // Load profile
  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const profile = profileData as Profile | null

  // Load pending requests for this user
  const { data: requestsData } = await supabase
    .from("cell_requests")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const requests = (requestsData ?? []) as unknown as CellRequest[]

  // Enrich join_cell requests with cell name
  const cellIds = requests
    .filter((r) => r.type === "join_cell" && r.cell_id)
    .map((r) => r.cell_id as string)

  let cellNames: Record<string, string> = {}
  if (cellIds.length > 0) {
    const { data: cellsData } = await supabase
      .from("cells")
      .select("id, name")
      .in("id", cellIds)
    for (const c of (cellsData ?? []) as Array<{ id: string; name: string }>) {
      cellNames[c.id] = c.name
    }
  }

  return (
    <OnboardingView
      profile={profile}
      requests={requests}
      cellNames={cellNames}
      userEmail={user.email ?? ""}
    />
  )
}
