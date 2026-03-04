"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { submitJoinRequest } from "@/lib/actions"
import type { Cell } from "@/types"

type Props = {
  cells: Cell[]
  memberCounts: Record<string, number>
}

export function JoinView({ cells, memberCounts }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<Cell | null>(null)
  const [message, setMessage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    if (!selected) return
    setError(null)

    startTransition(async () => {
      const result = await submitJoinRequest(selected.id, message || undefined)
      if (result.error) {
        setError(result.error)
      } else {
        router.push("/onboarding")
        router.refresh()
      }
    })
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] px-4 py-10">
      <div className="w-full max-w-md mx-auto">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-[#7A7A7A] text-sm mb-6 hover:text-[#0D3B20] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="mb-7">
          <h1
            className="text-[26px] text-[#0D3B20] leading-tight"
            style={{ fontFamily: "var(--font-dm-serif)" }}
          >
            Join a cell
          </h1>
          <p className="text-[13px] text-[#7A7A7A] mt-1">
            Select a cell in your area. The cell lead will review your request.
          </p>
        </div>

        {/* Cell list */}
        {cells.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#EDE7D6] px-6 py-8 text-center">
            <p className="text-[#7A7A7A] text-sm">No cells available in your area yet.</p>
            <button
              onClick={() => router.push("/onboarding/start")}
              className="mt-4 text-[#0D3B20] font-semibold text-sm hover:underline"
            >
              Start a new cell instead →
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 mb-6">
            {cells.map((cell) => {
              const isSelected = selected?.id === cell.id
              return (
                <button
                  key={cell.id}
                  onClick={() => setSelected(isSelected ? null : cell)}
                  className={[
                    "bg-white rounded-2xl border px-5 py-4 text-left transition-colors",
                    isSelected
                      ? "border-[#0D3B20] shadow-sm"
                      : "border-[#EDE7D6] hover:border-[#C9A84C]",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#1A1A1A] text-[14px]" style={{ fontFamily: "var(--font-dm-sans)" }}>
                        {cell.name}
                      </p>
                      <p className="font-sans text-[12px] text-[#7A7A7A] mt-0.5">
                        📍 {cell.location}, {cell.state}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span
                        className="font-mono text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest"
                        style={{
                          background: cell.status === "active" ? "#0F2E18" : "#0F1F2E",
                          color: cell.status === "active" ? "#6AEFAA" : "#7AC0FF",
                        }}
                      >
                        {cell.status}
                      </span>
                      <span className="font-mono text-[11px] text-[#7A7A7A]">
                        {memberCounts[cell.id] ?? 0} members
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="mt-1 flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#0D3B20] flex items-center justify-center">
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                          <path d="M6.5 1.5L3 5 1.5 3.5 0.5 4.5l2.5 2.5 4.5-4.5z" />
                        </svg>
                      </div>
                      <span className="font-mono text-[10px] text-[#0D3B20]">Selected</span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Optional message */}
        {selected && (
          <div className="bg-white rounded-2xl border border-[#EDE7D6] px-5 py-5 mb-6">
            <label className="block text-[13px] font-medium text-[#4A4A4A] mb-2" style={{ fontFamily: "var(--font-dm-sans)" }}>
              Message to cell lead <span className="text-[#7A7A7A] font-normal">(optional)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Introduce yourself, mention your location or profession…"
              className="w-full px-4 py-3 rounded-xl border border-[#E0D9C6] bg-white text-[#1A1A1A] text-sm placeholder:text-[#7A7A7A] focus:outline-none focus:border-[#0D3B20] transition-colors resize-none"
            />
          </div>
        )}

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-[#8B2500]/10 text-[#8B2500] text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!selected || isPending}
          className="w-full py-3 rounded-xl bg-[#0D3B20] text-white font-semibold text-sm transition-opacity disabled:opacity-40 hover:opacity-90"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          {isPending ? "Submitting…" : `Request to join ${selected?.name ?? "cell"} →`}
        </button>
      </div>
    </div>
  )
}
