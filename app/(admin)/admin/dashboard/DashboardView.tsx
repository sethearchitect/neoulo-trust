"use client"

import { useState } from "react"
import { StatCard } from "@/components/ui/StatCard"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { Modal } from "@/components/ui/Modal"
import { GROWTH_DATA } from "@/lib/mock-data"
import { fmt, pct } from "@/lib/utils"
import type { Cell, RINWithRaised, YieldLog } from "@/types"

const MAX_CELLS = 3
const MAX_FAM = 11
const BAR_MAX_H = 100

const DASHBOARD_FILTERS = ["All", "Active", "Forming", "Deployed Capital", "Abia State", "Enugu State"] as const
type DashFilter = (typeof DASHBOARD_FILTERS)[number]

type Props = {
  cells: Cell[]
  rins: RINWithRaised[]
  totalDeployed: number
  totalYield: number
  familiesCount: number
  yieldLogs: Pick<YieldLog, "date" | "quantity" | "value">[]
}

export function DashboardView({ cells, rins, totalDeployed, totalYield, familiesCount, yieldLogs }: Props) {
  const [activeFilter, setActiveFilter] = useState<DashFilter>("All")
  const [capitalOpen, setCapitalOpen] = useState(false)
  const [yieldOpen, setYieldOpen] = useState(false)

  function filterCells(filter: DashFilter) {
    if (filter === "All") return cells
    if (filter === "Active") return cells.filter((c) => c.status === "active")
    if (filter === "Forming") return cells.filter((c) => c.status === "forming")
    if (filter === "Deployed Capital") {
      const deployedIds = new Set(rins.filter((r) => r.status === "deployed").map((r) => r.cell_id))
      return cells.filter((c) => deployedIds.has(c.id))
    }
    if (filter === "Abia State") return cells.filter((c) => c.state === "Abia")
    if (filter === "Enugu State") return cells.filter((c) => c.state === "Enugu")
    return cells
  }

  const visibleCells = filterCells(activeFilter)
  const activeCells = cells.filter((c) => c.status === "active").length
  const formingCells = cells.filter((c) => c.status === "forming").length

  return (
    <div className="fu">
      {/* Page header */}
      <div className="mb-7">
        <h1 className="font-serif text-[28px] text-[#0D3B20] leading-tight">Portfolio Overview</h1>
        <p className="font-mono text-[12px] text-[#7A7A7A] mt-1 tracking-wide">
          Neoulo Trust · Live Data
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Cells"
          value={cells.length}
          sub={`${activeCells} active · ${formingCells} forming`}
          onClick={() => {
            const el = document.getElementById("cell-status-section")
            el?.scrollIntoView({ behavior: "smooth" })
          }}
        />
        <StatCard
          label="Capital Deployed"
          value={fmt(totalDeployed)}
          sub="tap for breakdown"
          onClick={() => setCapitalOpen(true)}
        />
        <StatCard
          label="Total Yield"
          value={fmt(totalYield)}
          sub="all farm cycles"
          onClick={() => setYieldOpen(true)}
        />
        <StatCard label="Families" value={familiesCount} sub={`across ${cells.length} cells`} />
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
            const rin = rins.find((r) => r.cell_id === cell.id)
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
      <Modal open={capitalOpen} onClose={() => setCapitalOpen(false)} title="Capital Breakdown">
        <div className="overflow-x-auto -mx-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#EDE7D6]">
              <th className="text-left font-mono text-[11px] text-[#7A7A7A] uppercase pb-2 pr-4">Cell</th>
              <th className="text-left font-mono text-[11px] text-[#7A7A7A] uppercase pb-2 pr-4">RIN</th>
              <th className="text-right font-mono text-[11px] text-[#7A7A7A] uppercase pb-2 pr-4">Raised</th>
              <th className="text-right font-mono text-[11px] text-[#7A7A7A] uppercase pb-2 pr-4">Target</th>
              <th className="text-right font-mono text-[11px] text-[#7A7A7A] uppercase pb-2">%</th>
            </tr>
          </thead>
          <tbody>
            {rins.map((rin) => {
              const cell = cells.find((c) => c.id === rin.cell_id)
              return (
                <tr key={rin.id} className="border-b border-[#F5F0E8]">
                  <td className="py-2.5 pr-4 font-sans text-[13px] text-[#1A1A1A]">{cell?.name ?? "—"}</td>
                  <td className="py-2.5 pr-4 font-mono text-[12px] text-[#C9A84C]">{rin.rin_code}</td>
                  <td className="py-2.5 pr-4 font-mono text-[12px] text-[#1A1A1A] text-right">{fmt(rin.raised)}</td>
                  <td className="py-2.5 pr-4 font-mono text-[12px] text-[#7A7A7A] text-right">{fmt(rin.target)}</td>
                  <td className="py-2.5 font-mono text-[12px] text-[#7A7A7A] text-right">{pct(rin.raised, rin.target)}%</td>
                </tr>
              )
            })}
            <tr className="border-t-2 border-[#EDE7D6]">
              <td className="pt-3 pr-4 font-semibold text-[13px] text-[#0D3B20]" colSpan={2}>Total</td>
              <td className="pt-3 pr-4 font-mono text-[12px] font-bold text-[#0D3B20] text-right">
                {fmt(rins.reduce((s, r) => s + r.raised, 0))}
              </td>
              <td className="pt-3 pr-4 font-mono text-[12px] text-[#7A7A7A] text-right">
                {fmt(rins.reduce((s, r) => s + r.target, 0))}
              </td>
              <td className="pt-3 font-mono text-[12px] text-[#7A7A7A] text-right">
                {pct(rins.reduce((s, r) => s + r.raised, 0), rins.reduce((s, r) => s + r.target, 0))}%
              </td>
            </tr>
          </tbody>
        </table>
        </div>
      </Modal>

      {/* Yield Forecast Modal */}
      <Modal open={yieldOpen} onClose={() => setYieldOpen(false)} title="Yield Log">
        <div className="flex flex-col gap-2">
          {yieldLogs.length === 0 && (
            <p className="font-sans text-[14px] text-[#7A7A7A]">No yield entries yet.</p>
          )}
          {yieldLogs.map((entry, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-[#F5F0E8] rounded-xl px-4 py-3"
            >
              <div>
                <p className="font-sans text-[13px] text-[#1A1A1A] font-semibold">{entry.quantity ?? "—"}</p>
                <p className="font-mono text-[11px] text-[#7A7A7A]">{entry.date}</p>
              </div>
              <span className="font-mono text-[13px] text-[#2D7A4F] font-bold">{fmt(entry.value)}</span>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}
