import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import { LeadMembersView } from "./LeadMembersView"
import type { MemberWithTotal, Contribution } from "@/types"

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

  const [cellResult, membersResult, contribResult] = await Promise.all([
    supabase.from("cells").select("name").eq("id", cellId).single(),
    supabase.from("members").select("*").eq("cell_id", cellId),
    supabase.from("contributions").select("*").eq("cell_id", cellId),
  ])

  const cellName = (cellResult.data as { name: string } | null)?.name ?? "—"
  const membersRaw = (membersResult.data ?? []) as unknown as Array<{
    id: string; cell_id: string; name: string; role: string
    profession: string | null; phone: string | null; email: string | null; joined: string | null
  }>
  const contribsAll = (contribResult.data ?? []) as unknown as Contribution[]

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

  return <LeadMembersView cellName={cellName} members={members} contribsByMember={contribsByMember} />
}
