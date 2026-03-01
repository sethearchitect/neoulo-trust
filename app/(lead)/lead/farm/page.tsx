import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import { LeadFarmView } from "./LeadFarmView"
import type { Farm, CropCycle, YieldLog, ExpenseLog } from "@/types"

export default async function LeadFarmPage() {
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

  const [cellResult, farmResult] = await Promise.all([
    supabase.from("cells").select("name").eq("id", cellId).single(),
    supabase.from("farms").select("*").eq("cell_id", cellId).maybeSingle(),
  ])

  const cellName = (cellResult.data as { name: string } | null)?.name ?? "—"
  const farmRaw = farmResult.data as unknown as {
    id: string; cell_id: string; crop: string; plot_size: string | null; irrigation_type: string | null
  } | null

  if (!farmRaw) {
    return <LeadFarmView cellName={cellName} farm={null} cycle={null} yieldLogs={[]} expenseLogs={[]} />
  }

  const farm: Farm = {
    id: farmRaw.id,
    cell_id: farmRaw.cell_id,
    crop: farmRaw.crop,
    plot_size: farmRaw.plot_size ?? undefined,
    irrigation_type: farmRaw.irrigation_type ?? undefined,
  }

  // Get latest cycle
  const { data: cyclesRaw } = await supabase
    .from("crop_cycles")
    .select("*")
    .eq("farm_id", farm.id)
    .order("created_at", { ascending: false })
    .limit(1)

  const cycleRaw = (cyclesRaw ?? [])[0] as unknown as {
    id: string; farm_id: string; season: string | null; planted_at: string | null; status: string
  } | undefined

  if (!cycleRaw) {
    return <LeadFarmView cellName={cellName} farm={farm} cycle={null} yieldLogs={[]} expenseLogs={[]} />
  }

  const cycle: CropCycle = {
    id: cycleRaw.id,
    farm_id: cycleRaw.farm_id,
    season: cycleRaw.season ?? undefined,
    planted_at: cycleRaw.planted_at ?? undefined,
    status: cycleRaw.status as CropCycle["status"],
  }

  const [ylResult, elResult] = await Promise.all([
    supabase.from("yield_logs").select("*").eq("cycle_id", cycle.id).order("date", { ascending: false }),
    supabase.from("expense_logs").select("*").eq("cycle_id", cycle.id).order("date", { ascending: false }),
  ])

  const yieldLogs = (ylResult.data ?? []) as unknown as YieldLog[]
  const expenseLogs = (elResult.data ?? []) as unknown as ExpenseLog[]

  return (
    <LeadFarmView
      cellName={cellName}
      farm={farm}
      cycle={cycle}
      yieldLogs={yieldLogs}
      expenseLogs={expenseLogs}
    />
  )
}
