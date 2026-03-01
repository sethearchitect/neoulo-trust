import { initials } from "@/lib/utils"

interface AvatarProps {
  name: string
  size?: number
  color?: string
}

export function Avatar({ name, size = 36, color = "#0D3B20" }: AvatarProps) {
  return (
    <div
      className="flex items-center justify-center rounded-full font-sans font-semibold text-white"
      style={{
        width: size,
        height: size,
        background: color,
        fontSize: Math.round(size * 0.34),
        flexShrink: 0,
      }}
    >
      {initials(name)}
    </div>
  )
}
