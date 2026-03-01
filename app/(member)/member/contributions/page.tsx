import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import { MemberContributionsView } from "./MemberContributionsView"
import type { Contribution } from "@/types"

export default async function MemberContributionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: currentMember } = await supabase
    .from("members")
    .select("id, name, cell_id")
    .eq("user_id", user.id)
    .single()

  if (!currentMember) redirect("/auth/login")

  const memberId = (currentMember as { id: string }).id
  const cellId = (currentMember as { cell_id: string }).cell_id
  const memberName = (currentMember as { name: string }).name

  const [cellResult, contribResult] = await Promise.all([
    supabase.from("cells").select("name").eq("id", cellId).single(),
    supabase
      .from("contributions")
      .select("*")
      .eq("member_id", memberId)
      .order("date", { ascending: false }),
  ])

  const cellName = (cellResult.data as { name: string } | null)?.name ?? "—"
  const contributions = (contribResult.data ?? []) as unknown as Contribution[]
  const myTotal = contributions
    .filter((c) => c.status === "confirmed")
    .reduce((s, c) => s + c.amount, 0)

  return (
    <MemberContributionsView
      memberName={memberName}
      cellName={cellName}
      contributions={contributions}
      myTotal={myTotal}
    />
  )
}
