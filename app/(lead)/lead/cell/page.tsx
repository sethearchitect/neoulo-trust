"use client"

import { Card } from "@/components/ui/Card"
import { StatCard } from "@/components/ui/StatCard"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { Avatar } from "@/components/ui/Avatar"
import { Badge } from "@/components/ui/Badge"
import { MEMBERS, MOCK_CELL, MOCK_RIN } from "@/lib/mock-data"
import { fmt, pct } from "@/lib/utils"

const alphaMembers = MEMBERS.filter((m) => m.cell_id === MOCK_CELL.id)

export default function LeadCellPage() {
  return (
    <div className="fu">
      {/* Header */}
      <div className="mb-7">
        <h1 className="font-serif text-[28px] text-[#0D3B20] leading-tight">My Cell</h1>
        <p className="font-mono text-[12px] text-[#7A7A7A] mt-1">
          {MOCK_CELL.name} · {MOCK_CELL.location}, {MOCK_CELL.state}
        </p>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Members" value={alphaMembers.length} sub="6 active" />
        <StatCard label="Total Raised" value={fmt(MOCK_RIN.raised)} sub="of target" accent />
        <StatCard label="RIN Target" value={fmt(MOCK_RIN.target)} sub={MOCK_RIN.rin_code} />
      </div>

      {/* RIN progress card */}
      <Card className="p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[13px] text-[#C9A84C] font-bold">{MOCK_RIN.rin_code}</span>
          <Badge status={MOCK_RIN.status} />
        </div>
        <ProgressBar value={MOCK_RIN.raised} max={MOCK_RIN.target} color="#C9A84C" height={10} />
        <div className="flex items-center justify-between mt-2">
          <span className="font-mono text-[11px] text-[#7A7A7A]">{fmt(MOCK_RIN.raised)} raised</span>
          <span className="font-mono text-[11px] text-[#7A7A7A]">
            {pct(MOCK_RIN.raised, MOCK_RIN.target)}%
          </span>
        </div>
      </Card>

      {/* Member roster */}
      <h2 className="font-serif text-[18px] text-[#0D3B20] mb-3">Member Roster</h2>
      <div className="flex flex-col gap-2">
        {alphaMembers.map((m) => (
          <Card key={m.id} className="p-4">
            <div className="flex items-center gap-3">
              <Avatar
                name={m.name}
                size={36}
                color={m.role === "lead" ? "#C9A84C" : "#0D3B20"}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-sans text-[14px] font-semibold text-[#1A1A1A]">
                    {m.name}
                  </span>
                  {m.role === "lead" && (
                    <span className="font-mono text-[9px] text-[#C9A84C] uppercase tracking-widest">
                      LEAD
                    </span>
                  )}
                </div>
                {m.profession && (
                  <p className="font-sans text-[12px] text-[#7A7A7A]">{m.profession}</p>
                )}
              </div>
              <span className="font-mono text-[13px] text-[#C9A84C] font-bold whitespace-nowrap">
                {m.contribution_total !== null ? fmt(m.contribution_total) : "—"}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
