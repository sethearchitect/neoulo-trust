"use client"

import { useState, useTransition } from "react"
import { Card } from "@/components/ui/Card"
import { Avatar } from "@/components/ui/Avatar"
import { Modal } from "@/components/ui/Modal"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { logContribution, approveJoinRequest, rejectJoinRequest } from "@/lib/actions"
import { fmt } from "@/lib/utils"
import type { MemberWithTotal, Contribution, ContributionMethod, CellRequestWithProfile } from "@/types"

type Props = {
  cellName: string
  members: MemberWithTotal[]
  contribsByMember: Record<string, Contribution[]>
  joinRequests: CellRequestWithProfile[]
}

export function LeadMembersView({ cellName, members, contribsByMember, joinRequests }: Props) {
  const [selectedMember, setSelectedMember] = useState<MemberWithTotal | null>(null)
  const [expandedContrib, setExpandedContrib] = useState<number | null>(null)
  const [logTarget, setLogTarget] = useState<MemberWithTotal | null>(null)
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState("")
  const [method, setMethod] = useState("Bank Transfer")
  const [reference, setReference] = useState("")
  const [note, setNote] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [requestActionError, setRequestActionError] = useState<string | null>(null)
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null)

  function clearForm() {
    setAmount("")
    setDate("")
    setMethod("Bank Transfer")
    setReference("")
    setNote("")
    setSubmitError(null)
  }

  function openDetail(m: MemberWithTotal) {
    setSelectedMember(m)
    setExpandedContrib(null)
  }

  function openLogForm(m: MemberWithTotal) {
    setLogTarget(m)
    setSelectedMember(null)
    setExpandedContrib(null)
    setSubmitted(false)
    clearForm()
  }

  function handleApproveRequest(requestId: string) {
    setRequestActionError(null)
    setProcessingRequestId(requestId)
    startTransition(async () => {
      const result = await approveJoinRequest(requestId)
      if (result.error) setRequestActionError(result.error)
      setProcessingRequestId(null)
    })
  }

  function handleRejectRequest(requestId: string) {
    setRequestActionError(null)
    setProcessingRequestId(requestId)
    startTransition(async () => {
      const result = await rejectJoinRequest(requestId)
      if (result.error) setRequestActionError(result.error)
      setProcessingRequestId(null)
    })
  }

  function handleSubmit() {
    if (!logTarget || !amount || !date) return
    setSubmitError(null)

    startTransition(async () => {
      const result = await logContribution({
        member_id: logTarget.id,
        amount: Number(amount),
        date,
        method: method as ContributionMethod,
        reference: reference || undefined,
        note: note || undefined,
      })

      if (result.error) {
        setSubmitError(result.error)
      } else {
        setSubmitted(true)
      }
    })
  }

  return (
    <div className="fu">
      {/* Header */}
      <div className="mb-7">
        <h1 className="font-serif text-[28px] text-[#0D3B20] leading-tight">Members</h1>
        <p className="font-mono text-[12px] text-[#7A7A7A] mt-1">
          {cellName} · {members.length} members
        </p>
      </div>

      {/* Join Requests */}
      {joinRequests.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <p className="font-mono text-[10px] text-[#C9A84C] uppercase tracking-widest">
              Join Requests
            </p>
            <span className="font-mono text-[10px] bg-[#2E1F00] text-[#FFD06A] px-2 py-0.5 rounded-full">
              {joinRequests.length} pending
            </span>
          </div>
          {requestActionError && (
            <p className="font-sans text-[13px] text-[#8B2500] mb-3">{requestActionError}</p>
          )}
          <div className="flex flex-col gap-3">
            {joinRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-[#C9A84C]/40 px-5 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={req.profile?.name ?? "?"}
                      size={36}
                      color="#C9A84C"
                    />
                    <div>
                      <p className="font-sans text-[14px] font-semibold text-[#1A1A1A]">
                        {req.profile?.name ?? "Unknown"}
                      </p>
                      {req.profile?.profession && (
                        <p className="font-sans text-[12px] text-[#7A7A7A]">{req.profile.profession}</p>
                      )}
                      {req.profile?.phone && (
                        <p className="font-mono text-[12px] text-[#7A7A7A]">{req.profile.phone}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleRejectRequest(req.id)}
                      disabled={processingRequestId === req.id}
                      className="bg-[#EDE7D6] text-[#8B2500] rounded-xl text-[11px] font-semibold px-3 py-1.5 font-sans disabled:opacity-50 hover:bg-[#E0D9C6] transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApproveRequest(req.id)}
                      disabled={processingRequestId === req.id}
                      className="bg-[#0D3B20] text-white rounded-xl text-[11px] font-semibold px-3 py-1.5 font-sans disabled:opacity-50 hover:opacity-90 transition-opacity"
                    >
                      {processingRequestId === req.id ? "…" : "Approve"}
                    </button>
                  </div>
                </div>
                {req.message && (
                  <p className="font-sans text-[12px] text-[#4A4A4A] mt-3 pl-12 italic">
                    "{req.message}"
                  </p>
                )}
                <p className="font-mono text-[10px] text-[#7A7A7A] mt-2 pl-12">
                  Requested {new Date(req.created_at).toLocaleDateString("en-GB", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Member list */}
      <div className="flex flex-col gap-3">
        {members.map((m) => (
          <Card key={m.id} className="p-4 cursor-pointer hover:border-[#C9A84C] transition-colors" onClick={() => openDetail(m)}>
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
                {m.phone && (
                  <p className="font-mono text-[12px] text-[#7A7A7A]">{m.phone}</p>
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="font-mono text-[13px] text-[#C9A84C] font-bold">
                  {m.contribution_total !== null ? fmt(m.contribution_total) : "—"}
                </span>
                <button
                  className="bg-[#0D3B20] text-white rounded-xl text-[11px] font-semibold px-3 py-1.5 font-sans"
                  onClick={(e) => {
                    e.stopPropagation()
                    openLogForm(m)
                  }}
                >
                  Log
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Member Detail Modal */}
      <Modal
        open={selectedMember !== null}
        onClose={() => {
          setSelectedMember(null)
          setExpandedContrib(null)
        }}
        title={selectedMember?.name ?? ""}
      >
        {selectedMember && (() => {
          const contribs = contribsByMember[selectedMember.id] ?? []
          const total = contribs
            .filter((c) => c.status === "confirmed")
            .reduce((sum, c) => sum + c.amount, 0)

          return (
            <div className="flex flex-col gap-5">
              {/* Avatar + name + profession */}
              <div className="flex items-center gap-3">
                <Avatar
                  name={selectedMember.name}
                  size={48}
                  color={selectedMember.role === "lead" ? "#C9A84C" : "#0D3B20"}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-[16px] font-semibold text-[#1A1A1A]">
                      {selectedMember.name}
                    </span>
                    {selectedMember.role === "lead" && (
                      <span className="font-mono text-[9px] text-[#C9A84C] bg-[#2E1F00] px-2 py-0.5 rounded-full uppercase tracking-widest">
                        LEAD
                      </span>
                    )}
                  </div>
                  {selectedMember.profession && (
                    <p className="font-sans text-[13px] text-[#7A7A7A]">{selectedMember.profession}</p>
                  )}
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="font-mono text-[10px] text-[#7A7A7A] uppercase tracking-widest mb-0.5">Phone</p>
                  <p className="font-sans text-[13px] text-[#1A1A1A]">{selectedMember.phone ?? "—"}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-[#7A7A7A] uppercase tracking-widest mb-0.5">Email</p>
                  <p className="font-sans text-[13px] text-[#1A1A1A] truncate">{selectedMember.email ?? "—"}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-[#7A7A7A] uppercase tracking-widest mb-0.5">Member Since</p>
                  <p className="font-sans text-[13px] text-[#1A1A1A]">{selectedMember.joined ?? "—"}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-[#7A7A7A] uppercase tracking-widest mb-0.5">Contributions</p>
                  <p className="font-sans text-[13px] text-[#1A1A1A]">{contribs.length}</p>
                </div>
              </div>

              <div className="border-t border-[#EDE7D6]" />

              {/* Contribution history header */}
              <div className="flex items-center justify-between">
                <span className="font-sans text-[13px] font-semibold text-[#1A1A1A]">Contribution History</span>
                <button
                  className="bg-[#0D3B20] text-white rounded-xl text-[11px] font-semibold px-3 py-1.5 font-sans"
                  onClick={() => openLogForm(selectedMember)}
                >
                  Log Contribution
                </button>
              </div>

              {/* Contribution rows */}
              {contribs.length === 0 ? (
                <p className="font-sans text-[13px] text-[#7A7A7A] text-center py-3">No contributions yet</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {contribs.map((c, i) => (
                    <div key={c.id} className="border border-[#EDE7D6] rounded-xl overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between px-4 py-3 text-left"
                        onClick={() => setExpandedContrib(expandedContrib === i ? null : i)}
                      >
                        <div>
                          <p className="font-sans text-[13px] text-[#1A1A1A]">{c.note || c.method}</p>
                          <p className="font-mono text-[11px] text-[#7A7A7A]">{c.date}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="font-mono text-[13px] text-[#C9A84C] font-bold">+{fmt(c.amount)}</span>
                          <svg
                            className={`w-4 h-4 text-[#7A7A7A] transition-transform ${expandedContrib === i ? "rotate-180" : ""}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>
                      {expandedContrib === i && (
                        <div className="border-t border-[#EDE7D6] px-4 py-3 grid grid-cols-2 gap-3 bg-[#F5F0E8]">
                          <div>
                            <p className="font-mono text-[10px] text-[#7A7A7A] uppercase tracking-widest mb-0.5">Method</p>
                            <p className="font-sans text-[12px] text-[#1A1A1A]">{c.method}</p>
                          </div>
                          <div>
                            <p className="font-mono text-[10px] text-[#7A7A7A] uppercase tracking-widest mb-0.5">Reference</p>
                            <p className="font-sans text-[12px] text-[#1A1A1A]">{c.reference ?? "—"}</p>
                          </div>
                          <div>
                            <p className="font-mono text-[10px] text-[#7A7A7A] uppercase tracking-widest mb-0.5">Status</p>
                            <p className="font-sans text-[12px] text-[#1A1A1A] capitalize">{c.status}</p>
                          </div>
                          <div>
                            <p className="font-mono text-[10px] text-[#7A7A7A] uppercase tracking-widest mb-0.5">Confirmed By</p>
                            <p className="font-sans text-[12px] text-[#1A1A1A]">{c.confirmed_by ?? "—"}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Total */}
              <div className="border-t border-[#EDE7D6] pt-3 flex items-center justify-between">
                <span className="font-sans text-[13px] font-semibold text-[#4A4A4A]">Total Confirmed</span>
                <span className="font-mono text-[15px] text-[#C9A84C] font-bold">{fmt(total)}</span>
              </div>
            </div>
          )
        })()}
      </Modal>

      {/* Log Contribution Modal */}
      <Modal
        open={logTarget !== null}
        onClose={() => {
          setLogTarget(null)
          setSelectedMember(null)
          setSubmitted(false)
        }}
        title={
          submitted
            ? "Contribution Logged"
            : `Log Contribution — ${logTarget?.name ?? ""}`
        }
      >
        {!submitted ? (
          <div className="flex flex-col gap-4">
            <Input
              label="Amount (₦)"
              type="number"
              value={amount}
              onChange={setAmount}
              required
            />
            <Input label="Date" type="date" value={date} onChange={setDate} required />
            <Select
              label="Method"
              value={method}
              onChange={setMethod}
              options={["Bank Transfer", "Cash", "USSD Transfer", "Mobile Money"]}
            />
            <Input label="Reference" value={reference} onChange={setReference} />
            <Input label="Note (optional)" value={note} onChange={setNote} />
            {submitError && (
              <p className="font-sans text-[13px] text-[#8B2500]">{submitError}</p>
            )}
            <button
              className="w-full bg-[#0D3B20] text-white rounded-xl font-semibold py-3 font-sans text-[14px] mt-2 disabled:opacity-60"
              onClick={handleSubmit}
              disabled={isPending || !amount || !date}
            >
              {isPending ? "Logging…" : "Log Contribution →"}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="bg-[#0F2E18] rounded-xl p-5 text-center">
              <p className="font-mono text-[13px] text-[#6AEFAA] font-bold mb-2">
                ✓ Contribution logged
              </p>
              {amount && (
                <p className="font-mono text-[14px] text-[#7AFFCF] font-bold">
                  {fmt(Number(amount))}
                </p>
              )}
              <p className="font-mono text-[11px] text-[#6AEFAA]/70 mt-1">
                {date} · {method}
              </p>
            </div>
            <button
              className="w-full bg-[#EDE7D6] text-[#4A4A4A] rounded-xl font-semibold py-3 font-sans text-[14px]"
              onClick={() => {
                setSubmitted(false)
                clearForm()
              }}
            >
              Log Another
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}
