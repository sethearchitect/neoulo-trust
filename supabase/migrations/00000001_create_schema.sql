-- =============================================================================
-- Neoulo Trust — Full Schema Migration
-- =============================================================================
-- Tables: cells, members, rins, contributions, farms, crop_cycles,
--         yield_logs, expense_logs
-- Helpers: get_my_role(), get_my_cell_id()
-- RLS: admin (all) | lead (own cell, all ops) | member (own cell, SELECT only)
-- Seed: 3 cells, 11 members, 3 RINs, 11 contributions, 1 farm, 1 cycle,
--       2 yield logs, 4 expense logs
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. TABLES (created first — helper functions reference members table)
-- -----------------------------------------------------------------------------

create table if not exists cells (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  location    text        not null,
  state       text        not null,
  formed      text,
  status      text        not null default 'forming',  -- forming | active
  lat         numeric,
  lng         numeric,
  created_at  timestamptz default now()
);

create table if not exists members (
  id          uuid        primary key default gen_random_uuid(),
  cell_id     uuid        references cells(id),
  user_id     uuid        references auth.users(id),
  name        text        not null,
  role        text        not null default 'member',   -- neoulo_admin | lead | member
  profession  text,
  phone       text,
  email       text,
  joined      text,
  created_at  timestamptz default now()
);

create table if not exists rins (
  id              uuid        primary key default gen_random_uuid(),
  cell_id         uuid        references cells(id),
  rin_code        text        not null unique,
  target          numeric     not null,
  status          text        not null default 'draft', -- draft|open|funded|forwarded|reviewing|deployed|yielding|settled
  return_rate     numeric     default 18,
  asset_node      text,
  notes           text,
  opened_at       date,
  deployed_at     date,
  expected_return date,
  created_at      timestamptz default now()
);

create table if not exists contributions (
  id            uuid        primary key default gen_random_uuid(),
  member_id     uuid        references members(id),
  cell_id       uuid        references cells(id),
  amount        numeric     not null,
  date          date        not null,
  method        text        not null,  -- Bank Transfer | Cash | USSD Transfer | Mobile Money
  reference     text,
  note          text,
  status        text        not null default 'confirmed',  -- confirmed | pending
  confirmed_by  text,
  created_at    timestamptz default now()
);

create table if not exists farms (
  id              uuid        primary key default gen_random_uuid(),
  cell_id         uuid        references cells(id) unique,
  crop            text        not null,
  plot_size       text,
  irrigation_type text,
  created_at      timestamptz default now()
);

create table if not exists crop_cycles (
  id          uuid        primary key default gen_random_uuid(),
  farm_id     uuid        references farms(id),
  season      text,
  planted_at  date,
  status      text        default 'active',  -- active | harvested
  created_at  timestamptz default now()
);

create table if not exists yield_logs (
  id            uuid        primary key default gen_random_uuid(),
  cycle_id      uuid        references crop_cycles(id),
  date          date        not null,
  quantity      text,
  value         numeric     not null,
  market_price  text,
  buyer         text,
  notes         text,
  created_at    timestamptz default now()
);

