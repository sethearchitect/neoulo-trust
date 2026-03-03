"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const message = searchParams.get("message")
  const urlError = searchParams.get("error")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    router.push("/")
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F0E8] px-4">
      <div className="fu w-full max-w-sm">
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
            className="text-lg font-semibold text-[#1A1A1A] mb-6"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Sign in to your account
          </h2>

          {message === "account_activated" && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-[#2D7A4F]/10 text-[#2D7A4F] text-sm">
              Your account is activated. Sign in to continue.
            </div>
          )}

          {urlError === "invalid_invite" && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-[#8B2500]/10 text-[#8B2500] text-sm">
              This invite link is invalid or has already been used.
            </div>
          )}

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-[#8B2500]/10 text-[#8B2500] text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-[#4A4A4A]"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-[#E0D9C6] bg-white text-[#1A1A1A] text-sm placeholder:text-[#7A7A7A] focus:outline-none focus:border-[#0D3B20] transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-[#4A4A4A]"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl border border-[#E0D9C6] bg-white text-[#1A1A1A] text-sm placeholder:text-[#7A7A7A] focus:outline-none focus:border-[#0D3B20] transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3 rounded-xl bg-[#0D3B20] text-white font-semibold text-sm transition-opacity disabled:opacity-60 hover:opacity-90"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#7A7A7A] mt-6">
          Access is by invitation only. Contact your cell lead if you need help.
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  )
}
