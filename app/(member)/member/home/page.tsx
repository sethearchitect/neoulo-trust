import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import { MemberHomeView } from "./MemberHomeView"
import { pct } from "@/lib/utils"
import type { Cell, RINWithRaised } from "@/types"

export default async function MemberHomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: currentMember } = await supabase
    .from("members")
    .select("id, name, cell_id, role, joined")
    .eq("user_id", user.id)
    .single()

  if (!currentMember) redirect("/auth/login")

  const memberId = (currentMember as { id: string }).id
  const cellId = (currentMember as { cell_id: string }).cell_id
  const memberName = (currentMember as { name: string }).name
  const memberJoined = (currentMember as { joined: string | null }).joined

  const [cellResult, rinResult, myContribResult, memberCountResult, raisedResult] = await Promise.all([
    supabase.from("cells").select("*").eq("id", cellId).single(),
    supabase.from("rins").select("*").eq("cell_id", cellId).maybeSingle(),
    supabase.from("contributions").select("amount").eq("member_id", memberId).eq("status", "confirmed"),
    supabase.from("members").select("*", { count: "exact", head: true }).eq("cell_id", cellId),
    supabase.rpc("get_cell_raised", { p_cell_id: cellId }),
  ])

  const cell = cellResult.data as unknown as Cell
  const rinRaw = rinResult.data as unknown as {
    id: string; cell_id: string; rin_code: string; target: number; status: string
    return_rate: number; asset_node: string | null; notes: string | null
    opened_at: string | null; deployed_at: string | null; expected_return: string | null
  } | null

  const myContribs = (myContribResult.data ?? []) as unknown as Array<{ amount: number }>
  const myContrib = myContribs.reduce((s, c) => s + c.amount, 0)
  const raised = (raisedResult.data as number) ?? 0
  const memberCount = memberCountResult.count ?? 0

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

  // Fetch yield logs to compute my yield share
  let totalYield = 0
  if (rin) {
    const farmResult = await supabase.from("farms").select("id").eq("cell_id", cellId).maybeSingle()
    const farmId = (farmResult.data as { id: string } | null)?.id
    if (farmId) {
      const cycleResult = await supabase
        .from("crop_cycles")
        .select("id")
        .eq("farm_id", farmId)
        .order("created_at", { ascending: false })
        .limit(1)
      const cycleId = ((cycleResult.data ?? [])[0] as { id: string } | undefined)?.id
      if (cycleId) {
        const { data: ylData } = await supabase.from("yield_logs").select("value").eq("cycle_id", cycleId)
        totalYield = ((ylData ?? []) as unknown as Array<{ value: number }>).reduce((s, y) => s + y.value, 0)
      }
    }
  }

  const myShare = pct(myContrib, raised)
  const myYieldShare = raised > 0 ? Math.round((myContrib / raised) * totalYield) : 0

  return (
    <MemberHomeView
      memberName={memberName}
      memberJoined={memberJoined}
      cell={cell}
      rin={rin}
      myContrib={myContrib}
      myShare={myShare}
      totalYield={totalYield}
      myYieldShare={myYieldShare}
      memberCount={memberCount}
    />
  )
}
