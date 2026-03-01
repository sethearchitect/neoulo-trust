"use client"

import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { Avatar } from "@/components/ui/Avatar"
import { CELLS, MEMBERS, RINS } from "@/lib/mock-data"
import { fmt, pct } from "@/lib/utils"

export default function AdminCellsPage() {
  return (
    <div className="fu">
      {/* Page header */}
      <div className="mb-7">
        <h1 className="font-serif text-[28px] text-[#0D3B20] leading-tight">All Cells</h1>
        <p className="font-sans text-[13px] text-[#7A7A7A] mt-1">
          {CELLS.length} cells · {MEMBERS.length} total members
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CELLS.map((cell) => {
          const rin = RINS.find((r) => r.cell_id === cell.id)
          const members = MEMBERS.filter((m) => m.cell_id === cell.id)

          return (
            <Card key={cell.id} className="fu2 p-0 overflow-hidden">
              {/* Card header */}
              <div className="px-5 pt-5 pb-4">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <span className="font-serif text-[17px] text-[#0D3B20]">{cell.name}</span>
                  <Badge status={cell.status} />
                </div>
                <p className="font-sans text-[12px] text-[#7A7A7A]">
                  📍 {cell.location}, {cell.state}
                </p>
              </div>

              {/* Mini stats grid */}
              <div className="grid grid-cols-3 bg-[#F5F0E8] mx-5 rounded-xl overflow-hidden mb-4">
                <div className="px-3 py-2.5 flex flex-col gap-0.5">
                  <span className="font-mono text-[10px] text-[#7A7A7A] uppercase tracking-wide">
                    Members
                  </span>
                  <span className="font-serif text-[16px] text-[#0D3B20]">{members.length}</span>
                </div>
                <div className="px-3 py-2.5 flex flex-col gap-0.5 border-x border-[#EDE7D6]">
                  <span className="font-mono text-[10px] text-[#7A7A7A] uppercase tracking-wide">
                    Formed
                  </span>
                  <span className="font-sans text-[13px] text-[#0D3B20]">{cell.formed}</span>
                </div>
                <div className="px-3 py-2.5 flex flex-col gap-0.5">
                  <span className="font-mono text-[10px] text-[#7A7A7A] uppercase tracking-wide">
                    RIN
                  </span>
                  {rin ? (
                    <Badge status={rin.status} />
                  ) : (
                    <span className="font-mono text-[11px] text-[#7A7A7A]">—</span>
                  )}
                </div>
              </div>

              {/* Progress */}
              <div className="px-5 mb-4">
                {rin ? (
                  <>
                    <ProgressBar
                      value={rin.raised}
                      max={rin.target}
                      color={cell.status === "active" ? "#C9A84C" : "#1A5C34"}
                    />
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="font-mono text-[11px] text-[#7A7A7A]">
                        {fmt(rin.raised)} raised
                      </span>
                      <span className="font-mono text-[11px] text-[#7A7A7A]">
                        {pct(rin.raised, rin.target)}% of {fmt(rin.target)}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="font-mono text-[11px] text-[#7A7A7A]">No RIN yet</p>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-[#EDE7D6] mx-5" />

              {/* Members */}
              <div className="px-5 pt-4 pb-5">
                <p className="font-mono text-[10px] text-[#7A7A7A] uppercase tracking-wide mb-3">
                  Members
                </p>
                <div className="flex flex-col">
                  {members.map((m, i) => (
                    <div
                      key={m.id}
                      className={[
                        "flex items-center gap-3 py-2.5",
                        i < members.length - 1 ? "border-b border-[#F5F0E8]" : "",
                      ].join(" ")}
                    >
                      <Avatar
                        name={m.name}
                        size={28}
                        color={m.role === "lead" ? "#C9A84C" : "#1A5C34"}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-[13px] font-semibold text-[#1A1A1A] truncate">
                          {m.name}
                          {m.role === "lead" && (
                            <span className="ml-1.5 font-mono text-[9px] text-[#C9A84C] uppercase">
                              lead
                            </span>
                          )}
                        </p>
                        {m.profession && (
                          <p className="font-sans text-[11px] text-[#7A7A7A]">{m.profession}</p>
                        )}
                      </div>
                      <span className="font-mono text-[12px] text-[#0D3B20] whitespace-nowrap">
                        {m.contribution_total !== null ? fmt(m.contribution_total) : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
