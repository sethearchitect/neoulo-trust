"use client"

import { useState } from "react"
import { StatCard } from "@/components/ui/StatCard"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { Modal } from "@/components/ui/Modal"
import {
  CELLS,
  RINS,
  GROWTH_DATA,
  TOTAL_DEPLOYED,
  TOTAL_YIELD,
  TOTAL_FAMILIES,
} from "@/lib/mock-data"
import { fmt, pct } from "@/lib/utils"

const MAX_CELLS = 3
const MAX_FAM = 11
const BAR_MAX_H = 100 // px

const DASHBOARD_FILTERS = ["All", "Active", "Forming", "Deployed Capital", "Abia State", "Enugu State"] as const
type DashFilter = (typeof DASHBOARD_FILTERS)[number]

function filterCells(filter: DashFilter) {
  if (filter === "All") return CELLS
  if (filter === "Active") return CELLS.filter((c) => c.status === "active")
  if (filter === "Forming") return CELLS.filter((c) => c.status === "forming")
  if (filter === "Deployed Capital") {
    const deployedIds = new Set(RINS.filter((r) => r.status === "deployed").map((r) => r.cell_id))
    return CELLS.filter((c) => deployedIds.has(c.id))
  }
  if (filter === "Abia State") return CELLS.filter((c) => c.state === "Abia")
  if (filter === "Enugu State") return CELLS.filter((c) => c.state === "Enugu")
  return CELLS
}

