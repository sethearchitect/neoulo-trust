export type UserRole = "neoulo_admin" | "cell_lead" | "cell_member"

export type CellStatus = "forming" | "active"

export type RINStatus =
  | "draft"
  | "open"
  | "funded"
  | "forwarded"
  | "reviewing"
  | "deployed"
  | "yielding"
  | "settled"

export type MemberRole = "lead" | "member"

export type ContributionStatus = "confirmed" | "pending"

export type ContributionMethod =
  | "Bank Transfer"
  | "Cash"
  | "USSD Transfer"
  | "Mobile Money"

export type CropCycleStatus = "active" | "harvested"

export interface Cell {
  id: string
  name: string
  location: string
  state: string
  formed: string
  status: CellStatus
  lat?: number
  lng?: number
}

export interface Member {
  id: string
  cell_id: string
  user_id?: string
  name: string
  role: MemberRole
  profession?: string
  phone?: string
  email?: string
  joined?: string
}

export interface RIN {
  id: string
  cell_id: string
  rin_code: string
  target: number
  status: RINStatus
  return_rate: number
  asset_node?: string
  notes?: string
  opened_at?: string
  deployed_at?: string
  expected_return?: string
}

export interface Contribution {
  id: string
  member_id: string
  cell_id: string
  amount: number
  date: string
  method: ContributionMethod
  reference?: string
  note?: string
  status: ContributionStatus
  confirmed_by?: string
}

export interface Farm {
  id: string
  cell_id: string
  crop: string
  plot_size?: string
  irrigation_type?: string
}

export interface CropCycle {
  id: string
  farm_id: string
  season?: string
  planted_at?: string
  status: CropCycleStatus
}

export interface YieldLog {
  id: string
  cycle_id: string
  date: string
  quantity?: string
  value: number
  market_price?: string
  buyer?: string
  notes?: string
}

export interface ExpenseLog {
  id: string
  cycle_id: string
  date: string
  item: string
  amount: number
  vendor?: string
  receipt_no?: string
}
