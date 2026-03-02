"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"

export default function SetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasSession, setHasSession] = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setHasSession(!!data.user)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    await supabase.auth.signOut()
    router.push("/auth/login?message=account_activated")
  }

  // Still checking session
  if (hasSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F0E8]">
        <p className="text-sm text-[#7A7A7A]">Loading…</p>
      </div>
    )
  }

  // No session — link expired or direct navigation
  if (!hasSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F0E8] px-4">
        <div className="w-full max-w-sm text-center">
          <h1
            className="text-3xl text-[#0D3B20] mb-1"
            style={{ fontFamily: "var(--font-dm-serif)" }}
          >
            Neoulo Trust
          </h1>
          <p className="text-sm text-[#7A7A7A] mb-8">
            Cooperative agri-financing platform
          </p>
          <div className="bg-white rounded-2xl border border-[#EDE7D6] shadow-sm px-8 py-8">
            <div className="px-4 py-3 rounded-xl bg-[#8B2500]/10 text-[#8B2500] text-sm">
              This link has expired. Please request a new invite.
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F0E8] px-4">
      <div className="w-full max-w-sm">
        {/* Wordmark */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl text-[#0D3B20] mb-1"
            style={{ fontFamily: "var(--font-dm-serif)" }}
          >
            Neoulo Trust
          </h1>
          <p className="text-sm text-[#7A7A7A]">
            Cooperative agri-financing platform
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#EDE7D6] shadow-sm px-8 py-8">
          <h2
            className="text-lg font-semibold text-[#1A1A1A] mb-1"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Set your password
          </h2>
          <p className="text-sm text-[#7A7A7A] mb-6">
            Choose a password to activate your account.
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-[#8B2500]/10 text-[#8B2500] text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-[#4A4A4A]"
              >
                New password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-xl border border-[#E0D9C6] bg-white text-[#1A1A1A] text-sm placeholder:text-[#7A7A7A] focus:outline-none focus:border-[#0D3B20] transition-colors"
                placeholder="Min. 8 characters"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="confirm"
                className="text-sm font-medium text-[#4A4A4A]"
              >
                Confirm password
              </label>
              <input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-xl border border-[#E0D9C6] bg-white text-[#1A1A1A] text-sm placeholder:text-[#7A7A7A] focus:outline-none focus:border-[#0D3B20] transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3 rounded-xl bg-[#0D3B20] text-white font-semibold text-sm transition-opacity disabled:opacity-60 hover:opacity-90"
            >
              {loading ? "Activating…" : "Activate account"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#7A7A7A] mt-6">
          Setting your password activates your account.
        </p>
      </div>
    </div>
  )
}