export default function AdminDashboardPage() {
  const [activeFilter, setActiveFilter] = useState<DashFilter>("All")
  const [capitalOpen, setCapitalOpen] = useState(false)
  const [yieldOpen, setYieldOpen] = useState(false)

  const visibleCells = filterCells(activeFilter)

  return (
    <div className="fu">
      {/* Page header */}
      <div className="mb-7">
        <h1 className="font-serif text-[28px] text-[#0D3B20] leading-tight">Portfolio Overview</h1>
        <p className="font-mono text-[12px] text-[#7A7A7A] mt-1 tracking-wide">
          Neoulo Trust · Feb 2026
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Cells"
          value={CELLS.length}
          sub="1 active · 2 forming"
          onClick={() => {
            const el = document.getElementById("cell-status-section")
            el?.scrollIntoView({ behavior: "smooth" })
          }}
        />
        <StatCard
          label="Capital Deployed"
          value={fmt(TOTAL_DEPLOYED)}
          sub="tap for breakdown"
          onClick={() => setCapitalOpen(true)}
        />
        <StatCard
          label="Total Yield"
          value={fmt(TOTAL_YIELD)}
          sub="Umuahia Alpha"
          onClick={() => setYieldOpen(true)}
        />
        <StatCard label="Families" value={TOTAL_FAMILIES} sub="across 3 cells" />
      </div>

      {/* Growth chart */}
      <Card className="fu2 p-6 mb-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-[16px] text-[#0D3B20]">Network Growth</h2>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-[#7A7A7A]">
              <span className="w-3 h-3 rounded-sm inline-block bg-[#0D3B20]" />
              Cells
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-[#7A7A7A]">
              <span className="w-3 h-3 rounded-sm inline-block bg-[#C9A84C]" />
              Families
            </span>
          </div>
        </div>

        <div className="flex items-end gap-3" style={{ height: BAR_MAX_H + 28 }}>
          {GROWTH_DATA.map((d) => (
            <div key={d.m} className="flex-1 flex flex-col items-center gap-0">
              {/* bars */}
              <div className="flex items-end gap-[4px]" style={{ height: BAR_MAX_H }}>
                <div
                  className="w-[10px] rounded-t-sm bg-[#0D3B20] transition-all duration-500"
                  style={{ height: Math.round((d.cells / MAX_CELLS) * BAR_MAX_H) }}
                />
                <div
                  className="w-[10px] rounded-t-sm bg-[#C9A84C] transition-all duration-500"
                  style={{ height: Math.round((d.fam / MAX_FAM) * BAR_MAX_H) }}
                />
              </div>
              {/* label */}
              <span className="font-mono text-[10px] text-[#7A7A7A] mt-2">{d.m}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Cell status section */}
      <div id="cell-status-section" className="fu3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-[18px] text-[#0D3B20]">Cell Status</h2>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 mb-5">
          {DASHBOARD_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={[
                "rounded-full px-3 py-1 text-[12px] font-semibold transition-colors",
                activeFilter === f
                  ? "bg-[#0D3B20] text-white"
                  : "bg-[#EDE7D6] text-[#4A4A4A] hover:bg-[#E0D9C6]",
              ].join(" ")}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Cell rows */}
        <div className="flex flex-col gap-3">
          {visibleCells.length === 0 && (
            <p className="text-[#7A7A7A] text-sm py-6 text-center">
              No cells match this filter.
            </p>
          )}
          {visibleCells.map((cell) => {
            const rin = RINS.find((r) => r.cell_id === cell.id)
            return (
              <Card key={cell.id} className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-serif text-[15px] text-[#0D3B20]">{cell.name}</span>
                      <Badge status={cell.status} />
                      {rin && <Badge status={rin.status} />}
                    </div>
                    <p className="font-sans text-[12px] text-[#7A7A7A] mt-0.5">
                      📍 {cell.location}, {cell.state}
                    </p>
                  </div>
                  {rin && (
                    <span className="font-mono text-[12px] text-[#C9A84C] whitespace-nowrap">
                      {rin.rin_code}
                    </span>
                  )}
                </div>

                {rin && (
                  <>
                    <ProgressBar
                      value={rin.raised}
                      max={rin.target}
                      color={cell.status === "active" ? "#C9A84C" : "#1A5C34"}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-mono text-[11px] text-[#7A7A7A]">
                        {fmt(rin.raised)} raised
                      </span>
                      <span className="font-mono text-[11px] text-[#7A7A7A]">
                        {pct(rin.raised, rin.target)}% of {fmt(rin.target)}
                      </span>
                    </div>
                  </>
                )}
              </Card>
            )
          })}
        </div>
      </div>

      {/* Capital Breakdown Modal */}
      <Modal
        open={capitalOpen}
        onClose={() => setCapitalOpen(false)}
        title="Capital Breakdown"
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#EDE7D6]">
              <th className="text-left font-mono text-[11px] text-[#7A7A7A] uppercase pb-2 pr-4">
                Cell
              </th>
              <th className="text-left font-mono text-[11px] text-[#7A7A7A] uppercase pb-2 pr-4">
                RIN
              </th>
              <th className="text-right font-mono text-[11px] text-[#7A7A7A] uppercase pb-2 pr-4">
                Raised
              </th>
              <th className="text-right font-mono text-[11px] text-[#7A7A7A] uppercase pb-2 pr-4">
                Target
              </th>
              <th className="text-right font-mono text-[11px] text-[#7A7A7A] uppercase pb-2">
                %
              </th>
            </tr>
          </thead>
          <tbody>
            {RINS.map((rin) => {
              const cell = CELLS.find((c) => c.id === rin.cell_id)
              return (
                <tr key={rin.id} className="border-b border-[#F5F0E8]">
                  <td className="py-2.5 pr-4 font-sans text-[13px] text-[#1A1A1A]">
                    {cell?.name ?? "—"}
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-[12px] text-[#C9A84C]">
                    {rin.rin_code}
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-[12px] text-[#1A1A1A] text-right">
                    {fmt(rin.raised)}
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-[12px] text-[#7A7A7A] text-right">
                    {fmt(rin.target)}
                  </td>
                  <td className="py-2.5 font-mono text-[12px] text-[#7A7A7A] text-right">
                    {pct(rin.raised, rin.target)}%
                  </td>
                </tr>
              )
            })}
            {/* Total row */}
            <tr className="border-t-2 border-[#EDE7D6]">
              <td className="pt-3 pr-4 font-semibold text-[13px] text-[#0D3B20]" colSpan={2}>
                Total
              </td>
              <td className="pt-3 pr-4 font-mono text-[12px] font-bold text-[#0D3B20] text-right">
                {fmt(RINS.reduce((s, r) => s + r.raised, 0))}
              </td>
              <td className="pt-3 pr-4 font-mono text-[12px] text-[#7A7A7A] text-right">
                {fmt(RINS.reduce((s, r) => s + r.target, 0))}
              </td>
              <td className="pt-3 font-mono text-[12px] text-[#7A7A7A] text-right">
                {pct(
                  RINS.reduce((s, r) => s + r.raised, 0),
                  RINS.reduce((s, r) => s + r.target, 0),
                )}%
              </td>
            </tr>
          </tbody>
        </table>
      </Modal>

      {/* Yield Forecast Modal */}
      <Modal
        open={yieldOpen}
        onClose={() => setYieldOpen(false)}
        title="Yield Forecast"
      >
        <p className="font-sans text-[14px] text-[#4A4A4A] mb-5 leading-relaxed">
          ₦550K gross yield logged. Expected ₦1.15M by Mar 2026 across active deployments.
        </p>
        <div className="flex flex-col gap-2">
          {[
            { date: "Nov 28, 2025", qty: "620 kg", value: 310000 },
            { date: "Nov 15, 2025", qty: "480 kg", value: 240000 },
          ].map((entry) => (
            <div
              key={entry.date}
              className="flex items-center justify-between bg-[#F5F0E8] rounded-xl px-4 py-3"
            >
              <div>
                <p className="font-sans text-[13px] text-[#1A1A1A] font-semibold">{entry.qty}</p>
                <p className="font-mono text-[11px] text-[#7A7A7A]">{entry.date}</p>
              </div>
              <span className="font-mono text-[13px] text-[#2D7A4F] font-bold">
                {fmt(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}
