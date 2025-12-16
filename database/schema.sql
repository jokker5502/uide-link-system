-- ===============================
-- schema_v2.sql - UIDE-Link Frictionless Data Collection
-- Chameleon Bus + Gamification + Context-Aware Routing
-- ===============================

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------- Types ----------
DO $$ BEGIN
  CREATE TYPE scan_type AS ENUM ('ENTRY','EXIT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE day_of_week AS ENUM ('Mon','Tue','Wed','Thu','Fri','Sat','Sun');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ===============================
-- CORE ENTITIES
-- ===============================

-- Routes (no change from v1)
CREATE TABLE IF NOT EXISTS routes (
  id          BIGSERIAL PRIMARY KEY,
  code        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  distance_km DECIMAL(10,2),  -- NEW: for points/CO2 calculation
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Buses with static QR support
CREATE TABLE IF NOT EXISTS buses (
  id            BIGSERIAL PRIMARY KEY,
  bus_number    TEXT UNIQUE NOT NULL,
  license_plate TEXT UNIQUE,
  capacity      INT,
  
  -- NEW: Static QR ID (one QR per bus, regardless of route)
  static_qr_id  TEXT UNIQUE NOT NULL,
  
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_buses_static_qr ON buses(static_qr_id);

-- Bus stops (NEW - for destination tracking)
CREATE TABLE IF NOT EXISTS bus_stops (
  id          BIGSERIAL PRIMARY KEY,
  route_id    BIGINT NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  latitude    DOUBLE PRECISION,
  longitude   DOUBLE PRECISION,
  stop_order  INT NOT NULL,  -- Order in route
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stops_route ON bus_stops(route_id);

-- ===============================
-- CHAMELEON BUS LOGIC
-- ===============================

-- Schedule Assignments: Maps bus to route with time windows
CREATE TABLE IF NOT EXISTS schedule_assignments (
  id            BIGSERIAL PRIMARY KEY,
  bus_id        BIGINT NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
  route_id      BIGINT NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  
  -- Time window when this bus serves this route
  start_time    TIME NOT NULL,
  end_time      TIME NOT NULL,
  
  -- Days this schedule applies
  days_of_week  day_of_week[] NOT NULL,
  
  -- Priority (higher = preferred if overlapping schedules exist)
  priority      INT NOT NULL DEFAULT 0,
  
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Prevent overlapping schedules for same bus (unless intentional with priority)
  CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

CREATE INDEX IF NOT EXISTS idx_schedule_bus ON schedule_assignments(bus_id, is_active);
CREATE INDEX IF NOT EXISTS idx_schedule_route ON schedule_assignments(route_id);

-- ===============================
-- STUDENT PROFILES
-- ===============================

CREATE TABLE IF NOT EXISTS students (
  id              BIGSERIAL PRIMARY KEY,
  student_id      TEXT UNIQUE,  -- Optional institutional ID
  email           TEXT UNIQUE,  -- Optional
  first_name      TEXT,
  last_name       TEXT,
  
  -- Gamification totals (cached for performance)
  total_points    BIGINT NOT NULL DEFAULT 0,
  current_streak  INT NOT NULL DEFAULT 0,
  last_scan_date  DATE,
  total_co2_saved DECIMAL(10,2) NOT NULL DEFAULT 0,  -- in grams
  
  -- Anonymous support
  is_anonymous    BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Session token for persistent login
  session_token   TEXT,
  token_expires   TIMESTAMPTZ,
  
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_students_session ON students(session_token);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);

-- ===============================
-- SCAN EVENTS (Updated)
-- ===============================

CREATE TABLE IF NOT EXISTS scan_events (
  id                  BIGSERIAL PRIMARY KEY,
  
  -- Student who scanned
  student_id          BIGINT REFERENCES students(id) ON DELETE SET NULL,
  
  -- Bus scanned (via static QR)
  bus_id              BIGINT NOT NULL REFERENCES buses(id) ON DELETE RESTRICT,
  
  -- Route inferred by server based on schedule + timestamp
  inferred_route_id   BIGINT REFERENCES routes(id) ON DELETE SET NULL,
  
  -- Scan type
  scan_type           scan_type NOT NULL,
  
  -- Destination (optional - student can tap their stop)
  destination_stop_id BIGINT REFERENCES bus_stops(id) ON DELETE SET NULL,
  
  -- Timestamps
  scanned_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  client_timestamp    TIMESTAMPTZ,
  
  -- Idempotency
  client_event_id     UUID NOT NULL UNIQUE,
  
  -- Gamification
  points_awarded      INT DEFAULT 0,
  co2_saved_grams     DECIMAL(10,2) DEFAULT 0,
  
  -- Metadata
  device_hash         TEXT,
  ip_hash             TEXT,
  latitude            DOUBLE PRECISION,
  longitude           DOUBLE PRECISION,
  
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scan_events_student ON scan_events(student_id, scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_scan_events_bus ON scan_events(bus_id, scanned_at);
CREATE INDEX IF NOT EXISTS idx_scan_events_route ON scan_events(inferred_route_id);
CREATE INDEX IF NOT EXISTS idx_scan_events_time ON scan_events(scanned_at);

-- ===============================
-- GAMIFICATION
-- ===============================

-- Points ledger (detailed log of all points earned)
CREATE TABLE IF NOT EXISTS user_points (
  id          BIGSERIAL PRIMARY KEY,
  student_id  BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  scan_id     BIGINT REFERENCES scan_events(id) ON DELETE SET NULL,
  
  points      INT NOT NULL,
  reason      TEXT,  -- e.g., "Bus ride", "7-day streak bonus"
  
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_points_student ON user_points(student_id, created_at DESC);

-- Achievements/Badges
CREATE TABLE IF NOT EXISTS achievements (
  id          BIGSERIAL PRIMARY KEY,
  code        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  icon        TEXT,  -- emoji or icon name
  threshold   INT,   -- points or rides required
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS student_achievements (
  id             BIGSERIAL PRIMARY KEY,
  student_id     BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  achievement_id BIGINT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(student_id, achievement_id)
);

-- ===============================
-- AGGREGATED COUNTERS (for dashboards)
-- ===============================

CREATE TABLE IF NOT EXISTS daily_stats (
  id              BIGSERIAL PRIMARY KEY,
  date            DATE NOT NULL,
  route_id        BIGINT REFERENCES routes(id) ON DELETE CASCADE,
  bus_id          BIGINT REFERENCES buses(id) ON DELETE CASCADE,
  
  total_scans     BIGINT NOT NULL DEFAULT 0,
  unique_students BIGINT NOT NULL DEFAULT 0,
  total_points    BIGINT NOT NULL DEFAULT 0,
  total_co2_saved DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(date, route_id, bus_id)
);

CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date DESC);

-- ===============================
-- VIEWS FOR REPORTING
-- ===============================

CREATE OR REPLACE VIEW v_scan_events_detailed AS
SELECT 
  se.id,
  se.scanned_at,
  s.first_name,
  s.last_name,
  s.student_id,
  b.bus_number,
  b.static_qr_id,
  r.code AS route_code,
  r.name AS route_name,
  se.scan_type,
  bs.name AS destination_stop,
  se.points_awarded,
  se.co2_saved_grams
FROM scan_events se
LEFT JOIN students s ON s.id = se.student_id
LEFT JOIN buses b ON b.id = se.bus_id
LEFT JOIN routes r ON r.id = se.inferred_route_id
LEFT JOIN bus_stops bs ON bs.id = se.destination_stop_id;

-- Student leaderboard view
CREATE OR REPLACE VIEW v_student_leaderboard AS
SELECT 
  s.id,
  COALESCE(s.first_name || ' ' || s.last_name, 'Anonymous User') AS name,
  s.total_points,
  s.current_streak,
  s.total_co2_saved,
  COUNT(se.id) AS total_rides,
  RANK() OVER (ORDER BY s.total_points DESC) AS rank
FROM students s
LEFT JOIN scan_events se ON se.student_id = s.id
WHERE s.is_anonymous = FALSE OR s.total_points > 0
GROUP BY s.id, s.first_name, s.last_name, s.total_points, s.current_streak, s.total_co2_saved;

-- ===============================
-- TRIGGERS
-- ===============================

-- Auto-update student totals on scan insert
CREATE OR REPLACE FUNCTION update_student_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE students
  SET 
    total_points = total_points + NEW.points_awarded,
    total_co2_saved = total_co2_saved + NEW.co2_saved_grams,
    last_scan_date = CURRENT_DATE,
    updated_at = now()
  WHERE id = NEW.student_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_student_stats
AFTER INSERT ON scan_events
FOR EACH ROW
WHEN (NEW.student_id IS NOT NULL)
EXECUTE FUNCTION update_student_stats();

-- Auto-update daily stats
CREATE OR REPLACE FUNCTION update_daily_stats()
RETURNS TRIGGER AS $$
DECLARE
  scan_date DATE := DATE(NEW.scanned_at);
BEGIN
  INSERT INTO daily_stats (date, route_id, bus_id, total_scans, total_points, total_co2_saved)
  VALUES (
    scan_date,
    NEW.inferred_route_id,
    NEW.bus_id,
    1,
    NEW.points_awarded,
    NEW.co2_saved_grams
  )
  ON CONFLICT (date, route_id, bus_id) 
  DO UPDATE SET
    total_scans = daily_stats.total_scans + 1,
    total_points = daily_stats.total_points + NEW.points_awarded,
    total_co2_saved = daily_stats.total_co2_saved + NEW.co2_saved_grams,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_daily_stats
AFTER INSERT ON scan_events
FOR EACH ROW
EXECUTE FUNCTION update_daily_stats();
