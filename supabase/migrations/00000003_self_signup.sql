-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 00000003: Self-service sign-up & cell onboarding
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── profiles ────────────────────────────────────────────────────────────────

CREATE TABLE profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  phone       text,
  email       text,
  profession  text,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own profile
CREATE POLICY "profiles: own row select"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "profiles: own row insert"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles: own row update"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admins can read all profiles
CREATE POLICY "profiles: admin select all"
  ON profiles FOR SELECT
  USING (get_my_role() = 'neoulo_admin');

-- ─── cell_requests ────────────────────────────────────────────────────────────

CREATE TABLE cell_requests (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type                text NOT NULL CHECK (type IN ('join_cell', 'start_cell')),
  cell_id             uuid REFERENCES cells(id) ON DELETE SET NULL,
  proposed_cell_name  text,
  proposed_location   text,
  proposed_state      text,
  message             text,
  status              text NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by         text,
  reviewed_at         timestamptz,
  created_at          timestamptz DEFAULT now()
);

ALTER TABLE cell_requests ENABLE ROW LEVEL SECURITY;

-- Users can insert their own requests
CREATE POLICY "cell_requests: user insert own"
  ON cell_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can read their own requests
CREATE POLICY "cell_requests: user select own"
  ON cell_requests FOR SELECT
  USING (user_id = auth.uid());

-- Leads can read join_cell requests for their cell
CREATE POLICY "cell_requests: lead select join for their cell"
  ON cell_requests FOR SELECT
  USING (
    type = 'join_cell'
    AND EXISTS (
      SELECT 1 FROM members m
      WHERE m.user_id = auth.uid()
        AND m.role = 'lead'
        AND m.cell_id = cell_requests.cell_id
    )
  );

-- Admins can read/update all requests
CREATE POLICY "cell_requests: admin select all"
  ON cell_requests FOR SELECT
  USING (get_my_role() = 'neoulo_admin');

CREATE POLICY "cell_requests: admin update all"
  ON cell_requests FOR UPDATE
  USING (get_my_role() = 'neoulo_admin');

-- Leads can update join_cell requests for their cell (approve/reject)
CREATE POLICY "cell_requests: lead update join for their cell"
  ON cell_requests FOR UPDATE
  USING (
    type = 'join_cell'
    AND EXISTS (
      SELECT 1 FROM members m
      WHERE m.user_id = auth.uid()
        AND m.role = 'lead'
        AND m.cell_id = cell_requests.cell_id
    )
  );

-- ─── cross-table policies (added after both tables exist) ─────────────────────

-- Leads can read profiles for users who have a join request to their cell
CREATE POLICY "profiles: lead can see requesters"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cell_requests cr
      JOIN members m ON m.cell_id = cr.cell_id
      WHERE cr.user_id = profiles.id
        AND cr.type = 'join_cell'
        AND m.user_id = auth.uid()
        AND m.role = 'lead'
    )
  );
