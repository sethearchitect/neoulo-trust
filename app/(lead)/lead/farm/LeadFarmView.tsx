"use client"

import { useState, useTransition } from "react"
import { Card } from "@/components/ui/Card"
import { StatCard } from "@/components/ui/StatCard"
import { Badge } from "@/components/ui/Badge"
import { Modal } from "@/components/ui/Modal"
import { Input } from "@/components/ui/Input"
import { addYieldEntry, addExpenseEntry } from "@/lib/actions"
import { fmt } from "@/lib/utils"
import type { Farm, CropCycle, YieldLog, ExpenseLog } from "@/types"

type Props = {
  cellName: string
  farm: Farm | null
  cycle: CropCycle | null
  yieldLogs: YieldLog[]
  expenseLogs: ExpenseLog[]
}

export function LeadFarmView({ cellName, farm, cycle, yieldLogs, expenseLogs }: Props) {
  const [expandedYield, setExpandedYield] = useState<number | null>(null)
  const [expandedExpense, setExpandedExpense] = useState<number | null>(null)
  const [yieldModalOpen, setYieldModalOpen] = useState(false)
  const [expenseModalOpen, setExpenseModalOpen] = useState(false)
  const [yieldError, setYieldError] = useState<string | null>(null)
  const [expenseError, setExpenseError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Yield form fields
  const [yDate, setYDate] = useState("")
  const [yQty, setYQty] = useState("")
  const [yValue, setYValue] = useState("")
  const [yPrice, setYPrice] = useState("")
  const [yBuyer, setYBuyer] = useState("")
  const [yNotes, setYNotes] = useState("")

  // Expense form fields
  const [eDate, setEDate] = useState("")
  const [eItem, setEItem] = useState("")
  const [eAmount, setEAmount] = useState("")
  const [eVendor, setEVendor] = useState("")
  const [eReceipt, setEReceipt] = useState("")

  const grossYield = yieldLogs.reduce((sum, y) => sum + y.value, 0)
  const totalExpenses = expenseLogs.reduce((sum, e) => sum + e.amount, 0)
  const netPosition = grossYield - totalExpenses

  function submitYield() {
    if (!cycle || !yDate || !yValue) return
    setYieldError(null)
    startTransition(async () => {
      const result = await addYieldEntry({
        cycle_id: cycle.id,
        date: yDate,
        quantity: yQty || undefined,
        value: Number(yValue),
        market_price: yPrice || undefined,
        buyer: yBuyer || undefined,
        notes: yNotes || undefined,
      })
      if (result.error) {
        setYieldError(result.error)
      } else {
        setYieldModalOpen(false)
        setYDate(""); setYQty(""); setYValue(""); setYPrice(""); setYBuyer(""); setYNotes("")
      }
    })
  }

  function submitExpense() {
    if (!cycle || !eDate || !eItem || !eAmount) return
    setExpenseError(null)
    startTransition(async () => {
      const result = await addExpenseEntry({
        cycle_id: cycle.id,
        date: eDate,
        item: eItem,
        amount: Number(eAmount),
        vendor: eVendor || undefined,
        receipt_no: eReceipt || undefined,
      })
      if (result.error) {
        setExpenseError(result.error)
      } else {
        setExpenseModalOpen(false)
        setEDate(""); setEItem(""); setEAmount(""); setEVendor(""); setEReceipt("")
      }
    })
  }

  if (!farm) {
    return (
      <div className="fu">
        <div className="mb-7">
          <h1 className="font-serif text-[28px] text-[#0D3B20] leading-tight">Farm Log</h1>
          <p className="font-mono text-[12px] text-[#7A7A7A] mt-1">{cellName}</p>
        </div>
        <Card className="p-8 text-center">
          <p className="font-sans text-[14px] text-[#7A7A7A]">No farm deployed for your cell yet.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="fu">
      {/* Header */}
      <div className="mb-7">
        <h1 className="font-serif text-[28px] text-[#0D3B20] leading-tight">Farm Log</h1>
        <p className="font-mono text-[12px] text-[#7A7A7A] mt-1">
          {cellName} · {farm.crop}
        </p>
      </div>

      {/* Farm banner */}
      <Card className="p-5 mb-6" style={{ background: "#F5F0E8" }}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div>
            <p className="font-mono text-[10px] text-[#7A7A7A] uppercase tracking-widest mb-0.5">Crop</p>
            <p className="font-sans text-[13px] font-semibold text-[#1A1A1A]">{farm.crop}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-[#7A7A7A] uppercase tracking-widest mb-0.5">Plot Size</p>
            <p className="font-sans text-[13px] text-[#1A1A1A]">{farm.plot_size ?? "—"}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-[#7A7A7A] uppercase tracking-widest mb-0.5">Irrigation</p>
            <p className="font-sans text-[13px] text-[#1A1A1A]">{farm.irrigation_type ?? "—"}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-[#7A7A7A] uppercase tracking-widest mb-0.5">Season</p>
            <p className="font-sans text-[13px] text-[#1A1A1A]">{cycle?.season ?? "—"}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-[#7A7A7A] uppercase tracking-widest mb-0.5">Planted</p>
            <p className="font-mono text-[13px] text-[#1A1A1A]">{cycle?.planted_at ?? "—"}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-[#7A7A7A] uppercase tracking-widest mb-0.5">Status</p>
            {cycle ? <Badge status={cycle.status} /> : <span className="font-mono text-[12px] text-[#7A7A7A]">—</span>}
          </div>
        </div>
      </Card>

      {/* Stat row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Gross Yield" value={fmt(grossYield)} />
        <StatCard label="Total Expenses" value={fmt(totalExpenses)} />
        <StatCard label="Net Position" value={fmt(netPosition)} accent />
      </div>

      {/* 2-column log section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Yield Log */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-[16px] text-[#0D3B20]">Yield Log</h2>
            {cycle && (
              <button
                className="bg-[#0D3B20] text-white rounded-xl text-[11px] font-semibold px-3 py-1.5 font-sans"
                onClick={() => setYieldModalOpen(true)}
              >
                Add Yield +
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {yieldLogs.map((y, i) => (
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
                      <p><span className="font-mono text-[11px] text-[#7A7A7A]">Price: </span>{y.market_price}</p>
                    )}
                    {y.buyer && (
                      <p><span className="font-mono text-[11px] text-[#7A7A7A]">Buyer: </span>{y.buyer}</p>
                    )}
                    {y.notes && (
                      <p><span className="font-mono text-[11px] text-[#7A7A7A]">Notes: </span>{y.notes}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
            {yieldLogs.length === 0 && (
              <p className="font-mono text-[12px] text-[#7A7A7A]">No yield entries yet.</p>
            )}
          </div>
        </Card>

        {/* Expense Log */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-[16px] text-[#0D3B20]">Expense Log</h2>
            {cycle && (
              <button
                className="bg-[#0D3B20] text-white rounded-xl text-[11px] font-semibold px-3 py-1.5 font-sans"
                onClick={() => setExpenseModalOpen(true)}
              >
                Add Expense +
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {expenseLogs.map((e, i) => (
              <div key={e.id}>
                <button
                  className="w-full flex items-center justify-between bg-[#F5F0E8] hover:bg-[#EDE7D6] rounded-xl px-4 py-3 transition-colors"
                  onClick={() => setExpandedExpense(expandedExpense === i ? null : i)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-[#7A7A7A]">{e.date}</span>
                    <span className="font-sans text-[13px] font-semibold text-[#1A1A1A]">{e.item}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[13px] text-[#8B2500] font-bold">{fmt(e.amount)}</span>
                    <span className="font-mono text-[11px] text-[#7A7A7A]">
                      {expandedExpense === i ? "▲" : "▼"}
                    </span>
                  </div>
                </button>
                {expandedExpense === i && (
                  <div className="bg-[#F5F0E8] rounded-xl mt-1 px-4 py-3 text-[13px] flex flex-col gap-1">
                    {e.vendor && (
                      <p><span className="font-mono text-[11px] text-[#7A7A7A]">Vendor: </span>{e.vendor}</p>
                    )}
                    {e.receipt_no && (
                      <p><span className="font-mono text-[11px] text-[#7A7A7A]">Receipt: </span>{e.receipt_no}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
            {expenseLogs.length === 0 && (
              <p className="font-mono text-[12px] text-[#7A7A7A]">No expense entries yet.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Add Yield Modal */}
      <Modal open={yieldModalOpen} onClose={() => setYieldModalOpen(false)} title="Add Yield Entry">
        <div className="flex flex-col gap-4">
          <Input label="Date" type="date" value={yDate} onChange={setYDate} required />
          <Input label="Quantity (e.g. 480 kg)" value={yQty} onChange={setYQty} />
          <Input label="Value (₦)" type="number" value={yValue} onChange={setYValue} required />
          <Input label="Market Price (e.g. ₦500/kg)" value={yPrice} onChange={setYPrice} />
          <Input label="Buyer" value={yBuyer} onChange={setYBuyer} />
          <Input label="Notes" value={yNotes} onChange={setYNotes} />
          {yieldError && <p className="font-sans text-[13px] text-[#8B2500]">{yieldError}</p>}
          <button
            className="w-full bg-[#0D3B20] text-white rounded-xl font-semibold py-3 font-sans text-[14px] mt-2 disabled:opacity-60"
            onClick={submitYield}
            disabled={isPending || !yDate || !yValue}
          >
            {isPending ? "Saving…" : "Add Yield →"}
          </button>
        </div>
      </Modal>

      {/* Add Expense Modal */}
      <Modal open={expenseModalOpen} onClose={() => setExpenseModalOpen(false)} title="Add Expense Entry">
        <div className="flex flex-col gap-4">
          <Input label="Date" type="date" value={eDate} onChange={setEDate} required />
          <Input label="Item" value={eItem} onChange={setEItem} required />
          <Input label="Amount (₦)" type="number" value={eAmount} onChange={setEAmount} required />
          <Input label="Vendor" value={eVendor} onChange={setEVendor} />
          <Input label="Receipt No" value={eReceipt} onChange={setEReceipt} />
          {expenseError && <p className="font-sans text-[13px] text-[#8B2500]">{expenseError}</p>}
          <button
            className="w-full bg-[#0D3B20] text-white rounded-xl font-semibold py-3 font-sans text-[14px] mt-2 disabled:opacity-60"
            onClick={submitExpense}
            disabled={isPending || !eDate || !eItem || !eAmount}
          >
            {isPending ? "Saving…" : "Add Expense →"}
          </button>
        </div>
      </Modal>
    </div>
  )
}
