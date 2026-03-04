"use client"

import { useState } from "react"
import Link from "next/link"
import { signOut } from "@/lib/actions"

interface NavBarProps {
  navLinks: { href: string; label: string }[]
  roleLabel: string
}

export function NavBar({ navLinks, roleLabel }: NavBarProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      {/* Desktop nav — hidden on mobile */}
      <nav className="hidden md:flex bg-[#0D3B20] px-8 py-4 items-center gap-8">
        <span
          className="text-lg text-white mr-4"
          style={{ fontFamily: "var(--font-dm-serif)" }}
        >
          Neoulo Trust
        </span>
        <span
          className="text-xs font-medium tracking-widest uppercase text-[#C9A84C] mr-4"
          style={{ fontFamily: "var(--font-dm-mono)" }}
        >
          {roleLabel}
        </span>
        <div className="flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="ml-auto">
          <form action={signOut}>
            <button
              type="submit"
              className="text-white/60 hover:text-white text-sm font-medium transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </nav>

      {/* Mobile sticky header — hidden on desktop */}
      <header className="flex md:hidden bg-[#0D3B20] px-4 py-3 items-center justify-between sticky top-0 z-50">
        <span
          className="text-lg text-white"
          style={{ fontFamily: "var(--font-dm-serif)" }}
        >
          Neoulo Trust
        </span>
        <button
          onClick={() => setMenuOpen(true)}
          className="text-white text-2xl leading-none w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors"
          aria-label="Open menu"
        >
          ☰
        </button>
      </header>

      {/* Backdrop */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/45 z-[499] md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Slide-out drawer */}
      <div
        className={[
          "fixed inset-y-0 left-0 w-64 bg-[#0D3B20] z-[500] flex flex-col md:hidden",
          "transition-transform duration-[260ms] ease-in-out",
          menuOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Drawer header */}
        <div className="px-5 pt-6 pb-4 border-b border-white/10">
          <p
            className="text-lg text-white"
            style={{ fontFamily: "var(--font-dm-serif)" }}
          >
            Neoulo Trust
          </p>
          <p
            className="text-xs font-medium tracking-widest uppercase text-[#C9A84C] mt-1"
            style={{ fontFamily: "var(--font-dm-mono)" }}
          >
            {roleLabel}
          </p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="py-2.5 px-4 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors text-sm"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Sign out */}
        <div className="px-5 py-5 border-t border-white/10">
          <form action={signOut}>
            <button
              type="submit"
              className="text-white/60 hover:text-white text-sm font-medium transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
