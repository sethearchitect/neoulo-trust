"use client"

import { useState, useTransition } from "react"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { Avatar } from "@/components/ui/Avatar"
import { fmt, pct } from "@/lib/utils"
import { approveStartCellRequest, rejectStartCellRequest } from "@/lib/actions"
import type { Cell, MemberWithTotal, RINWithRaised, CellRequestWithProfile } from "@/types"

type Props = {
  cells: Cell[]
  rins: RINWithRaised[]
  members: MemberWithTotal[]
  proposals: CellRequestWithProfile[]
}

export function CellsView({ cells, rins, members, proposals }: Props) {
  const [expandedCell, setExpandedCell] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  function handleApprove(requestId: string) {
    setActionError(null)
    setProcessingId(requestId)
    startTransition(async () => {
      const result = await approveStartCellRequest(requestId)
      if (result.error) setActionError(result.error)
      setProcessingId(null)
    })
  }

  function handleReject(requestId: string) {
    setActionError(null)
    setProcessingId(requestId)
    startTransition(async () => {
      const result = await rejectStartCellRequest(requestId)
      if (result.error) setActionError(result.error)
      setProcessingId(null)
    })
  }

  return (
    <div className="fu">
      {/* Page header */}
      <div className="mb-7">
        <h1 className="font-serif text-[28px] text-[#0D3B20] leading-tight">All Cells</h1>
        <p className="font-sans text-[13px] text-[#7A7A7A] mt-1">
          {cells.length} cells · {members.length} total members
        </p>
      </div>

      {/* Cell Proposals Queue */}
      {proposals.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <p className="font-mono text-[10px] text-[#C9A84C] uppercase tracking-widest">
              Cell Proposals
            </p>
            <span className="font-mono text-[10px] bg-[#2E1F00] text-[#FFD06A] px-2 py-0.5 rounded-full">
              {proposals.length} pending
            </span>
          </div>
          {actionError && (
            <p className="font-sans text-[13px] text-[#8B2500] mb-3">{actionError}</p>
          )}
          <div className="flex flex-col gap-3">
            {proposals.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-[#C9A84C]/40 px-5 py-5"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-serif text-[16px] text-[#0D3B20]">
                      {req.proposed_cell_name ?? "—"}
                    </p>
                    <p className="font-sans text-[12px] text-[#7A7A7A] mt-0.5">
                      📍 {req.proposed_location ?? "—"}, {req.proposed_state ?? "—"}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleReject(req.id)}
                      disabled={processingId === req.id || isPending}
                      className="bg-[#EDE7D6] text-[#8B2500] rounded-xl text-[11px] font-semibold px-3 py-1.5 font-sans disabled:opacity-50 hover:bg-[#E0D9C6] transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(req.id)}
                      disabled={processingId === req.id || isPending}
                      className="bg-[#0D3B20] text-white rounded-xl text-[11px] font-semibold px-3 py-1.5 font-sans disabled:opacity-50 hover:opacity-90 transition-opacity"
                    >
                      {processingId === req.id ? "…" : "Approve"}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar name={req.profile?.name ?? "?"} size={28} color="#C9A84C" />
                  <div>
                    <p className="font-sans text-[13px] font-semibold text-[#1A1A1A]">
                      {req.profile?.name ?? "Unknown"}
                    </p>
                    {req.profile?.profession && (
                      <p className="font-sans text-[11px] text-[#7A7A7A]">{req.profile.profession}</p>
                    )}
                  </div>
                </div>
                {req.message && (
                  <p className="font-sans text-[12px] text-[#4A4A4A] mt-3 italic">
                    "{req.message}"
                  </p>
                )}
                <p className="font-mono text-[10px] text-[#7A7A7A] mt-2">
                  Submitted {new Date(req.created_at).toLocaleDateString("en-GB", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cells.map((cell) => {
          const rin = rins.find((r) => r.cell_id === cell.id)
          const cellMembers = members.filter((m) => m.cell_id === cell.id)
          const isExpanded = expandedCell === cell.id

          return (
            <Card key={cell.id} className="fu2 p-0 overflow-hidden">
              {/* Card header */}
              <div className="px-5 pt-5 pb-4">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <span className="font-serif text-[17px] text-[#0D3B20]">{cell.name}</span>
                  <Badge status={cell.status} />
                </div>
                <p className="font-sans text-[12px] text-[#7A7A7A]">
                  📍 {cell.location}, {cell.state}
                </p>
              </div>

              {/* Mini stats grid */}
              <div className="grid grid-cols-3 bg-[#F5F0E8] mx-5 rounded-xl overflow-hidden mb-4">
                <div className="px-3 py-2.5 flex flex-col gap-0.5">
                  <span className="font-mono text-[10px] text-[#7A7A7A] uppercase tracking-wide">
                    Members
                  </span>
                  <span className="font-serif text-[16px] text-[#0D3B20]">{cellMembers.length}</span>
                </div>
                <div className="px-3 py-2.5 flex flex-col gap-0.5 border-x border-[#EDE7D6]">
                  <span className="font-mono text-[10px] text-[#7A7A7A] uppercase tracking-wide">
                    Formed
                  </span>
                  <span className="font-sans text-[13px] text-[#0D3B20]">{cell.formed}</span>
                </div>
                <div className="px-3 py-2.5 flex flex-col gap-0.5">
                  <span className="font-mono text-[10px] text-[#7A7A7A] uppercase tracking-wide">RIN</span>
                  {rin ? <Badge status={rin.status} /> : <span className="font-mono text-[11px] text-[#7A7A7A]">—</span>}
                </div>
              </div>

              {/* Progress */}
              <div className="px-5 mb-4">
                {rin ? (
                  <>
                    <ProgressBar
                      value={rin.raised}
                      max={rin.target}
                      color={cell.status === "active" ? "#C9A84C" : "#1A5C34"}
                    />
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="font-mono text-[11px] text-[#7A7A7A]">{fmt(rin.raised)} raised</span>
                      <span className="font-mono text-[11px] text-[#7A7A7A]">
                        {pct(rin.raised, rin.target)}% of {fmt(rin.target)}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="font-mono text-[11px] text-[#7A7A7A]">No RIN yet</p>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-[#EDE7D6] mx-5" />

              {/* Members toggle */}
              <button
                className="w-full px-5 pt-4 pb-3 flex items-center justify-between text-left"
                onClick={() => setExpandedCell(isExpanded ? null : cell.id)}
              >
                <p className="font-mono text-[10px] text-[#7A7A7A] uppercase tracking-wide">
                  Members ({cellMembers.length})
                </p>
                <span className="font-mono text-[11px] text-[#7A7A7A]">{isExpanded ? "▲" : "▼"}</span>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5">
                  <div className="flex flex-col">
                    {cellMembers.map((m, i) => (
                      <div
                        key={m.id}
                        className={[
                          "flex items-center gap-3 py-2.5",
                          i < cellMembers.length - 1 ? "border-b border-[#F5F0E8]" : "",
                        ].join(" ")}
                      >
                        <Avatar
                          name={m.name}
                          size={28}
                          color={m.role === "lead" ? "#C9A84C" : "#1A5C34"}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-[13px] font-semibold text-[#1A1A1A] truncate">
                            {m.name}
                            {m.role === "lead" && (
                              <span className="ml-1.5 font-mono text-[9px] text-[#C9A84C] uppercase">
                                lead
                              </span>
                            )}
                          </p>
                          {m.profession && (
                            <p className="font-sans text-[11px] text-[#7A7A7A]">{m.profession}</p>
                          )}
                        </div>
                        <span className="font-mono text-[12px] text-[#0D3B20] whitespace-nowrap">
                          {m.contribution_total !== null ? fmt(m.contribution_total) : "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
