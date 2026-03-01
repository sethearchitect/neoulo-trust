"use client"

import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { StatCard } from "@/components/ui/StatCard"
import { MOCK_RIN, MOCK_CELL } from "@/lib/mock-data"
import { fmt, pct } from "@/lib/utils"

const RIN_STAGES = [
  "draft",
  "open",
  "funded",
  "forwarded",
  "reviewing",
  "deployed",
  "yielding",
  "settled",
] as const

export default function LeadRINPage() {
  const rin = MOCK_RIN
  const currentIdx = RIN_STAGES.indexOf(rin.status)

  return (
    <div className="fu">
      {/* Header */}
      <div className="mb-7">
        <h1 className="font-serif text-[28px] text-[#0D3B20] leading-tight">
          Revolving Impact Note
        </h1>
        <p className="font-mono text-[12px] text-[#7A7A7A] mt-1">
          {rin.rin_code} · {MOCK_CELL.name}
        </p>
      </div>

      {/* Lifecycle stepper */}
      <Card className="p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-[16px] text-[#0D3B20]">Lifecycle</h2>
          <Badge status={rin.status} />
        </div>
        <div className="flex items-start w-full overflow-x-auto">
          {RIN_STAGES.map((stage, i) => (
            <div key={stage} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center">
                <div
                  className={[
                    "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold",
                    i < currentIdx
                      ? "bg-[#0D3B20] text-white"
                      : i === currentIdx
                      ? "bg-[#C9A84C] text-white"
                      : "border-2 border-[#E0D9C6] bg-white",
                  ].join(" ")}
                >
                  {i < currentIdx ? "✓" : i === currentIdx ? stage[0].toUpperCase() : ""}
                </div>
                <span className="font-mono text-[9px] text-[#7A7A7A] mt-1 text-center leading-tight">
                  {stage}
                </span>
              </div>
              {i < RIN_STAGES.length - 1 && (
                <div
                  className={[
                    "flex-1 h-[2px] mb-4",
                    i < currentIdx ? "bg-[#0D3B20]" : "bg-[#E0D9C6]",
                  ].join(" ")}
                />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Details grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="Target" value={fmt(rin.target)} />
        <StatCard label="Raised" value={fmt(rin.raised)} accent />
        <StatCard label="Return Rate" value={`${rin.return_rate}%`} />
        <StatCard label="Expected By" value={rin.expected_return ?? "—"} />
      </div>

      {/* Progress card */}
      <Card className="p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="font-sans text-[14px] font-semibold text-[#1A1A1A]">
            Funding Progress
          </span>
          <span className="font-mono text-[11px] text-[#7A7A7A]">
            {pct(rin.raised, rin.target)}%
          </span>
        </div>
        <ProgressBar value={rin.raised} max={rin.target} color="#C9A84C" height={10} />
        <div className="flex items-center justify-between mt-2">
          <span className="font-mono text-[11px] text-[#7A7A7A]">{fmt(rin.raised)}</span>
          <span className="font-mono text-[11px] text-[#7A7A7A]">{fmt(rin.target)}</span>
        </div>
      </Card>

      {/* Asset node */}
      {rin.asset_node && (
        <Card className="p-5 mb-6">
          <p className="font-mono text-[11px] text-[#7A7A7A] uppercase tracking-widest mb-1">
            Asset Node
          </p>
          <p className="font-sans text-[15px] font-semibold text-[#1A1A1A]">{rin.asset_node}</p>
        </Card>
      )}

      {/* Notes */}
      {rin.notes && (
        <Card className="p-5 mb-6">
          <p className="font-mono text-[11px] text-[#7A7A7A] uppercase tracking-widest mb-1">
            Notes
          </p>
          <p className="font-sans text-[14px] text-[#4A4A4A]">{rin.notes}</p>
        </Card>
      )}

      {/* Dates */}
      <Card className="p-5 mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="font-mono text-[10px] text-[#7A7A7A] uppercase tracking-widest mb-1">
              Opened
            </p>
            <p className="font-mono text-[13px] text-[#1A1A1A]">{rin.opened_at ?? "—"}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-[#7A7A7A] uppercase tracking-widest mb-1">
              Deployed
            </p>
            <p className="font-mono text-[13px] text-[#1A1A1A]">{rin.deployed_at ?? "—"}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-[#7A7A7A] uppercase tracking-widest mb-1">
              Expected Return
            </p>
            <p className="font-mono text-[13px] text-[#1A1A1A]">{rin.expected_return ?? "—"}</p>
          </div>
        </div>
      </Card>

      {/* Action area — conditional on status */}
      {rin.status === "funded" && (
        <button className="w-full bg-[#0D3B20] text-white rounded-xl font-semibold py-3 font-sans text-[14px]">
          Forward to Neoulo →
        </button>
      )}
      {rin.status === "forwarded" && (
        <button
          className="w-full bg-[#EDE7D6] text-[#4A4A4A] rounded-xl font-semibold py-3 font-sans text-[14px] cursor-not-allowed"
          disabled
        >
          Awaiting Neoulo Review
        </button>
      )}
      {(rin.status === "deployed" || rin.status === "yielding") && (
        <div className="bg-[#0F2E18] rounded-xl px-5 py-3 text-center">
          <span className="font-mono text-[12px] text-[#6AEFAA]">
            Capital deployed · {fmt(rin.raised)} active
          </span>
        </div>
      )}
    </div>
  )
}
