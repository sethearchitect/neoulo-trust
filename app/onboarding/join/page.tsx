import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import { JoinView } from "./JoinView"
import type { Cell } from "@/types"

export default async function JoinCellPage() {
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

  // List all joinable cells (active or forming)
  const { data: cellsData } = await supabase
    .from("cells")
    .select("id, name, location, state, status, formed")
    .in("status", ["active", "forming"])
    .order("name")

  const cells = (cellsData ?? []) as unknown as Cell[]

  // Count members per cell
  const cellIds = cells.map((c) => c.id)
  let memberCounts: Record<string, number> = {}
  if (cellIds.length > 0) {
    const { data: membersData } = await supabase
      .from("members")
      .select("cell_id")
      .in("cell_id", cellIds)
    for (const m of (membersData ?? []) as Array<{ cell_id: string }>) {
      memberCounts[m.cell_id] = (memberCounts[m.cell_id] ?? 0) + 1
    }
  }

  return <JoinView cells={cells} memberCounts={memberCounts} />
}
