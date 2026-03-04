"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
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

// ─── signOut ──────────────────────────────────────────────────────────────────

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}

// ─── createProfile ────────────────────────────────────────────────────────────

export async function createProfile(data: {
  name: string
  phone?: string
  email?: string
  profession?: string
}): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase.from("profiles").insert({
    id: user.id,
    name: data.name,
    phone: data.phone ?? null,
    email: data.email ?? null,
    profession: data.profession ?? null,
  })

  if (error) return { error: error.message }
  return { error: null }
}

// ─── submitJoinRequest ────────────────────────────────────────────────────────

export async function submitJoinRequest(
  cellId: string,
  message?: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase.from("cell_requests").insert({
    user_id: user.id,
    type: "join_cell",
    cell_id: cellId,
    message: message ?? null,
    status: "pending",
  })

  if (error) return { error: error.message }
  revalidatePath("/onboarding")
  return { error: null }
}

// ─── submitStartCellRequest ───────────────────────────────────────────────────

export async function submitStartCellRequest(data: {
  name: string
  location: string
  state: string
  message?: string
}): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase.from("cell_requests").insert({
    user_id: user.id,
    type: "start_cell",
    proposed_cell_name: data.name,
    proposed_location: data.location,
    proposed_state: data.state,
    message: data.message ?? null,
    status: "pending",
  })

  if (error) return { error: error.message }
  revalidatePath("/onboarding")
  return { error: null }
}

// ─── approveJoinRequest ───────────────────────────────────────────────────────

export async function approveJoinRequest(
  requestId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  // Fetch the request
  const { data: req, error: reqError } = await supabase
    .from("cell_requests")
    .select("*")
    .eq("id", requestId)
    .eq("type", "join_cell")
    .eq("status", "pending")
    .single()

  if (reqError || !req) return { error: "Request not found" }

  const request = req as {
    id: string; user_id: string; cell_id: string
  }

  // Fetch profile for joined date label
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, phone, email, profession")
    .eq("id", request.user_id)
    .single()

  const profileData = profile as {
    name: string; phone: string | null; email: string | null; profession: string | null
  } | null

  // Fetch lead name for confirmed_by equivalent
  const { data: leadMember } = await supabase
    .from("members")
    .select("name")
    .eq("user_id", user.id)
    .single()
  const leadName = (leadMember as { name: string } | null)?.name ?? "Lead"

  const now = new Date()
  const joined = now.toLocaleDateString("en-GB", { month: "short", year: "numeric" })

  // Create member row
  const { error: memberError } = await supabase.from("members").insert({
    cell_id: request.cell_id,
    user_id: request.user_id,
    name: profileData?.name ?? "Member",
    role: "member",
    profession: profileData?.profession ?? null,
    phone: profileData?.phone ?? null,
    email: profileData?.email ?? null,
    joined,
  })

  if (memberError) return { error: memberError.message }

  // Mark request approved
  await supabase
    .from("cell_requests")
    .update({ status: "approved", reviewed_by: leadName, reviewed_at: now.toISOString() })
    .eq("id", requestId)

  // Send approval email via Edge Function (best-effort)
  if (profileData?.email) {
    const { data: cell } = await supabase
      .from("cells")
      .select("name")
      .eq("id", request.cell_id)
      .single()
    const cellName = (cell as { name: string } | null)?.name ?? "your cell"

    await supabase.functions.invoke("send-approval-email", {
      body: { email: profileData.email, name: profileData.name, cellName, type: "join_cell" },
    })
  }

  revalidatePath("/lead/members")
  revalidatePath("/admin/cells")
  return { error: null }
}

// ─── rejectJoinRequest ────────────────────────────────────────────────────────

export async function rejectJoinRequest(
  requestId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data: leadMember } = await supabase
    .from("members")
    .select("name")
    .eq("user_id", user.id)
    .single()
  const leadName = (leadMember as { name: string } | null)?.name ?? "Lead"

  const { error } = await supabase
    .from("cell_requests")
    .update({ status: "rejected", reviewed_by: leadName, reviewed_at: new Date().toISOString() })
    .eq("id", requestId)

  if (error) return { error: error.message }

  revalidatePath("/lead/members")
  return { error: null }
}

// ─── approveStartCellRequest ──────────────────────────────────────────────────

export async function approveStartCellRequest(
  requestId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  // Fetch request
  const { data: req, error: reqError } = await supabase
    .from("cell_requests")
    .select("*")
    .eq("id", requestId)
    .eq("type", "start_cell")
    .eq("status", "pending")
    .single()

  if (reqError || !req) return { error: "Request not found" }

  const request = req as {
    id: string; user_id: string;
    proposed_cell_name: string; proposed_location: string; proposed_state: string
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, phone, email, profession")
    .eq("id", request.user_id)
    .single()

  const profileData = profile as {
    name: string; phone: string | null; email: string | null; profession: string | null
  } | null

  const now = new Date()
  const formed = now.toLocaleDateString("en-GB", { month: "short", year: "numeric" })

  // Create cell
  const { data: newCell, error: cellError } = await supabase
    .from("cells")
    .insert({
      name: request.proposed_cell_name,
      location: request.proposed_location,
      state: request.proposed_state,
      formed,
      status: "forming",
    })
    .select("id")
    .single()

  if (cellError || !newCell) return { error: cellError?.message ?? "Failed to create cell" }

  const cellId = (newCell as { id: string }).id

  // Create member as lead
  const { error: memberError } = await supabase.from("members").insert({
    cell_id: cellId,
    user_id: request.user_id,
    name: profileData?.name ?? "Lead",
    role: "lead",
    profession: profileData?.profession ?? null,
    phone: profileData?.phone ?? null,
    email: profileData?.email ?? null,
    joined: formed,
  })

  if (memberError) return { error: memberError.message }

  // Mark approved
  await supabase
    .from("cell_requests")
    .update({ status: "approved", reviewed_by: "Neoulo Admin", reviewed_at: now.toISOString() })
    .eq("id", requestId)

  // Send approval email (best-effort)
  if (profileData?.email) {
    await supabase.functions.invoke("send-approval-email", {
      body: {
        email: profileData.email,
        name: profileData.name,
        cellName: request.proposed_cell_name,
        type: "start_cell",
      },
    })
  }

  revalidatePath("/admin/cells")
  revalidatePath("/admin/dashboard")
  return { error: null }
}

// ─── rejectStartCellRequest ───────────────────────────────────────────────────

export async function rejectStartCellRequest(
  requestId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase
    .from("cell_requests")
    .update({ status: "rejected", reviewed_by: "Neoulo Admin", reviewed_at: new Date().toISOString() })
    .eq("id", requestId)

  if (error) return { error: error.message }

  revalidatePath("/admin/cells")
  return { error: null }
}
