"use client"

import { Card } from "@/components/ui/Card"
import { StatCard } from "@/components/ui/StatCard"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { Avatar } from "@/components/ui/Avatar"
import { Badge } from "@/components/ui/Badge"
import { fmt, pct } from "@/lib/utils"
import type { Cell, MemberWithTotal, RINWithRaised } from "@/types"

type Props = {
  cell: Cell
  rin: RINWithRaised | null
  members: MemberWithTotal[]
}

export function LeadCellView({ cell, rin, members }: Props) {
  return (
    <div className="fu">
      {/* Header */}
      <div className="mb-7">
        <h1 className="font-serif text-[28px] text-[#0D3B20] leading-tight">My Cell</h1>
        <p className="font-mono text-[12px] text-[#7A7A7A] mt-1">
          {cell.name} · {cell.location}, {cell.state}
        </p>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Members" value={members.length} sub={`${members.length} active`} />
        <StatCard
          label="Total Raised"
          value={rin ? fmt(rin.raised) : "₦0"}
          sub="of target"
          accent
        />
        <StatCard
          label="RIN Target"
          value={rin ? fmt(rin.target) : "—"}
          sub={rin?.rin_code ?? "No RIN"}
        />
      </div>

      {/* RIN progress card */}
      {rin && (
        <Card className="p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[13px] text-[#C9A84C] font-bold">{rin.rin_code}</span>
            <Badge status={rin.status} />
          </div>
          <ProgressBar value={rin.raised} max={rin.target} color="#C9A84C" height={10} />
          <div className="flex items-center justify-between mt-2">
            <span className="font-mono text-[11px] text-[#7A7A7A]">{fmt(rin.raised)} raised</span>
            <span className="font-mono text-[11px] text-[#7A7A7A]">
              {pct(rin.raised, rin.target)}%
            </span>
          </div>
        </Card>
      )}

      {/* Member roster */}
      <h2 className="font-serif text-[18px] text-[#0D3B20] mb-3">Member Roster</h2>
      <div className="flex flex-col gap-2">
        {members.map((m) => (
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
