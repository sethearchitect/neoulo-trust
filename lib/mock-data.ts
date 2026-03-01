import type { Cell, Member, RIN, Farm, CropCycle, YieldLog, ExpenseLog, Contribution } from "@/types"

// ─── Cells ────────────────────────────────────────────────────────────────────

export const CELLS: Cell[] = [
  {
    id: "a0000000-0000-0000-0000-000000000001",
    name: "Umuahia Alpha Cell",
    location: "Umuahia North",
    state: "Abia",
    formed: "Aug 2025",
    status: "active",
    lat: 5.5273,
    lng: 7.4896,
  },
  {
    id: "a0000000-0000-0000-0000-000000000002",
    name: "Aba Beta Cell",
    location: "Aba South",
    state: "Abia",
    formed: "Oct 2025",
    status: "forming",
  },
  {
    id: "a0000000-0000-0000-0000-000000000003",
    name: "Enugu Gamma Cell",
    location: "Enugu North",
    state: "Enugu",
    formed: "Jan 2026",
    status: "forming",
  },
]

// ─── Members ──────────────────────────────────────────────────────────────────

export const MEMBERS: (Member & { contribution_total: number | null })[] = [
  // Umuahia Alpha
  {
    id: "b0000000-0000-0000-0000-000000000001",
    cell_id: "a0000000-0000-0000-0000-000000000001",
    name: "Emeka Okafor",
    role: "lead",
    profession: "Farmer",
    phone: "08031234567",
    joined: "Aug 2025",
    contribution_total: 350000,
  },
  {
    id: "b0000000-0000-0000-0000-000000000002",
    cell_id: "a0000000-0000-0000-0000-000000000001",
    name: "Ngozi Eze",
    role: "member",
    profession: "Trader",
    phone: "08032345678",
    joined: "Aug 2025",
    contribution_total: 250000,
  },
  {
    id: "b0000000-0000-0000-0000-000000000003",
    cell_id: "a0000000-0000-0000-0000-000000000001",
    name: "Chidi Nwachukwu",
    role: "member",
    profession: "Teacher",
    phone: "08033456789",
    joined: "Aug 2025",
    contribution_total: 300000,
  },
  {
    id: "b0000000-0000-0000-0000-000000000004",
    cell_id: "a0000000-0000-0000-0000-000000000001",
    name: "Adaeze Onwudiwe",
    role: "member",
    profession: "Nurse",
    phone: "08034567890",
    joined: "Aug 2025",
    contribution_total: 200000,
  },
  {
    id: "b0000000-0000-0000-0000-000000000005",
    cell_id: "a0000000-0000-0000-0000-000000000001",
    name: "Ikenna Obi",
    role: "member",
    profession: "Driver",
    phone: "08035678901",
    joined: "Aug 2025",
    contribution_total: 250000,
  },
  {
    id: "b0000000-0000-0000-0000-000000000006",
    cell_id: "a0000000-0000-0000-0000-000000000001",
    name: "Chioma Uche",
    role: "member",
    profession: "Seamstress",
    phone: "08036789012",
    joined: "Aug 2025",
    contribution_total: 150000,
  },
  // Aba Beta
  {
    id: "b0000000-0000-0000-0000-000000000007",
    cell_id: "a0000000-0000-0000-0000-000000000002",
    name: "Obinna Kalu",
    role: "lead",
    profession: "Farmer",
    phone: "08037890123",
    joined: "Oct 2025",
    contribution_total: null,
  },
  {
    id: "b0000000-0000-0000-0000-000000000008",
    cell_id: "a0000000-0000-0000-0000-000000000002",
    name: "Amarachi Nwosu",
    role: "member",
    profession: "Artisan",
    phone: "08038901234",
    joined: "Oct 2025",
    contribution_total: null,
  },
  {
    id: "b0000000-0000-0000-0000-000000000009",
    cell_id: "a0000000-0000-0000-0000-000000000002",
    name: "Emeka Ibe",
    role: "member",
    profession: "Trader",
    phone: "08039012345",
    joined: "Oct 2025",
    contribution_total: null,
  },
  // Enugu Gamma
  {
    id: "b0000000-0000-0000-0000-000000000010",
    cell_id: "a0000000-0000-0000-0000-000000000003",
    name: "Chukwuemeka Ani",
    role: "lead",
    profession: "Farmer",
    phone: "08030123456",
    joined: "Jan 2026",
    contribution_total: null,
  },
  {
    id: "b0000000-0000-0000-0000-000000000011",
    cell_id: "a0000000-0000-0000-0000-000000000003",
    name: "Nneka Obi",
    role: "member",
    profession: "Teacher",
    phone: "08031023456",
    joined: "Jan 2026",
    contribution_total: null,
  },
]

// ─── RINs ─────────────────────────────────────────────────────────────────────

