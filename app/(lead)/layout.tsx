import Link from "next/link"
import { signOut } from "@/lib/actions"

const navLinks = [
  { href: "/lead/cell", label: "My Cell" },
  { href: "/lead/rin", label: "RIN" },
  { href: "/lead/members", label: "Members" },
  { href: "/lead/farm", label: "Farm" },
]

export default function LeadLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* Nav */}
      <nav className="bg-[#0D3B20] px-8 py-4 flex items-center gap-8">
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
          Cell Lead
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

      {/* Page content */}
      <main className="px-8 py-7">{children}</main>
    </div>
  )
}
