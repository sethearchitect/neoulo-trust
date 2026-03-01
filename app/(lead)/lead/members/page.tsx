"use client"

import { useState } from "react"
import { Card } from "@/components/ui/Card"
import { Avatar } from "@/components/ui/Avatar"
import { Modal } from "@/components/ui/Modal"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { MEMBERS, MOCK_CELL } from "@/lib/mock-data"
import { fmt } from "@/lib/utils"

const alphaMembers = MEMBERS.filter((m) => m.cell_id === MOCK_CELL.id)

export default function LeadMembersPage() {
  const [logTarget, setLogTarget] = useState<(typeof MEMBERS)[number] | null>(null)
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState("")
  const [method, setMethod] = useState("Bank Transfer")
  const [reference, setReference] = useState("")
  const [note, setNote] = useState("")
  const [submitted, setSubmitted] = useState(false)

  function clearForm() {
    setAmount("")
    setDate("")
    setMethod("Bank Transfer")
    setReference("")
    setNote("")
  }

  return (
    <div className="fu">
      {/* Header */}
      <div className="mb-7">
        <h1 className="font-serif text-[28px] text-[#0D3B20] leading-tight">Members</h1>
        <p className="font-mono text-[12px] text-[#7A7A7A] mt-1">
          {MOCK_CELL.name} · {alphaMembers.length} members
        </p>
      </div>

      {/* Member list */}
      <div className="flex flex-col gap-3">
        {alphaMembers.map((m) => (
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
                  onClick={() => {
                    setLogTarget(m)
                    setSubmitted(false)
                    clearForm()
                  }}
                >
                  Log
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Log Contribution Modal */}
      <Modal
        open={logTarget !== null}
        onClose={() => {
          setLogTarget(null)
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
            <button
              className="w-full bg-[#0D3B20] text-white rounded-xl font-semibold py-3 font-sans text-[14px] mt-2"
              onClick={() => setSubmitted(true)}
            >
              Log Contribution →
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