export const RINS: (RIN & { raised: number })[] = [
  {
    id: "c0000000-0000-0000-0000-000000000001",
    cell_id: "a0000000-0000-0000-0000-000000000001",
    rin_code: "RIN-2025-001",
    target: 2500000,
    raised: 1500000,
    status: "deployed",
    return_rate: 18,
    asset_node: "Tomato Farm Plot A — Umuahia Industrial",
    notes: "First funded RIN from Umuahia Alpha.",
    opened_at: "2025-08-15",
    deployed_at: "2025-10-01",
    expected_return: "2026-03-01",
  },
  {
    id: "c0000000-0000-0000-0000-000000000002",
    cell_id: "a0000000-0000-0000-0000-000000000002",
    rin_code: "RIN-2025-002",
    target: 3000000,
    raised: 0,
    status: "forwarded",
    return_rate: 18,
    notes: "Aba Beta forwarded for capital review.",
    opened_at: "2025-10-20",
  },
  {
    id: "c0000000-0000-0000-0000-000000000003",
    cell_id: "a0000000-0000-0000-0000-000000000003",
    rin_code: "RIN-2026-001",
    target: 2500000,
    raised: 0,
    status: "open",
    return_rate: 18,
    notes: "Enugu Gamma open for contributions.",
    opened_at: "2026-01-10",
  },
]

// ─── Farm (Alpha only) ────────────────────────────────────────────────────────

export const ALPHA_FARM: Farm = {
  id: "d0000000-0000-0000-0000-000000000001",
  cell_id: "a0000000-0000-0000-0000-000000000001",
  crop: "Tomatoes",
  plot_size: "1 acre",
  irrigation_type: "Drip Irrigation",
}

export const ALPHA_CYCLE: CropCycle = {
  id: "e0000000-0000-0000-0000-000000000001",
  farm_id: "d0000000-0000-0000-0000-000000000001",
  season: "Dry Season 2025",
  planted_at: "2025-09-05",
  status: "harvested",
}

export const YIELD_LOGS: YieldLog[] = [
  {
    id: "00000000-0000-0000-f001-000000000002",
    cycle_id: "e0000000-0000-0000-0000-000000000001",
    date: "2025-11-28",
    quantity: "620 kg",
    value: 310000,
    market_price: "₦500/kg",
    buyer: "Umuahia Central Market",
    notes: "Second harvest batch.",
  },
  {
    id: "00000000-0000-0000-f001-000000000001",
    cycle_id: "e0000000-0000-0000-0000-000000000001",
    date: "2025-11-15",
    quantity: "480 kg",
    value: 240000,
    market_price: "₦500/kg",
    buyer: "Umuahia Central Market",
    notes: "First harvest batch.",
  },
]

export const EXPENSE_LOGS: ExpenseLog[] = [
  {
    id: "00000000-0000-0000-f002-000000000004",
    cycle_id: "e0000000-0000-0000-0000-000000000001",
    date: "2025-10-05",
    item: "Labour",
    amount: 44000,
    vendor: "Local contractors",
    receipt_no: "REC-004",
  },
  {
    id: "00000000-0000-0000-f002-000000000003",
    cycle_id: "e0000000-0000-0000-0000-000000000001",
    date: "2025-09-28",
    item: "Pesticide",
    amount: 18000,
    vendor: "AgriSupply Umuahia",
    receipt_no: "REC-003",
  },
  {
    id: "00000000-0000-0000-f002-000000000002",
    cycle_id: "e0000000-0000-0000-0000-000000000001",
    date: "2025-09-20",
    item: "Fertiliser",
    amount: 28000,
    vendor: "AgriSupply Umuahia",
    receipt_no: "REC-002",
  },
  {
    id: "00000000-0000-0000-f002-000000000001",
    cycle_id: "e0000000-0000-0000-0000-000000000001",
    date: "2025-09-06",
    item: "Seedlings",
    amount: 35000,
    vendor: "Eze Seedlings Ltd",
    receipt_no: "REC-001",
  },
]

// ─── Capital Desk ─────────────────────────────────────────────────────────────

export const SUGGESTED_NODES = [
  {
    id: "N1",
    name: "Tomato Farm Plot A — Umuahia Industrial",
    type: "Crop Farm",
    returnRate: "18%",
    suitability: 96,
  },
  {
    id: "N2",
    name: "Pepper Greenhouse — Aba East",
    type: "Greenhouse",
    returnRate: "21%",
    suitability: 88,
  },
  {
    id: "N3",
    name: "Leafy Greens Hub — Umuahia South",
    type: "Mixed Farm",
    returnRate: "15%",
    suitability: 74,
  },
]

// ─── Growth Chart ─────────────────────────────────────────────────────────────

export const GROWTH_DATA = [
  { m: "Aug", cells: 1, fam: 6 },
  { m: "Sep", cells: 1, fam: 6 },
  { m: "Oct", cells: 2, fam: 9 },
  { m: "Nov", cells: 2, fam: 9 },
  { m: "Dec", cells: 2, fam: 9 },
  { m: "Jan", cells: 3, fam: 11 },
  { m: "Feb", cells: 3, fam: 11 },
]

// ─── Pre-computed totals ──────────────────────────────────────────────────────

export const TOTAL_DEPLOYED = 1500000
export const TOTAL_YIELD = 550000
export const TOTAL_FAMILIES = 11

// ─── Individual Contributions (Alpha cell) ─────────────────────────────────

