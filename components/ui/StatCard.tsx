"use client"

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  accent?: boolean
  onClick?: () => void
  note?: string
}

export function StatCard({
  label,
  value,
  sub,
  accent = false,
  onClick,
  note,
}: StatCardProps) {
  return (
    <div
      className={[
        "rounded-2xl border p-5 flex flex-col gap-1 lift",
        accent
          ? "bg-[#0D3B20] border-[#1A5C34]"
          : "bg-white border-[#EDE7D6] shadow-[0_2px_10px_rgba(0,0,0,0.04)]",
        onClick ? "cursor-pointer" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <span
          className={[
            "font-mono text-[10px] uppercase tracking-[1.5px]",
            accent ? "text-[#6AEFAA]" : "text-[#7A7A7A]",
          ].join(" ")}
        >
          {label}
        </span>

        {onClick && !note && (
          <span
            className={[
              "text-[13px] font-semibold",
              accent ? "text-[#6AEFAA]" : "text-[#0D3B20]",
            ].join(" ")}
          >
            ↗
          </span>
        )}

        {note && !onClick && (
          <span
            className={[
              "font-mono text-[10px]",
              accent ? "text-[#6AEFAA]/70" : "text-[#7A7A7A]",
            ].join(" ")}
          >
            {note}
          </span>
        )}
      </div>

      <span
        className={[
          "font-serif text-2xl font-bold",
          accent ? "text-white" : "text-[#0D3B20]",
        ].join(" ")}
      >
        {value}
      </span>

      {sub && (
        <span
          className={[
            "font-sans text-[12px]",
            accent ? "text-white/60" : "text-[#7A7A7A]",
          ].join(" ")}
        >
          {sub}
        </span>
      )}
    </div>
  )
}
