import { NavBar } from "@/components/ui/NavBar"

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
      <NavBar navLinks={navLinks} roleLabel="Cell Lead" />
      <main className="px-4 py-5 md:px-8 md:py-7">{children}</main>
    </div>
  )
}
