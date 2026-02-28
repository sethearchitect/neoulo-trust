# Neoulo Trust — Project Bible

This file is read by Claude Code at the start of every session.
Always read this fully before writing any code, creating any files, or making any decisions.

---

## What this product is

**Neoulo Trust** is a cooperative agri-financing platform for southern Nigeria.
It organises families into 6-member **Cells** that pool capital via **Revolving Impact Notes (RINs)** to finance smallholder farms. Neoulo (the operator) reviews funded RINs, suggests optimal agricultural asset nodes, deploys capital, and manages farms on behalf of cells.

This is the **web platform** that serves three distinct user roles with separate portals.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Backend / DB | Supabase (Postgres + Auth + Row Level Security) |
| Deployment | Vercel |
| Language | TypeScript (strict mode) |
| State | React hooks + Supabase real-time where needed |

**Do not introduce any libraries not listed here without asking first.**
Preferred additional libs if ever needed: `recharts` for charts, `date-fns` for dates, `zod` for validation.

---

## Folder structure

```
neoulo-trust/
├── app/
│   ├── (admin)/              # Neoulo admin portal
│   │   ├── dashboard/
│   │   ├── cells/
│   │   ├── rins/
│   │   ├── farms/
│   │   └── capital/
│   ├── (lead)/               # Cell lead portal
│   │   ├── cell/
│   │   ├── rin/
│   │   ├── farm/
│   │   └── members/
│   ├── (member)/             # Cell member portal
│   │   ├── home/
│   │   ├── contributions/
│   │   └── farm/
│   ├── auth/
│   │   └── login/
│   └── layout.tsx
├── components/
│   ├── ui/                   # Shared primitives (Badge, Card, Modal, etc.)
│   └── [feature]/            # Feature-specific components
├── lib/
│   ├── supabase.ts           # Supabase client (browser)
│   ├── supabase-server.ts    # Supabase client (server components)
│   └── utils.ts              # fmt, pct, initials helpers
├── types/
│   └── index.ts              # All TypeScript types
├── supabase/
│   └── migrations/           # SQL migration files
├── public/
├── CLAUDE.md                 # ← this file
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## Design system

### Colours (use these exact hex values — do not substitute Tailwind defaults)

```ts
const colors = {
  forest:      "#0D3B20",   // primary brand — backgrounds, headings, buttons
  forestLight: "#1A5C34",   // secondary green
  forestMid:   "#145229",   // gradient stop
  cream:       "#F5F0E8",   // page background
  creamDark:   "#EDE7D6",   // card borders, dividers
  creamMid:    "#E0D9C6",   // input borders, tags
  gold:        "#C9A84C",   // accent — progress bars, RIN IDs, highlights
  goldLight:   "#E8C96A",   // lighter gold for dark backgrounds
  text:        "#1A1A1A",   // body text
  textMid:     "#4A4A4A",   // secondary text
  textLight:   "#7A7A7A",   // labels, captions
  white:       "#FFFFFF",
  success:     "#2D7A4F",
  warn:        "#B8860B",
  danger:      "#8B2500",
}
```

Use Tailwind's arbitrary value syntax: `bg-[#0D3B20]`, `text-[#C9A84C]`, etc.
Or define these in `tailwind.config.ts` under `theme.extend.colors` as the `neoulo` namespace.

### Typography

- **Display / headings:** `DM Serif Display` (Google Fonts) — serif, used for page titles, large stat values
- **Body / UI:** `DM Sans` (Google Fonts) — used for all body text, labels, buttons
- **Monospace / data:** `DM Mono` (Google Fonts) — used for RIN IDs, amounts, reference numbers, status labels

Load all three via `next/font/google` in `app/layout.tsx`. Assign as CSS variables.

### Component conventions

- Cards: white background, `rounded-2xl`, `border border-[#EDE7D6]`, `shadow-sm`
- Buttons (primary): `bg-[#0D3B20] text-white rounded-xl font-semibold`
- Buttons (secondary): `bg-[#EDE7D6] text-[#4A4A4A] rounded-xl`
- Status badges: dark background chip with coloured text — see status colour map below
- Progress bars: `bg-[#EDE7D6]` track, gold fill by default
- Page padding: `px-8 py-7` desktop, `px-4 py-5` mobile
- Animations: subtle `fadeUp` on page mount (CSS keyframe, 0.32s ease)

### Status badge colours

| Status | Background | Text |
|---|---|---|
| draft | #232323 | #999 |
| open | #0F2E4A | #7AC0FF |
| funded | #0F2E18 | #6AEFAA |
| forwarded | #2E0F2E | #D07AFF |
| reviewing | #2E1F00 | #FFD06A |
| deployed | #2E1F00 | #FFD06A |
| yielding | #0F2E20 | #7AFFCF |
| settled | #1A1A2E | #B07AFF |
| active | #0F2E18 | #6AEFAA |
| forming | #0F1F2E | #7AC0FF |
| confirmed | #0F2E18 | #6AEFAA |
| pending | #2E2000 | #FFAA44 |

---

## Database schema

### Tables

#### `cells`
```sql
id          uuid primary key default gen_random_uuid()
name        text not null                        -- "Umuahia Alpha Cell"
location    text not null                        -- "Umuahia North"
state       text not null                        -- "Abia"
formed      text                                 -- "Aug 2025"
status      text not null default 'forming'      -- forming | active
lat         numeric                              -- for map pins
lng         numeric
created_at  timestamptz default now()
```

#### `members`
```sql
id           uuid primary key default gen_random_uuid()
cell_id      uuid references cells(id)
user_id      uuid references auth.users(id)      -- links to Supabase auth
name         text not null
role         text not null default 'member'       -- lead | member
profession   text
phone        text
email        text
joined       text                                 -- "Aug 2025"
created_at   timestamptz default now()
```

#### `rins`
```sql
id              uuid primary key default gen_random_uuid()
cell_id         uuid references cells(id)
rin_code        text not null unique              -- "RIN-2025-001"
target          numeric not null
status          text not null default 'draft'     -- draft|open|funded|forwarded|reviewing|deployed|yielding|settled
return_rate     numeric default 18
asset_node      text                              -- human-readable asset description
notes           text
opened_at       date
deployed_at     date
expected_return date
created_at      timestamptz default now()
```

#### `contributions`
```sql
id             uuid primary key default gen_random_uuid()
member_id      uuid references members(id)
cell_id        uuid references cells(id)
amount         numeric not null
date           date not null
method         text not null                     -- Bank Transfer | Cash | USSD Transfer | Mobile Money
reference      text
note           text
status         text not null default 'confirmed' -- confirmed | pending
confirmed_by   text                              -- name of lead who logged it
created_at     timestamptz default now()
```

#### `farms`
```sql
id              uuid primary key default gen_random_uuid()
cell_id         uuid references cells(id) unique
crop            text not null
plot_size       text
irrigation_type text
created_at      timestamptz default now()
```

#### `crop_cycles`
```sql
id          uuid primary key default gen_random_uuid()
farm_id     uuid references farms(id)
season      text
planted_at  date
status      text default 'active'               -- active | harvested
created_at  timestamptz default now()
```

#### `yield_logs`
```sql
id           uuid primary key default gen_random_uuid()
cycle_id     uuid references crop_cycles(id)
date         date not null
quantity     text                               -- "480 kg"
value        numeric not null
market_price text                               -- "₦500/kg"
buyer        text
notes        text
created_at   timestamptz default now()
```

#### `expense_logs`
```sql
id          uuid primary key default gen_random_uuid()
cycle_id    uuid references crop_cycles(id)
date        date not null
item        text not null
amount      numeric not null
vendor      text
receipt_no  text
created_at  timestamptz default now()
```

---

## Row Level Security (RLS) rules

Enable RLS on every table. Policies follow this logic:

```
neoulo_admin  → SELECT, INSERT, UPDATE, DELETE on all tables
cell_lead     → full access to their own cell's rows only
cell_member   → SELECT only on their own cell's rows; no INSERT/UPDATE/DELETE
               (exception: members cannot see other members' contribution amounts)
```

User role is stored in `members.role`. Resolve it by joining `auth.users.id` → `members.user_id` → `members.role`.

Create a Postgres function `get_my_role()` and `get_my_cell_id()` to use inside RLS policies.

---

## TypeScript types (`types/index.ts`)

```ts
export type UserRole = 'neoulo_admin' | 'cell_lead' | 'cell_member'

export type CellStatus = 'forming' | 'active'

export type RINStatus =
  | 'draft' | 'open' | 'funded' | 'forwarded'
  | 'reviewing' | 'deployed' | 'yielding' | 'settled'

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
  role: 'lead' | 'member'
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
  method: 'Bank Transfer' | 'Cash' | 'USSD Transfer' | 'Mobile Money'
  reference?: string
  note?: string
  status: 'confirmed' | 'pending'
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
  status: 'active' | 'harvested'
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
```

---

## Auth and routing logic

1. User signs in via Supabase Auth (email + password at MVP)
2. On session start, query `members` table where `user_id = auth.uid()`
3. Read `role` and `cell_id` from the result
4. Redirect:
   - `neoulo_admin` → `/admin/dashboard`
   - `cell_lead` → `/lead/cell`
   - `cell_member` → `/member/home`
5. Middleware (`middleware.ts`) protects all `/(admin)`, `/(lead)`, `/(member)` routes
6. If no matching member record exists, redirect to an error page — do not create a member automatically

---

## Core business logic rules

**Contribution logging**
- Only `cell_lead` can log contributions on behalf of members
- Each contribution entry records: member, amount, date, method, reference, note, confirmed_by (lead's name)
- Contributions immediately update the member's total and the cell's RIN raised amount (computed by summing `contributions` where `status = confirmed`)
- The RIN `raised` amount is never stored — always computed live from the `contributions` table

**RIN lifecycle**
The RIN moves through these states in order. Only `cell_lead` can advance it; only `neoulo_admin` can advance from `reviewing` onwards.

```
draft → open → funded → forwarded → reviewing → deployed → yielding → settled
```

- `forwarded`: Lead triggers this. It grants Neoulo access to funds scoped to the RIN amount only — not the full cell wallet.
- `reviewing`: Neoulo reviews cell profile (location, maturity, members, goals) and selects an asset node.
- `deployed`: Neoulo selects an asset node and deploys capital. All cell members receive a notification email with a plain-language report explaining the choice.
- `settled`: Yield has been distributed. RIN is closed.

**Capital access scoping**
When a lead forwards a RIN, Neoulo gains access **only** to the amount declared in that RIN — not the cell's total pool balance. This is enforced at the application layer.

**Farm and yield data**
- Only `cell_lead` can log yield and expense entries
- Entries are always prepended (newest first) in the UI
- Member's farm view shows their proportional share: `(member_contribution / total_raised) * yield_value`

---

## Utility functions (`lib/utils.ts`)

Always use these helpers — do not format currency or percentages inline:

```ts
export const fmt = (n: number) =>
  "₦" + Number(n).toLocaleString("en-NG")

export const pct = (a: number, b: number) =>
  b === 0 ? 0 : Math.min(100, Math.round((a / b) * 100))

export const initials = (name: string) =>
  name.split(" ").map(w => w[0]).join("").toUpperCase()
```

---

## Seed data (for local dev and testing)

Three cells are pre-seeded:

| Cell | Location | RIN Status | Members |
|---|---|---|---|
| Umuahia Alpha | Umuahia North, Abia | deployed | 6 (lead: Emeka Okafor) |
| Aba Beta | Aba South, Abia | forwarded | 3 (lead: Obinna Kalu) |
| Enugu Gamma | Enugu North, Enugu | open | 2 (lead: Chukwuemeka Ani) |

The full seed data is in `neoulo-trust-v3.jsx` (the UI prototype) under `SEED_CELLS` and `SEED_CONTRIBS`. Use this as the source of truth for all seed values.

---

## What NOT to do

- Do not use `any` in TypeScript
- Do not store computed values (like `raised`) in the database — always derive them
- Do not add payment gateway integration at MVP — all contributions are manual cash/bank, logged by the lead
- Do not build a public-facing marketing page — this is an internal ops platform
- Do not use `localStorage` for auth state — use Supabase session cookies via `@supabase/ssr`
- Do not skip RLS — every table must have policies before going to production
- Do not use Tailwind's colour names for brand colours — use the hex values defined above
