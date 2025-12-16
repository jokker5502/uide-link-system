-- ===============================
-- seed_v2.sql - Sample data for Frictionless System
-- ===============================

-- Clean slate (optional - uncomment for fresh seed)
-- TRUNCATE scan_events, user_points, student_achievements, students, 
--   schedule_assignments, bus_stops, daily_stats, buses, routes, achievements 
--   RESTART IDENTITY CASCADE;

-- ===============================
-- ROUTES
-- ===============================
INSERT INTO routes (code, name, description, distance_km) VALUES
  ('ARMENIA', 'La Armenia', 'Ruta hacia el sector La Armenia', 8.5),
  ('VALLE', 'Valle de los Chillos', 'Ruta hacia el Valle de los Chillos', 12.3),
  ('CENTRO', 'Centro Histórico', 'Ruta hacia el Centro de Quito', 6.2),
  ('CUMBAYA', 'Cumbayá', 'Ruta hacia Cumbayá y Tumbaco', 10.8)
ON CONFLICT (code) DO NOTHING;

-- ===============================
-- BUSES (with static QR IDs)
-- ===============================
INSERT INTO buses (bus_number, license_plate, capacity, static_qr_id) VALUES
  ('BUS-01', 'ABC-1234', 40, 'UIDE-BUS-01'),
  ('BUS-02', 'DEF-5678', 40, 'UIDE-BUS-02'),
  ('BUS-03', 'GHI-9012', 35, 'UIDE-BUS-03'),
  ('BUS-04', 'JKL-3456', 40, 'UIDE-BUS-04'),
  ('BUS-05', 'MNO-7890', 40, 'UIDE-BUS-05')  -- The "Chameleon Bus"
ON CONFLICT (bus_number) DO NOTHING;

-- ===============================
-- BUS STOPS
-- ===============================
WITH route_ids AS (
  SELECT id, code FROM routes
)
INSERT INTO bus_stops (route_id, name, latitude, longitude, stop_order)
SELECT 
  r.id,
  s.name,
  s.lat,
  s.lng,
  s.stop_order
FROM route_ids r
JOIN (VALUES
  -- ARMENIA route stops
  ('ARMENIA', 'Terminal UIDE', -0.1807, -78.4678, 1),
  ('ARMENIA', 'Estación El Recreo', -0.2569, -78.5229, 2),
  ('ARMENIA', 'Parque La Armenia', -0.2923, -78.5458, 3),
  ('ARMENIA', 'Terminal La Armenia', -0.3156, -78.5612, 4),
  
  -- VALLE route stops
  ('VALLE', 'Terminal UIDE', -0.1807, -78.4678, 1),
  ('VALLE', 'San Rafael', -0.2847, -78.4456, 2),
  ('VALLE', 'Sangolquí Centro', -0.3089, -78.4489, 3),
  ('VALLE', 'Valle de los Chillos', -0.3234, -78.4567, 4),
  
  -- CENTRO route stops
  ('CENTRO', 'Terminal UIDE', -0.1807, -78.4678, 1),
  ('CENTRO', 'La Marín', -0.2167, -78.5089, 2),
  ('CENTRO', 'Plaza Grande', -0.2201, -78.5126, 3),
  ('CENTRO', 'San Francisco', -0.2213, -78.5145, 4)
) AS s(route_code, name, lat, lng, stop_order)
ON r.code = s.route_code
ON CONFLICT DO NOTHING;

-- ===============================
-- SCHEDULE ASSIGNMENTS (Chameleon Bus Logic)
-- ===============================
WITH bus_ids AS (SELECT id, bus_number FROM buses),
     route_ids AS (SELECT id, code FROM routes)
INSERT INTO schedule_assignments (bus_id, route_id, start_time, end_time, days_of_week, priority)
SELECT 
  b.id,
  r.id,
  s.start_time::TIME,
  s.end_time::TIME,
  s.days::day_of_week[],
  s.priority
