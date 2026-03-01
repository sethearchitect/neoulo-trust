"use client"

import { useState } from "react"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { Tabs } from "@/components/ui/Tabs"
import { CELLS, RINS } from "@/lib/mock-data"
import { fmt, pct } from "@/lib/utils"
import type { RINStatus } from "@/types"

type FilterId = "all" | RINStatus

const FILTER_TABS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All RINs" },
  { id: "draft", label: "Draft" },
  { id: "open", label: "Open" },
  { id: "funded", label: "Funded" },
  { id: "forwarded", label: "Forwarded" },
  { id: "reviewing", label: "Reviewing" },
  { id: "deployed", label: "Deployed" },
  { id: "yielding", label: "Yielding" },
  { id: "settled", label: "Settled" },
]

export default function AdminRINsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterId>("all")

  const visible = activeFilter === "all"
    ? RINS
    : RINS.filter((r) => r.status === activeFilter)

  return (
    <div className="fu">
      {/* Page header */}
      <div className="mb-7">
        <h1 className="font-serif text-[28px] text-[#0D3B20] leading-tight">
          Revolving Impact Notes
        </h1>
        <p className="font-sans text-[13px] text-[#7A7A7A] mt-1">
          {RINS.length} RINs across {CELLS.length} cells
        </p>
      </div>

      {/* Filter tabs */}
      <div className="mb-6">
        <Tabs
          tabs={FILTER_TABS}
          active={activeFilter}
          onChange={(id) => setActiveFilter(id as FilterId)}
        />
      </div>

      {/* RIN list */}
      {visible.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-sans text-[14px] text-[#7A7A7A]">
            No RINs with this status.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {visible.map((rin) => {
            const cell = CELLS.find((c) => c.id === rin.cell_id)
            return (
              <Card key={rin.id} className="fu2 p-5">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono text-[14px] text-[#C9A84C]">
                        {rin.rin_code}
                      </span>
                      <span className="font-sans text-[14px] font-semibold text-[#1A1A1A]">
                        {cell?.name ?? "—"}
                      </span>
                    </div>
                    {rin.notes && (
                      <p className="font-sans text-[12px] text-[#7A7A7A] mb-1">{rin.notes}</p>
                    )}
                    {rin.asset_node && (
                      <p className="font-sans text-[12px] text-[#B8860B]">
                        🌱 {rin.asset_node}
                      </p>
                    )}
                  </div>
                  <Badge status={rin.status} />
                </div>

                {/* 4-col mini stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 bg-[#F5F0E8] rounded-xl overflow-hidden mb-4">
                  {[
                    { label: "Target", value: fmt(rin.target) },
                    { label: "Raised", value: fmt(rin.raised) },
                    { label: "Return", value: `${rin.return_rate}% p.a.` },
                    { label: "Opened", value: rin.opened_at ?? "—" },
                  ].map((stat, i) => (
                    <div
                      key={stat.label}
                      className={[
                        "px-3 py-2.5 flex flex-col gap-0.5",
                        i > 0 ? "border-l border-[#EDE7D6]" : "",
                      ].join(" ")}
                    >
                      <span className="font-mono text-[10px] text-[#7A7A7A] uppercase tracking-wide">
                        {stat.label}
                      </span>
                      <span className="font-mono text-[12px] text-[#1A1A1A]">{stat.value}</span>
                    </div>
                  ))}
                </div>

                {/* Progress */}
                <ProgressBar
                  value={rin.raised}
                  max={rin.target}
                  color={rin.status === "deployed" ? "#C9A84C" : "#1A5C34"}
                />
                <div className="flex justify-end mt-1.5">
                  <span className="font-mono text-[11px] text-[#7A7A7A]">
                    {pct(rin.raised, rin.target)}% funded
                  </span>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
