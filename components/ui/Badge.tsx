import type { RINStatus, CellStatus, ContributionStatus, CropCycleStatus } from "@/types"

type BadgeStatus =
  | RINStatus
  | CellStatus
  | ContributionStatus
  | CropCycleStatus
  | "asset_selected"

const STATUS_COLORS: Record<BadgeStatus, { bg: string; fg: string }> = {
  draft:          { bg: "#232323", fg: "#999" },
  open:           { bg: "#0F2E4A", fg: "#7AC0FF" },
  funded:         { bg: "#0F2E18", fg: "#6AEFAA" },
  forwarded:      { bg: "#2E0F2E", fg: "#D07AFF" },
  reviewing:      { bg: "#2E1F00", fg: "#FFD06A" },
  deployed:       { bg: "#2E1F00", fg: "#FFD06A" },
  yielding:       { bg: "#0F2E20", fg: "#7AFFCF" },
  settled:        { bg: "#1A1A2E", fg: "#B07AFF" },
  active:         { bg: "#0F2E18", fg: "#6AEFAA" },
  forming:        { bg: "#0F1F2E", fg: "#7AC0FF" },
  confirmed:      { bg: "#0F2E18", fg: "#6AEFAA" },
  pending:        { bg: "#2E2000", fg: "#FFAA44" },
  harvested:      { bg: "#0F2E20", fg: "#7AFFCF" },
  asset_selected: { bg: "#0F1F2E", fg: "#7ACFFF" },
}

interface BadgeProps {
  status: BadgeStatus
}

export function Badge({ status }: BadgeProps) {
  const { bg, fg } = STATUS_COLORS[status] ?? { bg: "#232323", fg: "#999" }

  return (
    <span
      className="font-mono text-[10px] font-bold tracking-[1.1px] uppercase px-[10px] py-[3px] rounded-full whitespace-nowrap inline-block"
      style={{ background: bg, color: fg }}
    >
      {status.replace("_", " ")}
    </span>
  )
}
