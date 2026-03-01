import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import { CellsView } from "./CellsView"
import type { Cell, MemberWithTotal, RINWithRaised } from "@/types"

export default async function AdminCellsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const [cellsResult, rinsResult, membersResult, contribResult] = await Promise.all([
    supabase.from("cells").select("*"),
    supabase.from("rins").select("*"),
    supabase.from("members").select("*"),
    supabase.from("contributions").select("cell_id, member_id, amount").eq("status", "confirmed"),
  ])

  const cells = (cellsResult.data ?? []) as unknown as Cell[]
  const rinsRaw = (rinsResult.data ?? []) as unknown as Array<{ id: string; cell_id: string; rin_code: string; target: number; status: string; return_rate: number; asset_node: string | null; notes: string | null; opened_at: string | null; deployed_at: string | null; expected_return: string | null }>
  const membersRaw = (membersResult.data ?? []) as unknown as Array<{ id: string; cell_id: string; name: string; role: string; profession: string | null; phone: string | null; email: string | null; joined: string | null }>
  const contribs = (contribResult.data ?? []) as unknown as Array<{ cell_id: string; member_id: string; amount: number }>

  // Build raised per cell
  const raisedByCell: Record<string, number> = {}
  for (const c of contribs) {
    raisedByCell[c.cell_id] = (raisedByCell[c.cell_id] ?? 0) + c.amount
  }

  // Build contribution total per member
  const totalByMember: Record<string, number> = {}
  for (const c of contribs) {
    totalByMember[c.member_id] = (totalByMember[c.member_id] ?? 0) + c.amount
  }

  const rins: RINWithRaised[] = rinsRaw.map((r) => ({
    id: r.id,
    cell_id: r.cell_id,
    rin_code: r.rin_code,
    target: r.target,
    status: r.status as RINWithRaised["status"],
    return_rate: r.return_rate,
    asset_node: r.asset_node ?? undefined,
    notes: r.notes ?? undefined,
    opened_at: r.opened_at ?? undefined,
    deployed_at: r.deployed_at ?? undefined,
    expected_return: r.expected_return ?? undefined,
    raised: raisedByCell[r.cell_id] ?? 0,
  }))

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

  return <CellsView cells={cells} rins={rins} members={members} />
}
