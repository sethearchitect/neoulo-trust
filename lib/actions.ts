"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase-server"
import type { ContributionMethod } from "@/types"

// ─── Shared helper: resolves lead context ─────────────────────────────────────

async function getLeadContext() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" as const, supabase, leadName: "", cellId: "" }
  }

  const { data: member } = await supabase
    .from("members")
    .select("id, name, cell_id, role")
    .eq("user_id", user.id)
    .single()

  if (!member || (member as { role: string }).role !== "lead") {
    return { error: "Not authorised" as const, supabase, leadName: "", cellId: "" }
  }

  return {
    error: null,
    supabase,
    leadName: (member as { name: string }).name as string,
    cellId: (member as { cell_id: string }).cell_id as string,
  }
}

// ─── logContribution ──────────────────────────────────────────────────────────

export async function logContribution(data: {
  member_id: string
  amount: number
  date: string
  method: ContributionMethod
  reference?: string
  note?: string
}): Promise<{ error: string | null }> {
  const ctx = await getLeadContext()
  if (ctx.error) return { error: ctx.error }

  const { error } = await ctx.supabase.from("contributions").insert({
    member_id: data.member_id,
    cell_id: ctx.cellId,
    amount: data.amount,
    date: data.date,
    method: data.method,
    reference: data.reference ?? null,
    note: data.note ?? null,
    status: "confirmed",
    confirmed_by: ctx.leadName,
  })

  if (error) return { error: error.message }

  revalidatePath("/lead/members")
  revalidatePath("/lead/cell")
  revalidatePath("/lead/rin")
  return { error: null }
}

// ─── addYieldEntry ────────────────────────────────────────────────────────────

export async function addYieldEntry(data: {
  cycle_id: string
  date: string
  quantity?: string
  value: number
  market_price?: string
  buyer?: string
  notes?: string
}): Promise<{ error: string | null }> {
  const ctx = await getLeadContext()
  if (ctx.error) return { error: ctx.error }

  const { error } = await ctx.supabase.from("yield_logs").insert({
    cycle_id: data.cycle_id,
    date: data.date,
    quantity: data.quantity ?? null,
    value: data.value,
    market_price: data.market_price ?? null,
    buyer: data.buyer ?? null,
    notes: data.notes ?? null,
  })

  if (error) return { error: error.message }

  revalidatePath("/lead/farm")
  revalidatePath("/admin/farms")
  revalidatePath("/member/farm")
  return { error: null }
}

// ─── addExpenseEntry ──────────────────────────────────────────────────────────

export async function addExpenseEntry(data: {
  cycle_id: string
  date: string
  item: string
  amount: number
  vendor?: string
  receipt_no?: string
}): Promise<{ error: string | null }> {
  const ctx = await getLeadContext()
  if (ctx.error) return { error: ctx.error }

  const { error } = await ctx.supabase.from("expense_logs").insert({
    cycle_id: data.cycle_id,
    date: data.date,
    item: data.item,
    amount: data.amount,
    vendor: data.vendor ?? null,
    receipt_no: data.receipt_no ?? null,
  })

  if (error) return { error: error.message }

  revalidatePath("/lead/farm")
  revalidatePath("/admin/farms")
  revalidatePath("/member/farm")
  return { error: null }
}

// ─── forwardRIN ───────────────────────────────────────────────────────────────

export async function forwardRIN(rinId: string): Promise<{ error: string | null }> {
  const ctx = await getLeadContext()
  if (ctx.error) return { error: ctx.error }

  const { error } = await ctx.supabase
    .from("rins")
    .update({ status: "forwarded" })
    .eq("id", rinId)
    .eq("cell_id", ctx.cellId)

  if (error) return { error: error.message }

  revalidatePath("/lead/rin")
  revalidatePath("/admin/rins")
  revalidatePath("/admin/capital")
  revalidatePath("/admin/dashboard")
  return { error: null }
}

// ─── deployCapital ────────────────────────────────────────────────────────────

export async function deployCapital(data: {
  rinId: string
  assetNode: string
}): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const today = new Date().toISOString().split("T")[0]

  const { error } = await supabase
    .from("rins")
    .update({
      status: "deployed",
      asset_node: data.assetNode,
      deployed_at: today,
    })
    .eq("id", data.rinId)

  if (error) return { error: error.message }

  revalidatePath("/admin/capital")
  revalidatePath("/admin/rins")
  revalidatePath("/admin/dashboard")
  revalidatePath("/lead/rin")
  revalidatePath("/member/home")
  return { error: null }
}
