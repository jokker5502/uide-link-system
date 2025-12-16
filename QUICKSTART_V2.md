# UIDE-Link V2 - Frictionless System QUICKSTART

## 🚀 Get Running in 5 Minutes

This guide gets you up and running with the new **Chameleon Bus** system.

---

## Prerequisites

- PostgreSQL installed and running
- Python 3.8+ with pip
- Node.js (optional, for frontend dev server)
- Modern web browser (Chrome/Firefox/Edge)

---

## Step 1: Database Setup (2 minutes)

```bash
# Create database (if not exists)
createdb uide_link

# Apply V2 schema
psql -U postgres -d uide_link -f database/schema_v2.sql

# Load seed data (includes BUS-05 chameleon example)
psql -U postgres -d uide_link -f database/seed_v2.sql
```

**Verify:**
```sql
psql -U postgres -d uide_link -c "SELECT bus_number, static_qr_id FROM buses;"
```

Should show:
```
 bus_number | static_qr_id
------------+--------------
 BUS-01     | UIDE-BUS-01
 BUS-02     | UIDE-BUS-02
 BUS-03     | UIDE-BUS-03
 BUS-04     | UIDE-BUS-04
 BUS-05     | UIDE-BUS-05
```

---

## Step 2: Backend Setup (1 minute)

```bash
cd backend

# Install dependencies (if not already done)
pip install -r requirements.txt

# Start FastAPI server
uvicorn main:app --reload --port 8000
```

**Verify:**
Open http://localhost:8000 in browser. Should see:
```json
{
  "app": "UIDE-Link V2",
  "version": "2.0.0",
  "mode": "Frictionless Data Collection",
  "features": [...]
}
```

---

## Step 3: Test Chameleon Bus Logic (30 seconds)

In a **new terminal** (keep backend running):

```bash
cd backend
python test_resolver.py
```

**Expected Output:**
```
📅 SCHEDULE FOR BUS-05:
🚏 ARMENIA - La Armenia
   Time: 07:00 - 08:30
   Days: Mon, Tue, Wed, Thu, Fri

⏰ Scan at 07:30:
   ✓ Route: ARMENIA - La Armenia
   💰 Points: 85
   🌱 CO2 Saved: 425g

⏰ Scan at 11:15:
   ✓ Route: VALLE - Valle de los Chillos
   💰 Points: 123
   🌱 CO2 Saved: 615g
```

✅ **Success!** The chameleon bus is working!

---

## Step 4: Frontend (1 minute)

### Option A: Simple HTTP Server

```bash
cd frontend/public
python -m http.server 3000
```

Open: http://localhost:3000/student_v2.html

### Option B: Use Existing Setup

If you have a frontend dev server configured, just navigate to `student_v2.html`

---

## Step 5: Test the Complete Flow (1 minute)

### Generate Test QR Code

1. Go to https://qr.io or https://www.qr-code-generator.com/
2. Enter text: `UIDE-BUS-05`
3. Download/display QR code

### Scan Flow

1. Open http://localhost:3000/student_v2.html
2. Click **"📷 Escanear Código QR"**
3. Allow camera access
4. Point at your generated QR code
5. **Feel the vibration!**
6. See the instant animation with points earned

### What to Expect

✨ **Instant Feedback:**
- Phone vibrates (pattern: short-long-short)
- Full-screen animation appears
- Shows route name: "La Armenia" (if scanned during 7:00-8:30 AM)
- Points earned: ~85 points
- CO₂ saved: ~425g

📊 **Header Updates:**
- Total points increments
- Streak shows (if consecutive days)
- Total CO₂ updates

---

## 🧪 API Testing (Without Frontend)

### Test Scan Endpoint

```bash
curl -X POST http://localhost:8000/api/scan \
  -H "Content-Type: application/json" \
  -d '{
    "static_qr_id": "UIDE-BUS-05",
    "scan_type": "ENTRY",
    "client_event_id": "123e4567-e89b-12d3-a456-426614174000",
    "client_timestamp": "2025-12-16T07:30:00"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Welcome! Route detected: La Armenia",
  "route_name": "La Armenia",
  "bus_number": "BUS-05",
  "points_earned": 85,
  "co2_saved": "425g",
  "total_points": 85,
  "current_streak": 1,
  "total_co2_display": "425g",
  "new_achievements": ["FIRST_RIDE"],
  "session_token": "abc123..."
}
```

### Test Different Times

**Morning (ARMENIA):**
```bash
# Change timestamp to "2025-12-16T07:30:00"
# Expected route: ARMENIA
```

**Midday (VALLE):**
```bash
# Change timestamp to "2025-12-16T11:30:00"
# Expected route: VALLE
```

**Afternoon (CENTRO):**
```bash
# Change timestamp to "2025-12-16T16:30:00"
# Expected route: CENTRO
```

---

## 📱 Mobile Testing

### On Your Phone

1. **Get your computer's local IP:**
   ```bash
   # Windows
   ipconfig
   # Look for IPv4 Address (e.g., 192.168.1.100)
   
   # Mac/Linux
   ifconfig
   # Look for inet (e.g., 192.168.1.100)
   ```

