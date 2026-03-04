"use client"

import { useState } from "react"
import { StatCard } from "@/components/ui/StatCard"
import { Badge } from "@/components/ui/Badge"
import { fmt } from "@/lib/utils"
import type { Contribution } from "@/types"

type Props = {
  memberName: string
  cellName: string
  contributions: Contribution[]
  myTotal: number
}

export function MemberContributionsView({ memberName, cellName, contributions, myTotal }: Props) {
  const [expanded, setExpanded] = useState<number | null>(null)

  const pendingCount = contributions.filter((c) => c.status === "pending").length

  return (
    <div className="fu">
      {/* Header */}
      <div className="mb-7">
        <h1 className="font-serif text-[28px] text-[#0D3B20] leading-tight">My Contributions</h1>
        <p className="font-mono text-[12px] text-[#7A7A7A] mt-1">
          {memberName} · {cellName}
        </p>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <StatCard
          label="Total Contributed"
          value={fmt(myTotal)}
          sub={`${contributions.length} payments`}
        />
        <StatCard
          label="Status"
          value={pendingCount === 0 ? "All confirmed" : `${pendingCount} pending`}
          sub={pendingCount === 0 ? "no pending entries" : "awaiting confirmation"}
          accent
        />
      </div>

      {/* Contribution list */}
      {contributions.length === 0 ? (
        <p className="font-sans text-[14px] text-[#7A7A7A] text-center py-8">
          No contributions recorded yet.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {contributions.map((c, i) => (
            <div key={c.id}>
              <button
                className="w-full flex items-center justify-between bg-[#F5F0E8] hover:bg-[#EDE7D6] rounded-xl px-4 py-3 transition-colors"
                onClick={() => setExpanded(expanded === i ? null : i)}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-[#7A7A7A]">{c.date}</span>
                  <span
                    className="font-mono text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap"
                    style={{ background: "#232323", color: "#999" }}
                  >
                    {c.method}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[13px] text-[#C9A84C] font-bold">
                    {fmt(c.amount)}
                  </span>
                  <span className="font-mono text-[11px] text-[#7A7A7A]">
                    {expanded === i ? "▲" : "▼"}
                  </span>
                </div>
              </button>
              {expanded === i && (
                <div className="bg-[#F5F0E8] rounded-xl mt-1 px-4 py-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-[#7A7A7A]">Reference</span>
                    <span className="font-mono text-[12px] text-[#1A1A1A]">{c.reference ?? "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-[#7A7A7A]">Note</span>
                    <span className="font-sans text-[12px] text-[#4A4A4A]">{c.note ?? "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-[#7A7A7A]">Confirmed by</span>
                    <span className="font-sans text-[12px] text-[#1A1A1A]">{c.confirmed_by ?? "—"}</span>
                  </div>
                  <div className="mt-1">
                    <Badge status={c.status} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
