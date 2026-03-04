import { NavBar } from "@/components/ui/NavBar"

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
      <NavBar navLinks={navLinks} roleLabel="Member" />
      <main className="px-4 py-5 md:px-8 md:py-7">{children}</main>
    </div>
  )
}
