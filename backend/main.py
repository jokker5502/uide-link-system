"""
UIDE-Link V2 - Frictionless Data Collection Backend
Main API with context-aware route resolution
"""

from datetime import datetime, timedelta, date
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
import uuid
import hashlib

from db import get_session
from models import (
    Bus, Route, ScanEvent, Student, ScanRequest, ScanResponse,
    BusStop, Achievement
)
from services.route_resolver import RouteResolver
from services.gamification import GamificationService


app = FastAPI(title="UIDE-Link V2 - Frictionless System")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ===============================
# HELPER FUNCTIONS
# ===============================

def generate_session_token() -> str:
    """Generate a secure session token"""
    return hashlib.sha256(
        f"{uuid.uuid4()}{datetime.utcnow()}".encode()
    ).hexdigest()


def get_or_create_anonymous_student(session: Session) -> Student:
    """Create an anonymous student for frictionless onboarding"""
    student = Student(
        is_anonymous=True,
        first_name="Anonymous",
        last_name="User",
        session_token=generate_session_token(),
        token_expires=datetime.utcnow() + timedelta(days=30)
    )
    session.add(student)
    session.commit()
    session.refresh(student)
    return student


def get_student_by_token(session: Session, token: str) -> Student | None:
    """Get student by session token"""
    statement = select(Student).where(
        Student.session_token == token,
        Student.token_expires > datetime.utcnow()
    )
    return session.exec(statement).first()


# ===============================
# MAIN SCAN ENDPOINT (The Innovation)
# ===============================

@app.post("/api/scan", response_model=ScanResponse)
async def scan_qr(
    scan_request: ScanRequest,
    request: Request,
    session: Session = Depends(get_session)
):
    """
    THE FRICTIONLESS SCAN ENDPOINT
    
    Flow:
    1. Receive static QR ID + timestamp
    2. Resolve route using RouteResolver (chameleon bus logic)
    3. Calculate points + CO2 using GamificationService
    4. Store scan event
    5. Return instant feedback
    
    Speed: Optimized for < 2 second response
    """
    
    # Initialize services
    resolver = RouteResolver(session)
    gamification = GamificationService(session)
    
    # Get or create student
    student = None
    if scan_request.session_token:
        student = get_student_by_token(session, scan_request.session_token)
    
    if not student:
        # Create anonymous student for truly frictionless experience
        student = get_or_create_anonymous_student(session)
    
    # STEP 1: Resolve route from static QR + timestamp
    scan_time = scan_request.client_timestamp or datetime.utcnow()
    
    result = resolver.resolve_route_from_static_qr(
        scan_request.static_qr_id,
        scan_time
    )
    
    if not result:
        raise HTTPException(
            status_code=404,
            detail=f"No route found for QR '{scan_request.static_qr_id}' at this time"
        )
    
    bus_id, route_id = result
    
    # Get bus and route details
    bus = session.exec(select(Bus).where(Bus.id == bus_id)).first()
    route = session.exec(select(Route).where(Route.id == route_id)).first()
    
    if not bus or not route:
        raise HTTPException(status_code=500, detail="Data integrity error")
    
    # STEP 2: Calculate gamification
    has_streak = student.current_streak > 0
    points_earned = gamification.calculate_points(route_id, has_streak)
    co2_saved = gamification.calculate_co2_saved(route_id)
    
    # STEP 3: Update streak
    scan_date = scan_time.date()
    new_streak = gamification.update_streak(student.id, scan_date)
    
    # STEP 4: Store scan event
    scan_event = ScanEvent(
        student_id=student.id,
        bus_id=bus_id,
        inferred_route_id=route_id,
        scan_type=scan_request.scan_type,
        destination_stop_id=scan_request.destination_stop_id,
        client_event_id=scan_request.client_event_id,
        client_timestamp=scan_request.client_timestamp,
        scanned_at=datetime.utcnow(),
        points_awarded=points_earned,
        co2_saved_grams=co2_saved,
        latitude=scan_request.latitude,
        longitude=scan_request.longitude,
        device_hash=hashlib.md5(
            request.headers.get("user-agent", "").encode()
        ).hexdigest()[:16],
        ip_hash=hashlib.md5(
            request.client.host.encode()
        ).hexdigest()[:16]
    )
    
    try:
        session.add(scan_event)
        session.commit()
        session.refresh(scan_event)
    except Exception as e:
        # Likely duplicate client_event_id (idempotency)
        session.rollback()
        raise HTTPException(
            status_code=409,
            detail="Duplicate scan event (already processed)"
        )
    
    # STEP 5: Award points in ledger
    gamification.award_points(
        student.id,
        points_earned,
        f"Bus ride on {route.name}",
        scan_event.id
    )
    
    # STEP 6: Check for new achievements
    new_achievements = gamification.check_and_award_achievements(student.id)
    
    # STEP 7: Get updated student summary
    session.refresh(student)
    summary = gamification.get_student_summary(student.id)
    
    # STEP 8: Build instant feedback response
    student_name = f"{student.first_name} {student.last_name}" if not student.is_anonymous else None
    
    return ScanResponse(
        success=True,
        message=f"Welcome! Route detected: {route.name}",
        route_name=route.name,
        bus_number=bus.bus_number,
        points_earned=points_earned,
        co2_saved=gamification.format_co2_display(co2_saved),
        total_points=summary['total_points'],
        current_streak=summary['current_streak'],
        total_co2_display=gamification.format_co2_display(summary['total_co2_saved']),
        new_achievements=new_achievements,
        session_token=student.session_token,
        student_name=student_name
    )


