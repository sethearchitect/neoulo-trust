"use client"

import { useState } from "react"
import { Card } from "@/components/ui/Card"
import { StatCard } from "@/components/ui/StatCard"
import { Badge } from "@/components/ui/Badge"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { fmt, pct } from "@/lib/utils"
import type { Cell, RINWithRaised } from "@/types"

const RIN_STAGES = [
  "draft", "open", "funded", "forwarded",
  "reviewing", "deployed", "yielding", "settled",
] as const

type Props = {
  memberName: string
  memberJoined: string | null
  cell: Cell
  rin: RINWithRaised | null
  myContrib: number
  myShare: number
  totalYield: number
  myYieldShare: number
  memberCount: number
}

export function MemberHomeView({
  memberName,
  memberJoined,
  cell,
  rin,
  myContrib,
  myShare,
  totalYield,
  myYieldShare,
  memberCount,
}: Props) {
  const [rinExpanded, setRinExpanded] = useState(false)
  const currentIdx = rin ? RIN_STAGES.indexOf(rin.status) : -1

  return (
    <div className="fu">
      {/* Greeting */}
      <div className="mb-7">
        <h1 className="font-serif text-[28px] text-[#0D3B20] leading-tight">
          Welcome, {memberName.split(" ")[0]}
        </h1>
        <p className="font-mono text-[12px] text-[#7A7A7A] mt-1">
          {cell.name} · Member since {memberJoined ?? ""}
        </p>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="My Contribution" value={fmt(myContrib)} sub="total paid in" />
        <StatCard label="My Share" value={`${myShare}%`} sub="of total raised" accent />
        <StatCard label="Projected Return" value={fmt(myYieldShare)} sub="yield share" />
      </div>

      {/* Cell info card */}
      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-sans text-[14px] font-semibold text-[#1A1A1A]">{cell.name}</p>
            <p className="font-sans text-[12px] text-[#7A7A7A] mt-0.5">
              📍 {cell.location}, {cell.state}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge status={cell.status} />
            <span className="font-mono text-[11px] text-[#7A7A7A]">{memberCount} members</span>
          </div>
        </div>
      </Card>

      {/* Expandable RIN card */}
      {rin ? (
        <Card className="p-5 mb-6" onClick={() => setRinExpanded(!rinExpanded)}>
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[13px] text-[#C9A84C] font-bold">{rin.rin_code}</span>
            <Badge status={rin.status} />
          </div>
          <ProgressBar value={rin.raised} max={rin.target} color="#C9A84C" height={8} />
          <div className="flex items-center justify-between mt-2">
            <span className="font-mono text-[11px] text-[#7A7A7A]">{fmt(rin.raised)} raised</span>
            <span className="font-mono text-[11px] text-[#7A7A7A]">
              {pct(rin.raised, rin.target)}%
            </span>
          </div>
          <p className="font-mono text-[11px] text-[#7A7A7A] mt-2">
            {rinExpanded ? "Tap to collapse ▲" : "Tap to expand ▼"}
          </p>

          {rinExpanded && (
            <div onClick={(e) => e.stopPropagation()}>
              <div className="border-t border-[#EDE7D6] my-4" />

              {/* Mini lifecycle stepper */}
              <div className="flex items-start w-full overflow-x-auto mb-4">
                {RIN_STAGES.map((stage, i) => (
                  <div key={stage} className="flex items-center flex-1 min-w-0">
                    <div className="flex flex-col items-center">
                      <div
                        className={[
                          "w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold",
                          i < currentIdx
                            ? "bg-[#0D3B20] text-white"
                            : i === currentIdx
                            ? "bg-[#C9A84C] text-white"
                            : "border-2 border-[#E0D9C6] bg-white",
                        ].join(" ")}
                      >
                        {i < currentIdx ? "✓" : i === currentIdx ? stage[0].toUpperCase() : ""}
                      </div>
                      <span className="font-mono text-[8px] text-[#7A7A7A] mt-0.5 text-center leading-tight">
                        {stage}
                      </span>
                    </div>
                    {i < RIN_STAGES.length - 1 && (
                      <div
                        className={[
                          "flex-1 h-[2px] mb-3",
                          i < currentIdx ? "bg-[#0D3B20]" : "bg-[#E0D9C6]",
                        ].join(" ")}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="font-mono text-[10px] text-[#7A7A7A] uppercase tracking-widest mb-0.5">
                    Opened
                  </p>
                  <p className="font-mono text-[12px] text-[#1A1A1A]">{rin.opened_at ?? "—"}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-[#7A7A7A] uppercase tracking-widest mb-0.5">
                    Deployed
                  </p>
                  <p className="font-mono text-[12px] text-[#1A1A1A]">{rin.deployed_at ?? "—"}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-[#7A7A7A] uppercase tracking-widest mb-0.5">
                    Expected Return
                  </p>
                  <p className="font-mono text-[12px] text-[#1A1A1A]">{rin.expected_return ?? "—"}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-[#7A7A7A] uppercase tracking-widest mb-0.5">
                    Return Rate
                  </p>
                  <p className="font-mono text-[12px] text-[#1A1A1A]">{rin.return_rate}%</p>
                </div>
                {rin.asset_node && (
                  <div className="col-span-2">
                    <p className="font-mono text-[10px] text-[#7A7A7A] uppercase tracking-widest mb-0.5">
                      Asset Node
                    </p>
                    <p className="font-sans text-[13px] text-[#1A1A1A]">{rin.asset_node}</p>
                  </div>
                )}
                {rin.notes && (
                  <div className="col-span-2">
                    <p className="font-mono text-[10px] text-[#7A7A7A] uppercase tracking-widest mb-0.5">
                      Notes
                    </p>
                    <p className="font-sans text-[13px] text-[#4A4A4A]">{rin.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      ) : (
        <Card className="p-5 mb-6">
          <p className="font-sans text-[14px] text-[#7A7A7A]">No active RIN for your cell yet.</p>
        </Card>
      )}
    </div>
  )
}
