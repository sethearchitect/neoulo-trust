"use client"

interface Tab {
  id: string
  label: string
}

interface TabsProps {
  tabs: Tab[]
  active: string
  onChange: (id: string) => void
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 bg-[#EDE7D6] rounded-xl p-1 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={[
            "px-4 py-[7px] rounded-[9px] font-semibold text-[13px] whitespace-nowrap transition-all duration-200",
            tab.id === active
              ? "bg-[#0D3B20] text-white"
              : "bg-transparent text-[#4A4A4A] hover:text-[#1A1A1A]",
          ].join(" ")}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
