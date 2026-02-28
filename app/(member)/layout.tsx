import Link from "next/link"

const navLinks = [
  { href: "/member/home", label: "Home" },
  { href: "/member/contributions", label: "Contributions" },
  { href: "/member/farm", label: "Farm" },
]

export default function MemberLayout({
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
          Member
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
      </nav>

      {/* Page content */}
      <main className="px-8 py-7">{children}</main>
    </div>
  )
}
