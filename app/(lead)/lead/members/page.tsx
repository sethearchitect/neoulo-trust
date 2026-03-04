import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import { LeadMembersView } from "./LeadMembersView"
import type { MemberWithTotal, Contribution, CellRequestWithProfile } from "@/types"

export default async function LeadMembersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: currentMember } = await supabase
    .from("members")
    .select("id, cell_id, role")
    .eq("user_id", user.id)
    .single()

  if (!currentMember) redirect("/auth/login")
  const cellId = (currentMember as { cell_id: string }).cell_id

  const [cellResult, membersResult, contribResult, requestsResult] = await Promise.all([
    supabase.from("cells").select("name").eq("id", cellId).single(),
    supabase.from("members").select("*").eq("cell_id", cellId),
    supabase.from("contributions").select("*").eq("cell_id", cellId),
    supabase
      .from("cell_requests")
      .select("*")
      .eq("cell_id", cellId)
      .eq("type", "join_cell")
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
  ])

  const cellName = (cellResult.data as { name: string } | null)?.name ?? "—"
  const membersRaw = (membersResult.data ?? []) as unknown as Array<{
    id: string; cell_id: string; name: string; role: string
    profession: string | null; phone: string | null; email: string | null; joined: string | null
  }>
  const contribsAll = (contribResult.data ?? []) as unknown as Contribution[]
  const requestsRaw = (requestsResult.data ?? []) as unknown as Array<{
    id: string; user_id: string; type: string; cell_id: string | null; message: string | null; status: string; created_at: string
  }>

  // Enrich join requests with profile data
  const requesterIds = requestsRaw.map((r) => r.user_id)
  let profilesMap: Record<string, { name: string; phone: string | null; email: string | null; profession: string | null }> = {}
  if (requesterIds.length > 0) {
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, name, phone, email, profession")
      .in("id", requesterIds)
    for (const p of (profilesData ?? []) as Array<{ id: string; name: string; phone: string | null; email: string | null; profession: string | null }>) {
      profilesMap[p.id] = p
    }
  }

  const joinRequests: CellRequestWithProfile[] = requestsRaw.map((r) => ({
    id: r.id,
    user_id: r.user_id,
    type: "join_cell" as const,
    cell_id: r.cell_id ?? undefined,
    message: r.message ?? undefined,
    status: r.status as "pending",
    created_at: r.created_at,
    profile: profilesMap[r.user_id]
      ? {
          id: r.user_id,
          name: profilesMap[r.user_id].name,
          phone: profilesMap[r.user_id].phone ?? undefined,
          email: profilesMap[r.user_id].email ?? undefined,
          profession: profilesMap[r.user_id].profession ?? undefined,
        }
      : null,
  }))

  // Build total per member (confirmed only)
  const totalByMember: Record<string, number> = {}
  for (const c of contribsAll) {
    if (c.status === "confirmed") {
      totalByMember[c.member_id] = (totalByMember[c.member_id] ?? 0) + c.amount
    }
  }

  // Build full contribution history per member (newest first)
  const contribsByMember: Record<string, Contribution[]> = {}
  for (const c of contribsAll) {
    if (!contribsByMember[c.member_id]) contribsByMember[c.member_id] = []
    contribsByMember[c.member_id].push(c)
  }
  for (const id of Object.keys(contribsByMember)) {
    contribsByMember[id].sort((a, b) => b.date.localeCompare(a.date))
  }

  const members: MemberWithTotal[] = membersRaw.map((m) => ({
    id: m.id,
    cell_id: m.cell_id,
    name: m.name,
    role: m.role as "lead" | "member",
    profession: m.profession ?? undefined,
    phone: m.phone ?? undefined,
    email: m.email ?? undefined,
    joined: m.joined ?? undefined,
    contribution_total: totalByMember[m.id] ?? null,
  }))

  return (
    <LeadMembersView
      cellName={cellName}
      members={members}
      contribsByMember={contribsByMember}
      joinRequests={joinRequests}
    />
  )
}
