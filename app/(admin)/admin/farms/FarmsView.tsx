"use client"

import { useState } from "react"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { StatCard } from "@/components/ui/StatCard"
import { fmt } from "@/lib/utils"
import type { CropCycle, YieldLog, ExpenseLog } from "@/types"

type FarmData = {
  id: string
  crop: string
  plot_size: string | null
  irrigation_type: string | null
  cell_name: string
  cell_location: string
  cycle: CropCycle | null
  yieldLogs: YieldLog[]
  expenseLogs: ExpenseLog[]
}

type Props = {
  farms: FarmData[]
}

export function FarmsView({ farms }: Props) {
  const [expandedYield, setExpandedYield] = useState<string | null>(null)

  if (farms.length === 0) {
    return (
      <div className="fu">
        <div className="mb-7">
          <h1 className="font-serif text-[28px] text-[#0D3B20] leading-tight">Farm Overview</h1>
        </div>
        <Card className="p-8 text-center">
          <p className="font-sans text-[14px] text-[#7A7A7A]">No active farms yet.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="fu">
      {/* Page header */}
      <div className="mb-7">
        <h1 className="font-serif text-[28px] text-[#0D3B20] leading-tight">Farm Overview</h1>
        <p className="font-sans text-[13px] text-[#7A7A7A] mt-1">
          Active crop cycles and yield data
        </p>
      </div>

      {farms.map((farm) => {
        const grossYield = farm.yieldLogs.reduce((s, l) => s + l.value, 0)
        const totalExpenses = farm.expenseLogs.reduce((s, l) => s + l.amount, 0)
        const netPosition = grossYield - totalExpenses

        return (
          <div key={farm.id} className="mb-10">
            {/* Farm banner */}
            <div className="fu2 bg-[#EDE7D6] rounded-xl px-5 py-4 mb-6 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="font-sans text-[13px] text-[#7A7A7A] mb-1">
                  📍 {farm.cell_name} — Active Farm
                </p>
                <p className="font-serif text-[16px] text-[#0D3B20]">
                  {farm.crop}
                  {farm.plot_size && ` · ${farm.plot_size}`}
                  {farm.irrigation_type && ` · ${farm.irrigation_type}`}
                </p>
                {farm.cycle && (
                  <p className="font-mono text-[11px] text-[#7A7A7A] mt-1">
                    {farm.cycle.season ?? "—"} · Planted {farm.cycle.planted_at ?? "—"}
                  </p>
                )}
              </div>
              {farm.cycle && <Badge status={farm.cycle.status} />}
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
              <StatCard label="Gross Yield" value={fmt(grossYield)} sub="total harvested value" accent />
              <StatCard label="Total Expenses" value={fmt(totalExpenses)} sub="input costs logged" />
              <StatCard label="Net Position" value={fmt(netPosition)} sub="yield minus expenses" />
            </div>

            {/* 2-col logs grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Yield log */}
              <Card className="fu3 p-5">
                <div className="mb-4">
                  <h2 className="font-serif text-[16px] text-[#0D3B20]">Yield Log</h2>
                  <p className="font-sans text-[12px] text-[#7A7A7A] mt-0.5">Tap any entry for details</p>
                </div>
                {farm.yieldLogs.length === 0 ? (
                  <p className="font-mono text-[12px] text-[#7A7A7A]">No yield entries yet.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {farm.yieldLogs.map((entry) => {
                      const key = `${farm.id}-${entry.id}`
                      const isOpen = expandedYield === key
                      return (
                        <div key={entry.id}>
                          <button
                            className="w-full flex items-center justify-between bg-[#F5F0E8] hover:bg-[#EDE7D6] rounded-xl px-4 py-3 transition-colors text-left"
                            onClick={() => setExpandedYield(isOpen ? null : key)}
                          >
                            <div>
                              <p className="font-sans text-[13px] font-semibold text-[#1A1A1A]">
                                {entry.quantity ?? "—"}
                              </p>
                              <p className="font-mono text-[11px] text-[#7A7A7A]">{entry.date}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-[13px] text-[#2D7A4F] font-bold">
                                {fmt(entry.value)}
                              </span>
                              <span className="text-[#7A7A7A] text-[12px]">{isOpen ? "▲" : "▼"}</span>
                            </div>
                          </button>
                          {isOpen && (
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
                      )
                    })}
                  </div>
                )}
              </Card>

              {/* Expense log */}
              <Card className="fu3 p-5">
                <div className="mb-4">
                  <h2 className="font-serif text-[16px] text-[#0D3B20]">Expense Log</h2>
                  <p className="font-sans text-[12px] text-[#7A7A7A] mt-0.5">Input costs by cycle</p>
                </div>
                {farm.expenseLogs.length === 0 ? (
                  <p className="font-mono text-[12px] text-[#7A7A7A]">No expense entries yet.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {farm.expenseLogs.map((entry) => (
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
                )}
              </Card>
            </div>
          </div>
        )
      })}
    </div>
  )
}
