"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { createProfile } from "@/lib/actions"

export default function SignUpPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [profession, setProfession] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
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

    startTransition(async () => {
      const supabase = createClient()

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, phone: phone || null, profession: profession || null },
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      // If email confirmation is disabled (instant session), create profile and redirect
      if (data.session) {
        const result = await createProfile({ name, phone: phone || undefined, email, profession: profession || undefined })
        if (result.error) {
          setError(result.error)
          return
        }
        router.push("/onboarding")
        router.refresh()
        return
      }

      // Email confirmation required — profile data is stored in user_metadata server-side.
      // app/page.tsx will auto-create the profiles row from metadata after the user confirms
      // and signs in, so no client-side storage is needed here.

      setDone(true)
    })
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F0E8] px-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-center mb-8">
            <h1
              className="text-3xl text-[#0D3B20] mb-1"
              style={{ fontFamily: "var(--font-dm-serif)" }}
            >
              Neoulo Trust
            </h1>
          </div>
          <div className="bg-white rounded-2xl border border-[#EDE7D6] shadow-sm px-8 py-8">
            <div className="w-12 h-12 rounded-full bg-[#0F2E18] flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-[#6AEFAA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2
              className="text-lg font-semibold text-[#1A1A1A] mb-2"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Check your email
            </h2>
            <p className="text-sm text-[#7A7A7A]">
              We sent a confirmation link to <span className="font-semibold text-[#1A1A1A]">{email}</span>. Click it to activate your account.
            </p>
          </div>
          <p className="text-center text-xs text-[#7A7A7A] mt-6">
            Already confirmed?{" "}
            <a href="/auth/login" className="text-[#0D3B20] font-semibold hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F0E8] px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Wordmark */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl text-[#0D3B20] mb-1"
            style={{ fontFamily: "var(--font-dm-serif)" }}
          >
            Neoulo Trust
          </h1>
          <p className="text-sm text-[#7A7A7A]">Cooperative agri-financing platform</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#EDE7D6] shadow-sm px-8 py-8">
          <h2
            className="text-lg font-semibold text-[#1A1A1A] mb-6"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Create an account
          </h2>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-[#8B2500]/10 text-[#8B2500] text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-medium text-[#4A4A4A]">
                Full name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className="w-full px-4 py-3 rounded-xl border border-[#E0D9C6] bg-white text-[#1A1A1A] text-sm placeholder:text-[#7A7A7A] focus:outline-none focus:border-[#0D3B20] transition-colors"
                placeholder="Emeka Okafor"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-[#4A4A4A]">
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
              <label htmlFor="phone" className="text-sm font-medium text-[#4A4A4A]">
                Phone <span className="text-[#7A7A7A] font-normal">(optional)</span>
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                className="w-full px-4 py-3 rounded-xl border border-[#E0D9C6] bg-white text-[#1A1A1A] text-sm placeholder:text-[#7A7A7A] focus:outline-none focus:border-[#0D3B20] transition-colors"
                placeholder="+234 800 000 0000"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="profession" className="text-sm font-medium text-[#4A4A4A]">
                Profession <span className="text-[#7A7A7A] font-normal">(optional)</span>
              </label>
              <input
                id="profession"
                type="text"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#E0D9C6] bg-white text-[#1A1A1A] text-sm placeholder:text-[#7A7A7A] focus:outline-none focus:border-[#0D3B20] transition-colors"
                placeholder="Farmer, Trader, Civil Servant…"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-[#4A4A4A]">
                Password
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
              <label htmlFor="confirm" className="text-sm font-medium text-[#4A4A4A]">
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
              disabled={isPending}
              className="mt-2 w-full py-3 rounded-xl bg-[#0D3B20] text-white font-semibold text-sm transition-opacity disabled:opacity-60 hover:opacity-90"
            >
              {isPending ? "Creating account…" : "Create account →"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#7A7A7A] mt-6">
          Already have an account?{" "}
          <a href="/auth/login" className="text-[#0D3B20] font-semibold hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}