FROM bus_ids b
JOIN (VALUES
  -- Regular buses (one route per bus per day)
  ('BUS-01', 'ARMENIA', '06:00', '09:00', ARRAY['Mon','Tue','Wed','Thu','Fri'], 0),
  ('BUS-01', 'ARMENIA', '15:00', '19:00', ARRAY['Mon','Tue','Wed','Thu','Fri'], 0),
  
  ('BUS-02', 'VALLE', '06:30', '09:30', ARRAY['Mon','Tue','Wed','Thu','Fri'], 0),
  ('BUS-02', 'VALLE', '15:30', '19:30', ARRAY['Mon','Tue','Wed','Thu','Fri'], 0),
  
  ('BUS-03', 'CENTRO', '07:00', '10:00', ARRAY['Mon','Tue','Wed','Thu','Fri'], 0),
  ('BUS-03', 'CENTRO', '16:00', '20:00', ARRAY['Mon','Tue','Wed','Thu','Fri'], 0),
  
  ('BUS-04', 'CUMBAYA', '06:00', '09:00', ARRAY['Mon','Tue','Wed','Thu','Fri'], 0),
  
  -- **THE CHAMELEON BUS** (BUS-05 does multiple routes)
  ('BUS-05', 'ARMENIA', '07:00', '08:30', ARRAY['Mon','Tue','Wed','Thu','Fri'], 10),
  ('BUS-05', 'VALLE', '11:00', '12:30', ARRAY['Mon','Tue','Wed','Thu','Fri'], 10),
  ('BUS-05', 'CENTRO', '16:00', '17:30', ARRAY['Mon','Tue','Wed','Thu','Fri'], 10)
) AS s(bus_number, route_code, start_time, end_time, days, priority)
  ON b.bus_number = s.bus_number
JOIN route_ids r ON r.code = s.route_code
ON CONFLICT DO NOTHING;

-- ===============================
-- STUDENTS (Test accounts)
-- ===============================
INSERT INTO students (student_id, email, first_name, last_name, is_anonymous, total_points, current_streak, session_token, token_expires)
VALUES
  ('2021001', 'maria.garcia@uide.edu.ec', 'María', 'García', FALSE, 150, 3, 
   encode(digest('token_maria_' || now()::text, 'sha256'), 'hex'), 
   now() + interval '30 days'),
  
  ('2021002', 'juan.perez@uide.edu.ec', 'Juan', 'Pérez', FALSE, 320, 7, 
   encode(digest('token_juan_' || now()::text, 'sha256'), 'hex'), 
   now() + interval '30 days'),
  
  (NULL, NULL, 'Anon', 'User', TRUE, 50, 1, 
   encode(digest('token_anon_' || now()::text, 'sha256'), 'hex'), 
   now() + interval '30 days')
ON CONFLICT DO NOTHING;

-- ===============================
-- ACHIEVEMENTS
-- ===============================
INSERT INTO achievements (code, name, description, icon, threshold) VALUES
  ('FIRST_RIDE', 'First Ride', 'Complete your first bus ride', '🎉', 1),
  ('WEEK_WARRIOR', 'Week Warrior', 'Scan 7 days in a row', '🔥', 7),
  ('ECO_HERO', 'Eco Hero', 'Save 10kg of CO2', '🌱', 10000),
  ('CENTURY', 'Century Club', 'Accumulate 100 points', '💯', 100),
  ('EXPLORER', 'Route Explorer', 'Use all 4 routes', '🗺️', 4)
ON CONFLICT (code) DO NOTHING;

-- ===============================
-- SAMPLE SCAN EVENTS (for testing)
-- ===============================
WITH student_data AS (SELECT id FROM students WHERE email = 'maria.garcia@uide.edu.ec'),
     bus_data AS (SELECT id FROM buses WHERE bus_number = 'BUS-05'),
     route_data AS (SELECT id FROM routes WHERE code = 'ARMENIA')
INSERT INTO scan_events (
  student_id, 
  bus_id, 
  inferred_route_id, 
  scan_type, 
  client_event_id,
  scanned_at,
  points_awarded,
  co2_saved_grams
)
SELECT 
  s.id,
  b.id,
  r.id,
  'ENTRY'::scan_type,
  gen_random_uuid(),
  now() - interval '2 days' + interval '7 hours',  -- Simulate scan at 07:00 (ARMENIA time)
  10,
  425
FROM student_data s, bus_data b, route_data r;

-- Sample scan for VALLE route (same bus, different time)
WITH student_data AS (SELECT id FROM students WHERE email = 'juan.perez@uide.edu.ec'),
     bus_data AS (SELECT id FROM buses WHERE bus_number = 'BUS-05'),
     route_data AS (SELECT id FROM routes WHERE code = 'VALLE')
INSERT INTO scan_events (
  student_id, 
  bus_id, 
  inferred_route_id, 
  scan_type, 
  client_event_id,
  scanned_at,
  points_awarded,
  co2_saved_grams
)
SELECT 
  s.id,
  b.id,
  r.id,
  'ENTRY'::scan_type,
  gen_random_uuid(),
  now() - interval '1 day' + interval '11 hours',  -- Simulate scan at 11:00 (VALLE time)
  15,
  615
FROM student_data s, bus_data b, route_data r;

-- ===============================
-- INITIAL POINTS AWARDS
-- ===============================
INSERT INTO user_points (student_id, points, reason)
SELECT id, 50, 'Welcome bonus'
FROM students
WHERE is_anonymous = FALSE
ON CONFLICT DO NOTHING;
