"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { submitStartCellRequest } from "@/lib/actions"

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi",
  "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe",
  "Zamfara", "FCT Abuja",
]

export function StartView() {
  const router = useRouter()
  const [cellName, setCellName] = useState("")
  const [location, setLocation] = useState("")
  const [state, setState] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!cellName.trim() || !location.trim() || !state) {
      setError("Please fill in all required fields.")
      return
    }

    startTransition(async () => {
      const result = await submitStartCellRequest({
        name: cellName.trim(),
        location: location.trim(),
        state,
        message: message.trim() || undefined,
      })

      if (result.error) {
        setError(result.error)
      } else {
        router.push("/onboarding")
        router.refresh()
      }
    })
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] px-4 py-10">
      <div className="w-full max-w-md mx-auto">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-[#7A7A7A] text-sm mb-6 hover:text-[#0D3B20] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="mb-7">
          <h1
            className="text-[26px] text-[#0D3B20] leading-tight"
            style={{ fontFamily: "var(--font-dm-serif)" }}
          >
            Start a new cell
          </h1>
          <p className="text-[13px] text-[#7A7A7A] mt-1">
            Propose a new cooperative cell. Neoulo admin will review your application within 2–3 business days.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#EDE7D6] shadow-sm px-6 py-6 mb-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#4A4A4A]" style={{ fontFamily: "var(--font-dm-sans)" }}>
                Proposed cell name <span className="text-[#8B2500]">*</span>
              </label>
              <input
                type="text"
                value={cellName}
                onChange={(e) => setCellName(e.target.value)}
                required
                placeholder="e.g. Umuahia Alpha Cell"
                className="w-full px-4 py-3 rounded-xl border border-[#E0D9C6] bg-white text-[#1A1A1A] text-sm placeholder:text-[#7A7A7A] focus:outline-none focus:border-[#0D3B20] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#4A4A4A]" style={{ fontFamily: "var(--font-dm-sans)" }}>
                Local government / town <span className="text-[#8B2500]">*</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                placeholder="e.g. Umuahia North"
                className="w-full px-4 py-3 rounded-xl border border-[#E0D9C6] bg-white text-[#1A1A1A] text-sm placeholder:text-[#7A7A7A] focus:outline-none focus:border-[#0D3B20] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#4A4A4A]" style={{ fontFamily: "var(--font-dm-sans)" }}>
                State <span className="text-[#8B2500]">*</span>
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-[#E0D9C6] bg-white text-[#1A1A1A] text-sm focus:outline-none focus:border-[#0D3B20] transition-colors appearance-none"
              >
                <option value="">Select state…</option>
                {NIGERIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#4A4A4A]" style={{ fontFamily: "var(--font-dm-sans)" }}>
                Additional message <span className="text-[#7A7A7A] font-normal">(optional)</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Tell us about your community, farming activity, or why you want to start this cell…"
                className="w-full px-4 py-3 rounded-xl border border-[#E0D9C6] bg-white text-[#1A1A1A] text-sm placeholder:text-[#7A7A7A] focus:outline-none focus:border-[#0D3B20] transition-colors resize-none"
              />
            </div>

            {error && (
              <p className="text-[13px] text-[#8B2500]">{error}</p>
            )}

            <button
              type="submit"
              disabled={isPending || !cellName.trim() || !location.trim() || !state}
              className="mt-2 w-full py-3 rounded-xl bg-[#C9A84C] text-[#0D3B20] font-semibold text-sm transition-opacity disabled:opacity-40 hover:opacity-90"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              {isPending ? "Submitting proposal…" : "Submit for review →"}
            </button>
          </form>
        </div>

        <p className="text-[12px] text-[#7A7A7A] text-center">
          Your proposal will be reviewed by the Neoulo admin team. You will see the status on the onboarding page.
        </p>
      </div>
    </div>
  )
}
