"use client"

import { useState } from "react"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { CELLS, RINS, SUGGESTED_NODES } from "@/lib/mock-data"
import { fmt } from "@/lib/utils"

function suitabilityColor(score: number): string {
  if (score > 90) return "#2D7A4F"
  if (score > 75) return "#B8860B"
  return "#8B2500"
}

export default function AdminCapitalPage() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [deployed, setDeployed] = useState(false)

  const forwardedRINs = RINS.filter((r) => r.status === "forwarded")
  const deployedRINs = RINS.filter((r) => r.status === "deployed")

  return (
    <div className="fu">
      {/* Page header */}
      <div className="mb-7">
        <h1 className="font-serif text-[28px] text-[#0D3B20] leading-tight">Capital Desk</h1>
        <p className="font-sans text-[13px] text-[#7A7A7A] mt-1">
          Review forwarded RINs and deploy capital to asset nodes
        </p>
      </div>

      {/* Forwarded RINs */}
      <div className="mb-8">
        <h2 className="font-serif text-[18px] text-[#0D3B20] mb-4">Forwarded for Review</h2>

        {forwardedRINs.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-[#7A7A7A] text-2xl mb-3">◉</p>
            <p className="font-sans text-[14px] text-[#7A7A7A]">
              No RINs have been forwarded for review yet.
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-5">
            {forwardedRINs.map((rin) => {
              const cell = CELLS.find((c) => c.id === rin.cell_id)
              return (
                <Card
                  key={rin.id}
                  className="fu2 p-5"
                  style={{ borderColor: "#C9A84C", borderWidth: 1.5 }}
                >
                  {/* RIN header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-[14px] text-[#C9A84C]">{rin.rin_code}</span>
                        <span className="font-sans text-[14px] font-semibold text-[#1A1A1A]">
                          {cell?.name ?? "—"}
                        </span>
                      </div>
                      <p className="font-sans text-[12px] text-[#7A7A7A]">
                        📍 {cell?.location}, {cell?.state}
                      </p>
                      <p className="font-mono text-[13px] text-[#0D3B20] mt-1">
                        {fmt(rin.target)} target
                      </p>
                    </div>
                    <Badge status={rin.status} />
                  </div>

                  {/* Analysis blurb */}
                  <div className="bg-[#EDE7D6] rounded-xl px-4 py-3 mb-4">
                    <p className="font-mono text-[10px] text-[#7A7A7A] uppercase tracking-wide mb-1">
                      System Analysis
                    </p>
                    <p className="font-sans text-[13px] text-[#4A4A4A] leading-relaxed">
                      Cell reviewed. {cell?.state} region has strong tomato market demand Q1.
                      Lead has confirmed 6-member quorum. Recommend high-yield crop deployment
                      with drip irrigation to maximise {rin.return_rate}% return rate target.
                    </p>
                  </div>

                  {/* Suggested asset nodes */}
                  <p className="font-mono text-[10px] text-[#7A7A7A] uppercase tracking-wide mb-3">
                    Suggested Asset Nodes
                  </p>
                  <div className="flex flex-col gap-2 mb-4">
                    {SUGGESTED_NODES.map((node) => {
                      const isSelected = selectedNode === node.id
                      return (
                        <button
                          key={node.id}
                          onClick={() => !deployed && setSelectedNode(node.id)}
                          disabled={deployed}
                          className={[
                            "w-full flex items-center justify-between rounded-xl px-4 py-3 text-left transition-all",
                            isSelected
                              ? "border-2 border-[#0D3B20] bg-[#0D3B20]/5"
                              : "border border-[#EDE7D6] bg-[#F5F0E8] hover:border-[#145229]",
                            deployed ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
                          ].join(" ")}
                        >
                          <div>
                            <p className="font-sans text-[13px] font-semibold text-[#1A1A1A]">
                              {node.name}
                            </p>
                            <p className="font-mono text-[11px] text-[#7A7A7A]">
                              {node.type} · {node.returnRate} return
                            </p>
                          </div>
                          <div className="text-right ml-4 flex-shrink-0">
                            <p
                              className="font-mono text-[10px] uppercase tracking-wide mb-0.5"
                              style={{ color: suitabilityColor(node.suitability) }}
                            >
                              Suitability
                            </p>
                            <p
                              className="font-serif text-[20px] font-bold"
                              style={{ color: suitabilityColor(node.suitability) }}
                            >
                              {node.suitability}%
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {/* Deploy button */}
                  {selectedNode && !deployed && (
                    <button
                      onClick={() => setDeployed(true)}
                      className="w-full bg-[#0D3B20] text-white rounded-xl font-semibold py-3 font-sans text-[14px] hover:bg-[#145229] transition-colors"
                    >
                      Deploy Capital to Selected Node →
                    </button>
                  )}

                  {/* Success confirmation */}
                  {deployed && (
                    <div className="border border-[#2D7A4F] bg-[#0F2E18] rounded-xl px-4 py-4">
                      <p className="font-semibold text-[14px] text-[#6AEFAA] mb-1">
                        ✓ Capital deployed
                      </p>
                      <p className="font-sans text-[12px] text-[#6AEFAA]/70 leading-relaxed">
                        All cell members will receive a notification email with a plain-language
                        report explaining the asset node selection and expected returns.
                      </p>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-[#EDE7D6] mb-8" />

      {/* Deployed RINs */}
      <div>
        <h2 className="font-serif text-[18px] text-[#0D3B20] mb-4">Deployed Capital</h2>
        {deployedRINs.length === 0 ? (
          <p className="font-sans text-[13px] text-[#7A7A7A]">No deployed RINs yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {deployedRINs.map((rin) => {
              const cell = CELLS.find((c) => c.id === rin.cell_id)
              return (
                <Card key={rin.id} className="fu3 p-5">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-[13px] text-[#C9A84C]">{rin.rin_code}</span>
                        <span className="font-sans text-[13px] font-semibold text-[#1A1A1A]">
                          {cell?.name ?? "—"}
                        </span>
                      </div>
                      {rin.asset_node && (
                        <p className="font-sans text-[12px] text-[#B8860B]">
                          🌱 {rin.asset_node}
                        </p>
                      )}
                    </div>
                    <Badge status={rin.status} />
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