create table if not exists expense_logs (
  id          uuid        primary key default gen_random_uuid(),
  cycle_id    uuid        references crop_cycles(id),
  date        date        not null,
  item        text        not null,
  amount      numeric     not null,
  vendor      text,
  receipt_no  text,
  created_at  timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- 2. HELPER FUNCTIONS (after tables so members relation exists)
-- -----------------------------------------------------------------------------

create or replace function get_my_role()
  returns text
  language sql
  security definer
  stable
as $$
  select role from members where user_id = auth.uid() limit 1;
$$;

create or replace function get_my_cell_id()
  returns uuid
  language sql
  security definer
  stable
as $$
  select cell_id from members where user_id = auth.uid() limit 1;
$$;

-- -----------------------------------------------------------------------------
-- 3. ENABLE ROW LEVEL SECURITY
-- -----------------------------------------------------------------------------

alter table cells        enable row level security;
alter table members      enable row level security;
alter table rins         enable row level security;
alter table contributions enable row level security;
alter table farms        enable row level security;
alter table crop_cycles  enable row level security;
alter table yield_logs   enable row level security;
alter table expense_logs enable row level security;

-- -----------------------------------------------------------------------------
-- 4. RLS POLICIES
-- -----------------------------------------------------------------------------

-- ── cells ────────────────────────────────────────────────────────────────────

create policy "admin: all on cells"
  on cells for all
  using (get_my_role() = 'neoulo_admin')
  with check (get_my_role() = 'neoulo_admin');

create policy "lead: all on own cell (cells)"
  on cells for all
  using (get_my_role() = 'lead' and id = get_my_cell_id())
  with check (get_my_role() = 'lead' and id = get_my_cell_id());

create policy "member: select own cell (cells)"
  on cells for select
  using (get_my_role() = 'member' and id = get_my_cell_id());

-- ── members ──────────────────────────────────────────────────────────────────

create policy "admin: all on members"
  on members for all
  using (get_my_role() = 'neoulo_admin')
  with check (get_my_role() = 'neoulo_admin');

create policy "lead: all on own cell (members)"
  on members for all
  using (get_my_role() = 'lead' and cell_id = get_my_cell_id())
  with check (get_my_role() = 'lead' and cell_id = get_my_cell_id());

create policy "member: select own cell (members)"
  on members for select
  using (get_my_role() = 'member' and cell_id = get_my_cell_id());

-- ── rins ─────────────────────────────────────────────────────────────────────

create policy "admin: all on rins"
  on rins for all
  using (get_my_role() = 'neoulo_admin')
  with check (get_my_role() = 'neoulo_admin');

create policy "lead: all on own cell (rins)"
  on rins for all
  using (get_my_role() = 'lead' and cell_id = get_my_cell_id())
  with check (get_my_role() = 'lead' and cell_id = get_my_cell_id());

create policy "member: select own cell (rins)"
  on rins for select
  using (get_my_role() = 'member' and cell_id = get_my_cell_id());

-- ── contributions ─────────────────────────────────────────────────────────────
-- Members can only see their OWN contribution rows (not other members' amounts)

create policy "admin: all on contributions"
  on contributions for all
  using (get_my_role() = 'neoulo_admin')
  with check (get_my_role() = 'neoulo_admin');

create policy "lead: all on own cell (contributions)"
  on contributions for all
  using (get_my_role() = 'lead' and cell_id = get_my_cell_id())
  with check (get_my_role() = 'lead' and cell_id = get_my_cell_id());

create policy "member: select own contributions only"
  on contributions for select
  using (
    get_my_role() = 'member'
    and member_id = (
      select id from members where user_id = auth.uid() limit 1
    )
  );

-- ── farms ─────────────────────────────────────────────────────────────────────

create policy "admin: all on farms"
  on farms for all
  using (get_my_role() = 'neoulo_admin')
  with check (get_my_role() = 'neoulo_admin');

create policy "lead: all on own cell (farms)"
  on farms for all
  using (get_my_role() = 'lead' and cell_id = get_my_cell_id())
  with check (get_my_role() = 'lead' and cell_id = get_my_cell_id());

create policy "member: select own cell (farms)"
  on farms for select
  using (get_my_role() = 'member' and cell_id = get_my_cell_id());

-- ── crop_cycles ───────────────────────────────────────────────────────────────

create policy "admin: all on crop_cycles"
  on crop_cycles for all
  using (get_my_role() = 'neoulo_admin')
  with check (get_my_role() = 'neoulo_admin');

create policy "lead: all on own cell (crop_cycles)"
  on crop_cycles for all
  using (
    get_my_role() = 'lead'
    and farm_id in (select id from farms where cell_id = get_my_cell_id())
  )
  with check (
    get_my_role() = 'lead'
    and farm_id in (select id from farms where cell_id = get_my_cell_id())
  );

create policy "member: select own cell (crop_cycles)"
  on crop_cycles for select
  using (
    get_my_role() = 'member'
    and farm_id in (select id from farms where cell_id = get_my_cell_id())
  );

-- ── yield_logs ────────────────────────────────────────────────────────────────

create policy "admin: all on yield_logs"
  on yield_logs for all
  using (get_my_role() = 'neoulo_admin')
  with check (get_my_role() = 'neoulo_admin');

create policy "lead: all on own cell (yield_logs)"
  on yield_logs for all
  using (
    get_my_role() = 'lead'
    and cycle_id in (
      select id from crop_cycles
      where farm_id in (select id from farms where cell_id = get_my_cell_id())
    )
  )
  with check (
    get_my_role() = 'lead'
    and cycle_id in (
      select id from crop_cycles
      where farm_id in (select id from farms where cell_id = get_my_cell_id())
    )
  );

create policy "member: select own cell (yield_logs)"
  on yield_logs for select
  using (
    get_my_role() = 'member'
    and cycle_id in (
      select id from crop_cycles
      where farm_id in (select id from farms where cell_id = get_my_cell_id())
    )
  );

-- ── expense_logs ──────────────────────────────────────────────────────────────

create policy "admin: all on expense_logs"
  on expense_logs for all
  using (get_my_role() = 'neoulo_admin')
  with check (get_my_role() = 'neoulo_admin');

create policy "lead: all on own cell (expense_logs)"
  on expense_logs for all
  using (
    get_my_role() = 'lead'
    and cycle_id in (
      select id from crop_cycles
      where farm_id in (select id from farms where cell_id = get_my_cell_id())
    )
  )
  with check (
    get_my_role() = 'lead'
    and cycle_id in (
      select id from crop_cycles
      where farm_id in (select id from farms where cell_id = get_my_cell_id())
    )
  );

create policy "member: select own cell (expense_logs)"
  on expense_logs for select
  using (
    get_my_role() = 'member'
    and cycle_id in (
      select id from crop_cycles
      where farm_id in (select id from farms where cell_id = get_my_cell_id())
    )
  );

-- -----------------------------------------------------------------------------
-- 5. SEED DATA
-- UUID convention:
--   cells:        a0000000-0000-0000-0000-00000000000N
--   members:      b0000000-0000-0000-0000-00000000000N (01–11)
--   rins:         c0000000-0000-0000-0000-00000000000N
--   farm:         d0000000-0000-0000-0000-000000000001
--   crop cycle:   e0000000-0000-0000-0000-000000000001
--   contributions: f0000000-0000-0000-0000-00000000000N (01–11)
--   yield logs:   00000000-0000-0000-yield-00000000000N
--   expense logs: 00000000-0000-0000-exps-00000000000N
-- -----------------------------------------------------------------------------

-- ── Cells ─────────────────────────────────────────────────────────────────────

insert into cells (id, name, location, state, formed, status) values
  ('a0000000-0000-0000-0000-000000000001', 'Umuahia Alpha Cell', 'Umuahia North', 'Abia',  'Aug 2025', 'active'),
  ('a0000000-0000-0000-0000-000000000002', 'Aba Beta Cell',      'Aba South',     'Abia',  'Sep 2025', 'forming'),
  ('a0000000-0000-0000-0000-000000000003', 'Enugu Gamma Cell',   'Enugu North',   'Enugu', 'Nov 2025', 'forming');

-- ── Members ───────────────────────────────────────────────────────────────────
-- Cell 1: Umuahia Alpha — 6 members (lead + 5)

insert into members (id, cell_id, user_id, name, role, profession, phone, email, joined) values
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', null, 'Emeka Okafor',      'lead',   'Agro-Entrepreneur', '08031234567', 'emeka@example.com',  'Aug 2025'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', null, 'Ngozi Eze',         'member', 'Civil Servant',      '08031234568', 'ngozi@example.com',  'Aug 2025'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', null, 'Chidi Nwachukwu',  'member', 'Teacher',            '08031234569', 'chidi@example.com',  'Aug 2025'),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', null, 'Adaeze Onwudiwe',  'member', 'Nurse',              '08031234570', 'adaeze@example.com', 'Aug 2025'),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', null, 'Ikenna Obi',       'member', 'Trader',             '08031234571', 'ikenna@example.com', 'Aug 2025'),
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', null, 'Chioma Uche',      'member', 'Seamstress',         '08031234572', 'chioma@example.com', 'Aug 2025');

-- Cell 2: Aba Beta — 3 members (lead + 2)

insert into members (id, cell_id, user_id, name, role, profession, phone, email, joined) values
  ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000002', null, 'Obinna Kalu',      'lead',   'Farmer',             '08051234567', 'obinna@example.com', 'Sep 2025'),
  ('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000002', null, 'Amarachi Osuji',   'member', 'Market Trader',      '08051234568', 'amara@example.com',  'Sep 2025'),
  ('b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000002', null, 'Kelechi Mba',      'member', 'Artisan',            '08051234569', 'kelechi@example.com','Sep 2025');

-- Cell 3: Enugu Gamma — 2 members (lead + 1)

insert into members (id, cell_id, user_id, name, role, profession, phone, email, joined) values
  ('b0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000003', null, 'Chukwuemeka Ani',  'lead',   'Engineer',           '07011234567', 'chuks@example.com',  'Nov 2025'),
  ('b0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000003', null, 'Nneka Igwe',       'member', 'Pharmacist',         '07011234568', 'nneka@example.com',  'Nov 2025');

-- ── RINs ──────────────────────────────────────────────────────────────────────

insert into rins (id, cell_id, rin_code, target, status, return_rate, asset_node, notes, opened_at, deployed_at, expected_return) values
  (
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'RIN-2025-001',
    2500000,
    'deployed',
    18,
    'Greenhouse Tomatoes — 1 acre, Drip Irrigation, Umuahia North',
    'Capital deployed to tomato greenhouse. Harvest cycle: Sep–Nov 2025.',
    '2025-08-10',
    '2025-09-01',
    '2025-11-30'
  ),
  (
    'c0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000002',
    'RIN-2025-002',
    3000000,
    'forwarded',
    18,
    null,
    'Awaiting Neoulo review. Cell has forwarded funds for crop selection.',
    '2025-09-15',
    null,
    null
  ),
  (
    'c0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000003',
    'RIN-2026-001',
    2500000,
    'open',
    18,
    null,
    'RIN open. Contributions underway.',
    '2025-11-20',
    null,
    null
  );

-- ── Farm (Alpha cell only) ────────────────────────────────────────────────────

insert into farms (id, cell_id, crop, plot_size, irrigation_type) values
  (
    'd0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Tomatoes',
    '1 acre',
    'Drip Irrigation'
  );

-- ── Crop Cycle ────────────────────────────────────────────────────────────────

insert into crop_cycles (id, farm_id, season, planted_at, status) values
  (
    'e0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    'Dry Season 2025',
    '2025-09-05',
    'harvested'
  );

-- ── Yield Logs ────────────────────────────────────────────────────────────────

insert into yield_logs (id, cycle_id, date, quantity, value, market_price, buyer, notes) values
  (
    '00000000-0000-0000-f001-000000000001',
    'e0000000-0000-0000-0000-000000000001',
    '2025-11-15',
    '480 kg',
    240000,
    '₦500/kg',
    'Mile 1 Market Trader',
    'First harvest batch — good quality, sold same day.'
  ),
  (
    '00000000-0000-0000-f001-000000000002',
    'e0000000-0000-0000-0000-000000000001',
    '2025-11-28',
    '620 kg',
    310000,
    '₦500/kg',
    'Umuahia Main Market',
    'Final harvest — bumper yield, stored 2 days before sale.'
  );

-- ── Expense Logs ──────────────────────────────────────────────────────────────

insert into expense_logs (id, cycle_id, date, item, amount, vendor, receipt_no) values
  (
    '00000000-0000-0000-f002-000000000001',
    'e0000000-0000-0000-0000-000000000001',
    '2025-09-06',
    'Tomato Seedlings',
    35000,
    'Abia State ADP',
    'ADP-2025-0912'
  ),
  (
    '00000000-0000-0000-f002-000000000002',
    'e0000000-0000-0000-0000-000000000001',
    '2025-09-08',
    'Fertiliser (NPK)',
    28000,
    'Agro-Inputs Ltd',
    'AIL-0089'
  ),
  (
    '00000000-0000-0000-f002-000000000003',
    'e0000000-0000-0000-0000-000000000001',
    '2025-10-12',
    'Pesticide',
    18000,
    'FarmCare Supplies',
    'FCS-4421'
  ),
  (
    '00000000-0000-0000-f002-000000000004',
    'e0000000-0000-0000-0000-000000000001',
    '2025-10-14',
    'Labour (weeding)',
    44000,
    null,
    null
  );

-- ── Contributions (Alpha cell — 11 entries totalling ₦1,500,000) ──────────────

insert into contributions (id, member_id, cell_id, amount, date, method, reference, status, confirmed_by) values
  -- Emeka Okafor (lead) — ₦350,000 total
  (
    'f0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    150000, '2025-08-15', 'Bank Transfer', 'TRF-EMK-0815', 'confirmed', 'Emeka Okafor'
  ),
  (
    'f0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    100000, '2025-09-05', 'Bank Transfer', 'TRF-EMK-0905', 'confirmed', 'Emeka Okafor'
  ),
  (
    'f0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    100000, '2025-10-03', 'Cash', null, 'confirmed', 'Emeka Okafor'
  ),
  -- Ngozi Eze — ₦250,000 total
  (
    'f0000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    100000, '2025-08-15', 'Bank Transfer', 'TRF-NGZ-0815', 'confirmed', 'Emeka Okafor'
  ),
  (
    'f0000000-0000-0000-0000-000000000005',
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    100000, '2025-09-03', 'Bank Transfer', 'TRF-NGZ-0903', 'confirmed', 'Emeka Okafor'
  ),
  (
    'f0000000-0000-0000-0000-000000000006',
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    50000, '2025-10-01', 'Cash', null, 'confirmed', 'Emeka Okafor'
  ),
  -- Chidi Nwachukwu — ₦300,000 total
  (
    'f0000000-0000-0000-0000-000000000007',
    'b0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    200000, '2025-09-05', 'Bank Transfer', 'TRF-CHD-0905', 'confirmed', 'Emeka Okafor'
  ),
  (
    'f0000000-0000-0000-0000-000000000008',
    'b0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    100000, '2025-10-10', 'Bank Transfer', 'TRF-CHD-1010', 'confirmed', 'Emeka Okafor'
  ),
  -- Adaeze Onwudiwe — ₦200,000 total
  (
    'f0000000-0000-0000-0000-000000000009',
    'b0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    200000, '2025-09-10', 'Bank Transfer', 'TRF-ADA-0910', 'confirmed', 'Emeka Okafor'
  ),
  -- Ikenna Obi — ₦250,000 total
  (
    'f0000000-0000-0000-0000-000000000010',
    'b0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000001',
    250000, '2025-10-05', 'Bank Transfer', 'TRF-IKE-1005', 'confirmed', 'Emeka Okafor'
  ),
  -- Chioma Uche — ₦150,000 total
  (
    'f0000000-0000-0000-0000-000000000011',
    'b0000000-0000-0000-0000-000000000006',
    'a0000000-0000-0000-0000-000000000001',
    150000, '2025-10-20', 'Cash', null, 'confirmed', 'Emeka Okafor'
  );

-- =============================================================================
-- Verification queries (run manually in SQL editor after applying):
--
--   select count(*) from cells;                                     -- 3
--   select count(*) from members;                                   -- 11
--   select count(*) from rins;                                      -- 3
--   select count(*) from contributions;                             -- 11
--   select sum(amount) from contributions
--     where cell_id = 'a0000000-0000-0000-0000-000000000001';      -- 1500000
-- =============================================================================
