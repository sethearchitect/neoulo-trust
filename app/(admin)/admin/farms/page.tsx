import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import { FarmsView } from "./FarmsView"
import type { CropCycle, YieldLog, ExpenseLog } from "@/types"

type FarmRaw = {
  id: string
  cell_id: string
  crop: string
  plot_size: string | null
  irrigation_type: string | null
  cells: { name: string; location: string } | null
}

type CycleRaw = {
  id: string
  farm_id: string
  season: string | null
  planted_at: string | null
  status: string
}

export default async function AdminFarmsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: farmsRaw } = await supabase
    .from("farms")
    .select("*, cells(name, location)")

  const farms = (farmsRaw ?? []) as unknown as FarmRaw[]

  // For each farm, get latest cycle + logs
  const farmData = await Promise.all(
    farms.map(async (farm) => {
      const { data: cyclesRaw } = await supabase
        .from("crop_cycles")
        .select("*")
        .eq("farm_id", farm.id)
        .order("created_at", { ascending: false })
        .limit(1)

      const cycles = (cyclesRaw ?? []) as unknown as CycleRaw[]
      const cycleRaw = cycles[0] ?? null

      let yieldLogs: YieldLog[] = []
      let expenseLogs: ExpenseLog[] = []

      if (cycleRaw) {
        const [ylResult, elResult] = await Promise.all([
          supabase
            .from("yield_logs")
            .select("*")
            .eq("cycle_id", cycleRaw.id)
            .order("date", { ascending: false }),
          supabase
            .from("expense_logs")
            .select("*")
            .eq("cycle_id", cycleRaw.id)
            .order("date", { ascending: false }),
        ])
        yieldLogs = (ylResult.data ?? []) as unknown as YieldLog[]
        expenseLogs = (elResult.data ?? []) as unknown as ExpenseLog[]
      }

      const cycle: CropCycle | null = cycleRaw
        ? {
            id: cycleRaw.id,
            farm_id: cycleRaw.farm_id,
            season: cycleRaw.season ?? undefined,
            planted_at: cycleRaw.planted_at ?? undefined,
            status: cycleRaw.status as CropCycle["status"],
          }
        : null

      const cellInfo = farm.cells

      return {
        id: farm.id,
        crop: farm.crop,
        plot_size: farm.plot_size,
        irrigation_type: farm.irrigation_type,
        cell_name: cellInfo?.name ?? "—",
        cell_location: cellInfo?.location ?? "—",
        cycle,
        yieldLogs,
        expenseLogs,
      }
    })
  )

  return <FarmsView farms={farmData} />
}
