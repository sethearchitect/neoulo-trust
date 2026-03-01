import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import { DashboardView } from "./DashboardView"
import type { Cell, RINWithRaised, YieldLog } from "@/types"

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const [cellsResult, rinsResult, contribResult, yieldResult, membersResult] = await Promise.all([
    supabase.from("cells").select("*"),
    supabase.from("rins").select("*"),
    supabase.from("contributions").select("cell_id, amount").eq("status", "confirmed"),
    supabase.from("yield_logs").select("date, quantity, value"),
    supabase.from("members").select("*", { count: "exact", head: true }),
  ])

  const cells = (cellsResult.data ?? []) as unknown as Cell[]
  const rinsRaw = (rinsResult.data ?? []) as unknown as Array<{ id: string; cell_id: string; rin_code: string; target: number; status: string; return_rate: number; asset_node: string | null; notes: string | null; opened_at: string | null; deployed_at: string | null; expected_return: string | null }>
  const contribs = (contribResult.data ?? []) as unknown as Array<{ cell_id: string; amount: number }>
  const yieldLogs = (yieldResult.data ?? []) as unknown as Pick<YieldLog, "date" | "quantity" | "value">[]

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

  // Compute summary stats
  const deployedStatuses = new Set(["deployed", "yielding", "settled"])
  const totalDeployed = rins
    .filter((r) => deployedStatuses.has(r.status))
    .reduce((s, r) => s + r.raised, 0)
  const totalYield = yieldLogs.reduce((s, y) => s + y.value, 0)
  const familiesCount = membersResult.count ?? 0

  return (
    <DashboardView
      cells={cells}
      rins={rins}
      totalDeployed={totalDeployed}
      totalYield={totalYield}
      familiesCount={familiesCount}
      yieldLogs={yieldLogs}
    />
  )
}