# ===============================
# STUDENT ENDPOINTS
# ===============================

@app.post("/api/student/identify")
async def identify_student(
    session_token: str,
    first_name: str,
    last_name: str,
    student_id: str | None = None,
    email: str | None = None,
    session: Session = Depends(get_session)
):
    """
    Allow anonymous student to add their info (optional personalization)
    """
    student = get_student_by_token(session, session_token)
    
    if not student:
        raise HTTPException(status_code=404, detail="Session not found")
    
    student.first_name = first_name
    student.last_name = last_name
    student.student_id = student_id
    student.email = email
    student.is_anonymous = False
    
    session.commit()
    
    return {"success": True, "message": "Profile updated!"}


@app.get("/api/student/summary")
async def get_student_summary(
    session_token: str,
    session: Session = Depends(get_session)
):
    """Get student's gamification summary"""
    student = get_student_by_token(session, session_token)
    
    if not student:
        raise HTTPException(status_code=404, detail="Session not found")
    
    gamification = GamificationService(session)
    summary = gamification.get_student_summary(student.id)
    
    # Get achievements
    from sqlmodel import col
    achievements = session.exec(
        select(Achievement)
        .join(StudentAchievement, StudentAchievement.achievement_id == Achievement.id)
        .where(StudentAchievement.student_id == student.id)
    ).all()
    
    summary['achievements'] = [
        {
            'code': a.code,
            'name': a.name,
            'icon': a.icon,
            'description': a.description
        }
        for a in achievements
    ]
    
    return summary


# ===============================
# ROUTE INFO ENDPOINTS
# ===============================

@app.get("/api/routes")
async def get_routes(session: Session = Depends(get_session)):
    """Get all active routes"""
    routes = session.exec(select(Route).where(Route.is_active == True)).all()
    return routes


@app.get("/api/routes/{route_id}/stops")
async def get_route_stops(route_id: int, session: Session = Depends(get_session)):
    """Get stops for a route (for destination selector)"""
    stops = session.exec(
        select(BusStop)
        .where(BusStop.route_id == route_id)
        .order_by(BusStop.stop_order)
    ).all()
    return stops


@app.get("/api/bus/{static_qr_id}/schedule")
async def get_bus_schedule(
    static_qr_id: str,
    session: Session = Depends(get_session)
):
    """Get schedule for a bus (debugging/admin)"""
    bus = session.exec(
        select(Bus).where(Bus.static_qr_id == static_qr_id)
    ).first()
    
    if not bus:
        raise HTTPException(status_code=404, detail="Bus not found")
    
    resolver = RouteResolver(session)
    schedule = resolver.get_current_schedule(bus.id)
    
    return {
        "bus_number": bus.bus_number,
        "static_qr_id": bus.static_qr_id,
        "schedule": schedule
    }


# ===============================
# HEALTH CHECK
# ===============================

@app.get("/")
async def root():
    return {
        "app": "UIDE-Link V2",
        "version": "2.0.0",
        "mode": "Frictionless Data Collection",
        "features": [
            "Context-aware route resolution",
            "Chameleon bus support",
            "Gamification (points, streaks, CO2)",
            "Persistent sessions",
            "Offline-first ready"
        ]
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


# ===============================
# LEADERBOARD (Bonus)
# ===============================

@app.get("/api/leaderboard")
async def get_leaderboard(
    limit: int = 10,
    session: Session = Depends(get_session)
):
    """Get top students by points"""
    students = session.exec(
        select(Student)
        .where(Student.is_anonymous == False)
        .order_by(Student.total_points.desc())
        .limit(limit)
    ).all()
    
    gamification = GamificationService(session)
    
    leaderboard = []
    for i, student in enumerate(students, 1):
        summary = gamification.get_student_summary(student.id)
        leaderboard.append({
            "rank": i,
            "name": f"{student.first_name} {student.last_name}",
            "total_points": student.total_points,
            "current_streak": student.current_streak,
            "total_co2_saved": gamification.format_co2_display(student.total_co2_saved),
            "total_rides": summary['total_rides']
        })
    
    return leaderboard
