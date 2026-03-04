"use client"

import { useEffect, useTransition, useState } from "react"
import { useRouter } from "next/navigation"
import { createProfile } from "@/lib/actions"
import type { CellRequest, CellRequestStatus, Profile } from "@/types"

const statusColors: Record<CellRequestStatus, { bg: string; text: string; label: string }> = {
  pending:  { bg: "#2E2000", text: "#FFAA44", label: "Pending" },
  approved: { bg: "#0F2E18", text: "#6AEFAA", label: "Approved" },
  rejected: { bg: "#2E0B00", text: "#FF7A5A", label: "Rejected" },
}

type Props = {
  profile: Profile | null
  requests: CellRequest[]
  cellNames: Record<string, string>
  userEmail: string
}

export function OnboardingView({ profile, requests, cellNames, userEmail }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // After email confirmation, sessionStorage may have pending profile data.
  // Create the profile row if it doesn't exist yet.
  useEffect(() => {
    if (profile) return

    const raw = sessionStorage.getItem("pending_profile")
    if (!raw) return

    let data: { name: string; phone: string; email: string; profession: string }
    try { data = JSON.parse(raw) } catch { return }

    sessionStorage.removeItem("pending_profile")

    startTransition(async () => {
      const result = await createProfile({
        name: data.name,
        phone: data.phone || undefined,
        email: data.email || undefined,
        profession: data.profession || undefined,
      })
      if (!result.error) {
        router.refresh()
      } else {
        setError(result.error)
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const hasPending = requests.some((r) => r.status === "pending")

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <h1
            className="text-3xl text-[#0D3B20] mb-1"
            style={{ fontFamily: "var(--font-dm-serif)" }}
          >
            Neoulo Trust
          </h1>
          <p className="text-sm text-[#7A7A7A]">
            Welcome{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}. Get started below.
          </p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-[#8B2500]/10 text-[#8B2500] text-sm">
            {error}
          </div>
        )}

        {isPending && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-[#0F2E18] text-[#6AEFAA] text-sm text-center">
            Setting up your profile…
          </div>
        )}

        {/* Action cards */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          <button
            onClick={() => router.push("/onboarding/join")}
            disabled={hasPending}
            className="bg-white rounded-2xl border border-[#EDE7D6] shadow-sm px-6 py-6 text-left hover:border-[#0D3B20] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#0D3B20] flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-[#1A1A1A] text-[15px]" style={{ fontFamily: "var(--font-dm-sans)" }}>
                  Join an existing cell
                </p>
                <p className="text-[13px] text-[#7A7A7A] mt-0.5">
                  Request to join a cell in your community. Approved by the cell lead.
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push("/onboarding/start")}
            disabled={hasPending}
            className="bg-white rounded-2xl border border-[#EDE7D6] shadow-sm px-6 py-6 text-left hover:border-[#C9A84C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#C9A84C] flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[#0D3B20]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-[#1A1A1A] text-[15px]" style={{ fontFamily: "var(--font-dm-sans)" }}>
                  Start a new cell
                </p>
                <p className="text-[13px] text-[#7A7A7A] mt-0.5">
                  Propose a new cell in your area. Reviewed and approved by Neoulo admin.
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Existing requests */}
        {requests.length > 0 && (
          <div>
            <p className="font-mono text-[10px] text-[#7A7A7A] uppercase tracking-widest mb-3">
              Your Requests
            </p>
            <div className="flex flex-col gap-3">
              {requests.map((req) => {
                const sc = statusColors[req.status]
                return (
                  <div
                    key={req.id}
                    className="bg-white rounded-2xl border border-[#EDE7D6] px-5 py-4 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-sans text-[13px] font-semibold text-[#1A1A1A]">
                        {req.type === "join_cell"
                          ? `Join — ${req.cell_id ? (cellNames[req.cell_id] ?? "Unknown Cell") : "Unknown Cell"}`
                          : `Start — ${req.proposed_cell_name ?? "New Cell"}`}
                      </p>
                      <p className="font-mono text-[11px] text-[#7A7A7A] mt-0.5">
                        {new Date(req.created_at).toLocaleDateString("en-GB", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </p>
                    </div>
                    <span
                      className="font-mono text-[10px] px-2.5 py-1 rounded-full uppercase tracking-widest flex-shrink-0"
                      style={{ background: sc.bg, color: sc.text }}
                    >
                      {sc.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="mt-10 text-center">
          <form action="/auth/login" method="get">
            <button
              type="button"
              onClick={async () => {
                const { createClient } = await import("@/lib/supabase")
                const supabase = createClient()
                await supabase.auth.signOut()
                window.location.href = "/auth/login"
              }}
              className="text-xs text-[#7A7A7A] hover:text-[#0D3B20] transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
