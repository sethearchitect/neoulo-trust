import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import { CapitalView } from "./CapitalView"
import type { RINWithRaised } from "@/types"

type RINWithCellRaw = {
  id: string
  cell_id: string
  rin_code: string
  target: number
  status: string
  return_rate: number
  asset_node: string | null
  notes: string | null
  opened_at: string | null
  deployed_at: string | null
  expected_return: string | null
  cells: { name: string; location: string; state: string } | null
}

export default async function AdminCapitalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const [rinsResult, contribResult] = await Promise.all([
    supabase
      .from("rins")
      .select("*, cells(name, location, state)")
      .in("status", ["forwarded", "reviewing", "deployed", "yielding", "settled"]),
    supabase.from("contributions").select("cell_id, amount").eq("status", "confirmed"),
  ])

  const rinsRaw = (rinsResult.data ?? []) as unknown as RINWithCellRaw[]
  const contribs = (contribResult.data ?? []) as unknown as Array<{ cell_id: string; amount: number }>

  // Build raised per cell
  const raisedByCell: Record<string, number> = {}
  for (const c of contribs) {
    raisedByCell[c.cell_id] = (raisedByCell[c.cell_id] ?? 0) + c.amount
  }

  type RINWithCell = RINWithRaised & {
    cell_name: string
    cell_location: string
    cell_state: string
  }

  const allRins: RINWithCell[] = rinsRaw.map((r) => ({
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
    cell_name: r.cells?.name ?? "—",
    cell_location: r.cells?.location ?? "—",
    cell_state: r.cells?.state ?? "—",
  }))

  const forwardedRINs = allRins.filter((r) => r.status === "forwarded" || r.status === "reviewing")
  const activeRINs = allRins.filter((r) =>
    r.status === "deployed" || r.status === "yielding" || r.status === "settled"
  )

  return <CapitalView forwardedRINs={forwardedRINs} activeRINs={activeRINs} />
}
