"use client"

import { useState } from "react"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { StatCard } from "@/components/ui/StatCard"
import { ALPHA_FARM, ALPHA_CYCLE, YIELD_LOGS, EXPENSE_LOGS } from "@/lib/mock-data"
import { fmt } from "@/lib/utils"

const GROSS_YIELD = YIELD_LOGS.reduce((s, l) => s + l.value, 0)
const TOTAL_EXPENSES = EXPENSE_LOGS.reduce((s, l) => s + l.amount, 0)
const NET_POSITION = GROSS_YIELD - TOTAL_EXPENSES

export default function AdminFarmsPage() {
  const [expandedYield, setExpandedYield] = useState<number | null>(null)

  return (
    <div className="fu">
      {/* Page header */}
      <div className="mb-7">
        <h1 className="font-serif text-[28px] text-[#0D3B20] leading-tight">Farm Overview</h1>
        <p className="font-sans text-[13px] text-[#7A7A7A] mt-1">
          Active crop cycles and yield data
        </p>
      </div>

      {/* Farm banner */}
      <div className="fu2 bg-[#EDE7D6] rounded-xl px-5 py-4 mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="font-sans text-[13px] text-[#7A7A7A] mb-1">
            📍 Umuahia Alpha — Active Farm
          </p>
          <p className="font-serif text-[16px] text-[#0D3B20]">
            {ALPHA_FARM.crop} · {ALPHA_FARM.plot_size} · {ALPHA_FARM.irrigation_type}
          </p>
          <p className="font-mono text-[11px] text-[#7A7A7A] mt-1">
            {ALPHA_CYCLE.season} · Planted {ALPHA_CYCLE.planted_at}
          </p>
        </div>
        <Badge status={ALPHA_CYCLE.status} />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
        <StatCard label="Gross Yield" value={fmt(GROSS_YIELD)} sub="total harvested value" accent />
        <StatCard label="Total Expenses" value={fmt(TOTAL_EXPENSES)} sub="input costs logged" />
        <StatCard label="Net Position" value={fmt(NET_POSITION)} sub="yield minus expenses" />
      </div>

      {/* 2-col logs grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Yield log */}
        <Card className="fu3 p-5">
          <div className="mb-4">
            <h2 className="font-serif text-[16px] text-[#0D3B20]">Yield Log</h2>
            <p className="font-sans text-[12px] text-[#7A7A7A] mt-0.5">
              Tap any entry for details
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {YIELD_LOGS.map((entry, i) => (
              <div key={entry.id}>
                <button
                  className="w-full flex items-center justify-between bg-[#F5F0E8] hover:bg-[#EDE7D6] rounded-xl px-4 py-3 transition-colors text-left"
                  onClick={() =>
                    setExpandedYield(expandedYield === i ? null : i)
                  }
                >
                  <div>
                    <p className="font-sans text-[13px] font-semibold text-[#1A1A1A]">
                      {entry.quantity}
                    </p>
                    <p className="font-mono text-[11px] text-[#7A7A7A]">{entry.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[13px] text-[#2D7A4F] font-bold">
                      {fmt(entry.value)}
                    </span>
                    <span className="text-[#7A7A7A] text-[12px]">
                      {expandedYield === i ? "▲" : "▼"}
                    </span>
                  </div>
                </button>

                {expandedYield === i && (
                  <div className="bg-[#F5F0E8] rounded-xl mt-1 px-4 py-3 flex flex-col gap-2">
                    {[
                      { label: "Market Price", value: entry.market_price ?? "—" },
                      { label: "Buyer / Channel", value: entry.buyer ?? "—" },
                      { label: "Notes", value: entry.notes ?? "—" },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between gap-4">
                        <span className="font-mono text-[10px] text-[#7A7A7A] uppercase tracking-wide">
                          {row.label}
                        </span>
                        <span className="font-sans text-[12px] text-[#4A4A4A] text-right">
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Expense log */}
        <Card className="fu3 p-5">
          <div className="mb-4">
            <h2 className="font-serif text-[16px] text-[#0D3B20]">Expense Log</h2>
            <p className="font-sans text-[12px] text-[#7A7A7A] mt-0.5">
              Input costs by cycle
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {EXPENSE_LOGS.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between bg-[#F5F0E8] rounded-xl px-4 py-3"
              >
                <div>
                  <p className="font-sans text-[13px] font-semibold text-[#1A1A1A]">{entry.item}</p>
                  <p className="font-mono text-[11px] text-[#7A7A7A]">
                    {entry.date}
                    {entry.vendor ? ` · ${entry.vendor}` : ""}
                    {entry.receipt_no ? ` · ${entry.receipt_no}` : ""}
                  </p>
                </div>
                <span className="font-mono text-[13px] text-[#8B2500] font-bold">
                  −{fmt(entry.amount)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Empty state note */}
      <p className="font-sans text-[12px] text-[#7A7A7A] mt-6 text-center">
        No active farm deployments for other cells yet.
      </p>
    </div>
  )
}