2. **Access from phone:**
   - Connect phone to same WiFi
   - Open: `http://192.168.1.100:3000/student_v2.html`
   - Update API URL in page (if needed)

3. **Scan real QR codes**
   - Camera should work natively
   - Vibration will be physical
   - Test the < 5 second flow!

---

## 🎯 Quick Validation Checklist

- [x] Database has `schedule_assignments` table
- [x] BUS-05 has 3 different route schedules
- [x] Backend starts without errors
- [x] Test script shows correct route resolution
- [x] Frontend loads with gamification header
- [x] QR scan triggers vibration
- [x] Points animation displays
- [x] Header updates with new totals
- [x] Recent scans list updates

---

## 🐛 Troubleshooting

### Database Connection Error

**Error:** `could not connect to server`

**Fix:**
```bash
# Check PostgreSQL is running
pg_isready

# Start PostgreSQL (if not running)
# Windows: Start service in Services
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

### Backend Import Error

**Error:** `ModuleNotFoundError: No module named 'services'`

**Fix:**
```bash
cd backend

# Ensure directory exists
mkdir -p services
touch services/__init__.py

# Reinstall dependencies
pip install -r requirements.txt
```

### Frontend CORS Error

**Error:** `Access-Control-Allow-Origin error`

**Fix:** Backend already has CORS enabled. Check:
1. Backend is running on port 8000
2. Frontend config points to correct URL
3. Use same protocol (http:// not https://)

### Camera Not Working

**Error:** `Permission denied` or camera doesn't start

**Fix:**
1. **HTTPS Required:** Browsers require HTTPS for camera access (except localhost)
2. Use `localhost` (works) or set up HTTPS cert
3. Check browser permissions: Settings → Site Settings → Camera

### QR Code Not Scanning

**Issue:** Camera sees QR but nothing happens

**Fix:**
1. Check QR contains correct text: `UIDE-BUS-05`
2. Ensure good lighting
3. Hold QR steady for 2 seconds
4. Check browser console for errors (F12)

---

## 🎨 Customization

### Change Points Formula

Edit `backend/services/gamification.py`:
```python
POINTS_PER_KM = 15  # Increase from 10
STREAK_BONUS_MULTIPLIER = 1.5  # Increase from 1.2
```

### Change Vibration Pattern

Edit `frontend/public/js/scanner.js`:
```javascript
navigator.vibrate([300, 200, 300]); // Longer vibration
```

### Change Color Scheme

Edit `frontend/public/css/scanner-ui.css`:
```css
/* Change gradient colors */
background: linear-gradient(135deg, #10b981 0%, #059669 100%);
```

---

## 🔥 Advanced: Create Your Own Schedule

Add a new bus with custom schedule:

```sql
-- Insert bus
INSERT INTO buses (bus_number, license_plate, capacity, static_qr_id)
VALUES ('BUS-99', 'XYZ-9999', 50, 'UIDE-BUS-99');

-- Create schedule (different route morning vs afternoon)
INSERT INTO schedule_assignments 
  (bus_id, route_id, start_time, end_time, days_of_week, priority)
SELECT 
  (SELECT id FROM buses WHERE bus_number = 'BUS-99'),
  (SELECT id FROM routes WHERE code = 'ARMENIA'),
  '06:00'::time,
  '12:00'::time,
  ARRAY['Mon','Tue','Wed','Thu','Fri']::day_of_week[],
  10;

-- Add afternoon route
INSERT INTO schedule_assignments 
  (bus_id, route_id, start_time, end_time, days_of_week, priority)
SELECT 
  (SELECT id FROM buses WHERE bus_number = 'BUS-99'),
  (SELECT id FROM routes WHERE code = 'VALLE'),
  '13:00'::time,
  '20:00'::time,
  ARRAY['Mon','Tue','Wed','Thu','Fri']::day_of_week[],
  10;
```

Now generate QR code: `UIDE-BUS-99`

Scans before noon → ARMENIA  
Scans after 1 PM → VALLE

---

## 📚 Next Steps

1. **Read the Full Walkthrough:** [walkthrough.md](file:///C:/Users/mvill/.gemini/antigravity/brain/5768dc98-ad6c-415d-8e6a-676bfd00d18b/walkthrough.md)
2. **Review the Implementation Plan:** [implementation_plan.md](file:///C:/Users/mvill/.gemini/antigravity/brain/5768dc98-ad6c-415d-8e6a-676bfd00d18b/implementation_plan.md)
3. **Test All Features:** Points, streaks, achievements, leaderboard
4. **Deploy to Production:** See deployment checklist in walkthrough

---

## 💡 Pro Tips

- **Test at different times** to see route resolution in action
- **Scan multiple days in a row** to build streaks
- **Check the leaderboard:** http://localhost:8000/api/leaderboard
- **Monitor daily stats** in the database for analytics
- **Use different routes** to unlock "Route Explorer" badge

---

## 🎉 Success!

You now have a fully functional frictionless data collection system with:

✅ Context-aware chameleon bus routing  
✅ Real-time gamification  
✅ Instant feedback (< 5 seconds)  
✅ Persistent sessions  
✅ Offline support  

**Happy scanning!** 🚌📱
