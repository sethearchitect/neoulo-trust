import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import { RINsView } from "./RINsView"
import type { Cell, RINWithRaised } from "@/types"

export default async function AdminRINsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const [rinsResult, cellsResult, contribResult] = await Promise.all([
    supabase.from("rins").select("*"),
    supabase.from("cells").select("*"),
    supabase.from("contributions").select("cell_id, amount").eq("status", "confirmed"),
  ])

  const cells = (cellsResult.data ?? []) as unknown as Cell[]
  const rinsRaw = (rinsResult.data ?? []) as unknown as Array<{
    id: string; cell_id: string; rin_code: string; target: number; status: string
    return_rate: number; asset_node: string | null; notes: string | null
    opened_at: string | null; deployed_at: string | null; expected_return: string | null
  }>
  const contribs = (contribResult.data ?? []) as unknown as Array<{ cell_id: string; amount: number }>

  // Build raised per cell
  const raisedByCell: Record<string, number> = {}
  for (const c of contribs) {
    raisedByCell[c.cell_id] = (raisedByCell[c.cell_id] ?? 0) + c.amount
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

  return <RINsView rins={rins} cells={cells} />
}
