"use client"

import { useState } from "react"
import { Card } from "@/components/ui/Card"
import { StatCard } from "@/components/ui/StatCard"
import { Badge } from "@/components/ui/Badge"
import { ALPHA_FARM, ALPHA_CYCLE, YIELD_LOGS, EXPENSE_LOGS, MOCK_MEMBER, MOCK_RIN, TOTAL_YIELD } from "@/lib/mock-data"
import { fmt } from "@/lib/utils"

const myContrib = MOCK_MEMBER.contribution_total ?? 0
const myYieldShare = Math.round((myContrib / MOCK_RIN.raised) * TOTAL_YIELD)

export default function MemberFarmPage() {
  const [expandedYield, setExpandedYield] = useState<number | null>(null)
  const [expandedExpense, setExpandedExpense] = useState<number | null>(null)

  return (
    <div className="fu">
      {/* Header */}
      <div className="mb-7">
        <h1 className="font-serif text-[28px] text-[#0D3B20] leading-tight">Farm Updates</h1>
        <p className="font-mono text-[12px] text-[#7A7A7A] mt-1">
          Umuahia Alpha · {ALPHA_FARM.crop}
        </p>
      </div>

      {/* Farm summary card */}
      <Card className="p-5 mb-6" style={{ background: "#F5F0E8" }}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div>
            <p className="font-mono text-[10px] text-[#7A7A7A] uppercase tracking-widest mb-0.5">
              Crop
            </p>
            <p className="font-sans text-[13px] font-semibold text-[#1A1A1A]">{ALPHA_FARM.crop}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-[#7A7A7A] uppercase tracking-widest mb-0.5">
              Plot Size
            </p>
            <p className="font-sans text-[13px] text-[#1A1A1A]">{ALPHA_FARM.plot_size ?? "—"}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-[#7A7A7A] uppercase tracking-widest mb-0.5">
              Irrigation
            </p>
            <p className="font-sans text-[13px] text-[#1A1A1A]">
              {ALPHA_FARM.irrigation_type ?? "—"}
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-[#7A7A7A] uppercase tracking-widest mb-0.5">
              Season
            </p>
            <p className="font-sans text-[13px] text-[#1A1A1A]">{ALPHA_CYCLE.season ?? "—"}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-[#7A7A7A] uppercase tracking-widest mb-0.5">
              Planted
            </p>
            <p className="font-mono text-[13px] text-[#1A1A1A]">{ALPHA_CYCLE.planted_at ?? "—"}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-[#7A7A7A] uppercase tracking-widest mb-0.5">
              Status
            </p>
            <Badge status={ALPHA_CYCLE.status} />
          </div>
        </div>
      </Card>

      {/* Stat row */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard
          label="My Yield Share"
          value={fmt(myYieldShare)}
          sub="based on 17% stake"
          accent
        />
        <StatCard
          label="My Contribution"
          value={fmt(myContrib)}
          sub={`of ${fmt(MOCK_RIN.raised)} raised`}
        />
      </div>

      {/* 2-col log section (read-only) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Yield Log */}
        <Card className="p-5">
          <h2 className="font-serif text-[16px] text-[#0D3B20] mb-4">Yield Log</h2>
          <div className="flex flex-col gap-2">
            {YIELD_LOGS.map((y, i) => (
              <div key={y.id}>
                <button
                  className="w-full flex items-center justify-between bg-[#F5F0E8] hover:bg-[#EDE7D6] rounded-xl px-4 py-3 transition-colors"
                  onClick={() => setExpandedYield(expandedYield === i ? null : i)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-[#7A7A7A]">{y.date}</span>
                    <span className="font-sans text-[13px] font-semibold text-[#1A1A1A]">
                      {y.quantity}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[13px] text-[#C9A84C] font-bold">
                      {fmt(y.value)}
                    </span>
                    <span className="font-mono text-[11px] text-[#7A7A7A]">
                      {expandedYield === i ? "▲" : "▼"}
                    </span>
                  </div>
                </button>
                {expandedYield === i && (
                  <div className="bg-[#F5F0E8] rounded-xl mt-1 px-4 py-3 text-[13px] flex flex-col gap-1">
                    {y.market_price && (
                      <p>
                        <span className="font-mono text-[11px] text-[#7A7A7A]">Price: </span>
                        {y.market_price}
                      </p>
                    )}
                    {y.buyer && (
                      <p>
                        <span className="font-mono text-[11px] text-[#7A7A7A]">Buyer: </span>
                        {y.buyer}
                      </p>
                    )}
                    {y.notes && (
                      <p>
                        <span className="font-mono text-[11px] text-[#7A7A7A]">Notes: </span>
                        {y.notes}
                      </p>
                    )}
                    <p className="font-mono text-[10px] text-[#C9A84C] mt-1">
                      Your share:{" "}
                      {fmt(Math.round((myContrib / MOCK_RIN.raised) * y.value))}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Expense Log */}
        <Card className="p-5">
          <h2 className="font-serif text-[16px] text-[#0D3B20] mb-4">Expense Log</h2>
          <div className="flex flex-col gap-2">
            {EXPENSE_LOGS.map((e, i) => (
              <div key={e.id}>
                <button
                  className="w-full flex items-center justify-between bg-[#F5F0E8] hover:bg-[#EDE7D6] rounded-xl px-4 py-3 transition-colors"
                  onClick={() => setExpandedExpense(expandedExpense === i ? null : i)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-[#7A7A7A]">{e.date}</span>
                    <span className="font-sans text-[13px] font-semibold text-[#1A1A1A]">
                      {e.item}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[13px] text-[#8B2500] font-bold">
                      {fmt(e.amount)}
                    </span>
                    <span className="font-mono text-[11px] text-[#7A7A7A]">
                      {expandedExpense === i ? "▲" : "▼"}
                    </span>
                  </div>
                </button>
                {expandedExpense === i && (
                  <div className="bg-[#F5F0E8] rounded-xl mt-1 px-4 py-3 text-[13px] flex flex-col gap-1">
                    {e.vendor && (
                      <p>
                        <span className="font-mono text-[11px] text-[#7A7A7A]">Vendor: </span>
                        {e.vendor}
                      </p>
                    )}
                    {e.receipt_no && (
                      <p>
                        <span className="font-mono text-[11px] text-[#7A7A7A]">Receipt: </span>
                        {e.receipt_no}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
