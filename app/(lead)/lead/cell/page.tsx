import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import { LeadCellView } from "./LeadCellView"
import type { Cell, MemberWithTotal, RINWithRaised } from "@/types"

export default async function LeadCellPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: currentMember } = await supabase
    .from("members")
    .select("id, name, cell_id, role")
    .eq("user_id", user.id)
    .single()

  if (!currentMember) redirect("/auth/login")
  const cellId = (currentMember as { cell_id: string }).cell_id

  const [cellResult, rinResult, membersResult, contribResult] = await Promise.all([
    supabase.from("cells").select("*").eq("id", cellId).single(),
    supabase.from("rins").select("*").eq("cell_id", cellId).maybeSingle(),
    supabase.from("members").select("*").eq("cell_id", cellId),
    supabase.from("contributions").select("member_id, amount").eq("cell_id", cellId).eq("status", "confirmed"),
  ])

  const cell = cellResult.data as unknown as Cell
  const rinRaw = rinResult.data as unknown as {
    id: string; cell_id: string; rin_code: string; target: number; status: string
    return_rate: number; asset_node: string | null; notes: string | null
    opened_at: string | null; deployed_at: string | null; expected_return: string | null
  } | null

  const membersRaw = (membersResult.data ?? []) as unknown as Array<{
    id: string; cell_id: string; name: string; role: string
    profession: string | null; phone: string | null; email: string | null; joined: string | null
  }>
  const contribs = (contribResult.data ?? []) as unknown as Array<{ member_id: string; amount: number }>

  // Build total per member
  const totalByMember: Record<string, number> = {}
  for (const c of contribs) {
    totalByMember[c.member_id] = (totalByMember[c.member_id] ?? 0) + c.amount
  }

  const raised = Object.values(totalByMember).reduce((s, v) => s + v, 0)

  const rin: RINWithRaised | null = rinRaw
    ? {
        id: rinRaw.id,
        cell_id: rinRaw.cell_id,
        rin_code: rinRaw.rin_code,
        target: rinRaw.target,
        status: rinRaw.status as RINWithRaised["status"],
        return_rate: rinRaw.return_rate,
        asset_node: rinRaw.asset_node ?? undefined,
        notes: rinRaw.notes ?? undefined,
        opened_at: rinRaw.opened_at ?? undefined,
        deployed_at: rinRaw.deployed_at ?? undefined,
        expected_return: rinRaw.expected_return ?? undefined,
        raised,
      }
    : null

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

  return <LeadCellView cell={cell} rin={rin} members={members} />
}
