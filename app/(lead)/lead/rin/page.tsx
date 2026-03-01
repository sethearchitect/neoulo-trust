import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import { LeadRINView } from "./LeadRINView"
import type { RINWithRaised } from "@/types"

export default async function LeadRINPage() {
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

  const [cellResult, rinResult, contribResult] = await Promise.all([
    supabase.from("cells").select("name").eq("id", cellId).single(),
    supabase.from("rins").select("*").eq("cell_id", cellId).maybeSingle(),
    supabase.from("contributions").select("amount").eq("cell_id", cellId).eq("status", "confirmed"),
  ])

  const cellName = (cellResult.data as { name: string } | null)?.name ?? "—"
  const rinRaw = rinResult.data as unknown as {
    id: string; cell_id: string; rin_code: string; target: number; status: string
    return_rate: number; asset_node: string | null; notes: string | null
    opened_at: string | null; deployed_at: string | null; expected_return: string | null
  } | null

  const contribs = (contribResult.data ?? []) as unknown as Array<{ amount: number }>
  const raised = contribs.reduce((s, c) => s + c.amount, 0)

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

  return <LeadRINView cellName={cellName} rin={rin} />
}
