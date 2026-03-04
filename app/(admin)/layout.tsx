import { NavBar } from "@/components/ui/NavBar"

const navLinks = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/cells", label: "Cells" },
  { href: "/admin/rins", label: "RINs" },
  { href: "/admin/farms", label: "Farms" },
  { href: "/admin/capital", label: "Capital" },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <NavBar navLinks={navLinks} roleLabel="Admin" />
      <main className="px-4 py-5 md:px-8 md:py-7">{children}</main>
    </div>
  )
}