export const CONTRIBUTIONS: Contribution[] = [
  // Emeka Okafor (lead) ₦350,000
  { id: "f000-001", member_id: "b0000000-0000-0000-0000-000000000001", cell_id: "a0000000-0000-0000-0000-000000000001", amount: 150000, date: "2025-08-20", method: "Bank Transfer", reference: "TXN-A001", status: "confirmed", confirmed_by: "Emeka Okafor" },
  { id: "f000-002", member_id: "b0000000-0000-0000-0000-000000000001", cell_id: "a0000000-0000-0000-0000-000000000001", amount: 150000, date: "2025-10-05", method: "Bank Transfer", reference: "TXN-A002", status: "confirmed", confirmed_by: "Emeka Okafor" },
  { id: "f000-003", member_id: "b0000000-0000-0000-0000-000000000001", cell_id: "a0000000-0000-0000-0000-000000000001", amount: 50000,  date: "2025-12-01", method: "Cash", status: "confirmed", confirmed_by: "Emeka Okafor" },
  // Ngozi Eze ₦250,000
  { id: "f000-004", member_id: "b0000000-0000-0000-0000-000000000002", cell_id: "a0000000-0000-0000-0000-000000000001", amount: 100000, date: "2025-09-10", method: "Bank Transfer", reference: "TXN-B001", note: "September installment", status: "confirmed", confirmed_by: "Emeka Okafor" },
  { id: "f000-005", member_id: "b0000000-0000-0000-0000-000000000002", cell_id: "a0000000-0000-0000-0000-000000000001", amount: 100000, date: "2025-10-15", method: "Cash", status: "confirmed", confirmed_by: "Emeka Okafor" },
  { id: "f000-006", member_id: "b0000000-0000-0000-0000-000000000002", cell_id: "a0000000-0000-0000-0000-000000000001", amount: 50000,  date: "2025-11-20", method: "USSD Transfer", reference: "TXN-B003", note: "Final payment", status: "confirmed", confirmed_by: "Emeka Okafor" },
  // Chidi Nwachukwu ₦300,000
  { id: "f000-007", member_id: "b0000000-0000-0000-0000-000000000003", cell_id: "a0000000-0000-0000-0000-000000000001", amount: 200000, date: "2025-09-15", method: "Bank Transfer", reference: "TXN-C001", status: "confirmed", confirmed_by: "Emeka Okafor" },
  { id: "f000-008", member_id: "b0000000-0000-0000-0000-000000000003", cell_id: "a0000000-0000-0000-0000-000000000001", amount: 100000, date: "2025-11-08", method: "Mobile Money", status: "confirmed", confirmed_by: "Emeka Okafor" },
  // Adaeze Onwudiwe ₦200,000
  { id: "f000-009", member_id: "b0000000-0000-0000-0000-000000000004", cell_id: "a0000000-0000-0000-0000-000000000001", amount: 100000, date: "2025-09-20", method: "Bank Transfer", reference: "TXN-D001", status: "confirmed", confirmed_by: "Emeka Okafor" },
  { id: "f000-010", member_id: "b0000000-0000-0000-0000-000000000004", cell_id: "a0000000-0000-0000-0000-000000000001", amount: 100000, date: "2025-11-12", method: "Cash", status: "confirmed", confirmed_by: "Emeka Okafor" },
  // Ikenna Obi ₦250,000
  { id: "f000-011", member_id: "b0000000-0000-0000-0000-000000000005", cell_id: "a0000000-0000-0000-0000-000000000001", amount: 150000, date: "2025-09-25", method: "Bank Transfer", reference: "TXN-E001", status: "confirmed", confirmed_by: "Emeka Okafor" },
  { id: "f000-012", member_id: "b0000000-0000-0000-0000-000000000005", cell_id: "a0000000-0000-0000-0000-000000000001", amount: 100000, date: "2025-11-18", method: "USSD Transfer", status: "confirmed", confirmed_by: "Emeka Okafor" },
  // Chioma Uche ₦150,000
  { id: "f000-013", member_id: "b0000000-0000-0000-0000-000000000006", cell_id: "a0000000-0000-0000-0000-000000000001", amount: 100000, date: "2025-10-01", method: "Bank Transfer", reference: "TXN-F001", status: "confirmed", confirmed_by: "Emeka Okafor" },
  { id: "f000-014", member_id: "b0000000-0000-0000-0000-000000000006", cell_id: "a0000000-0000-0000-0000-000000000001", amount: 50000,  date: "2025-12-05", method: "Cash", status: "confirmed", confirmed_by: "Emeka Okafor" },
]
// Sum: 350,000 + 250,000 + 300,000 + 200,000 + 250,000 + 150,000 = ₦1,500,000

// ─── Convenience aliases for portal pages ──────────────────────────────────

export const MOCK_CELL   = CELLS[0]    // Umuahia Alpha
export const MOCK_RIN    = RINS[0]     // RIN-2025-001 (deployed)
export const MOCK_LEAD   = MEMBERS[0]  // Emeka Okafor
export const MOCK_MEMBER = MEMBERS[1]  // Ngozi Eze (simulated logged-in member)
