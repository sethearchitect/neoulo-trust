import { pct } from "@/lib/utils"

interface ProgressBarProps {
  value: number
  max: number
  color?: string
  height?: number
}

export function ProgressBar({
  value,
  max,
  color = "#C9A84C",
  height = 8,
}: ProgressBarProps) {
  return (
    <div
      className="bg-[#EDE7D6] rounded-full overflow-hidden w-full"
      style={{ height }}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{ width: `${pct(value, max)}%`, background: color }}
      />
    </div>
  )
}
