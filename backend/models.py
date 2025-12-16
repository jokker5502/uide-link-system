"""
SQLModel Models for UIDE-Link V2
Frictionless Data Collection System
"""

from typing import Optional, List
import uuid
from datetime import datetime, date, time
from enum import Enum
from sqlmodel import SQLModel, Field, Column, ARRAY, String
from sqlalchemy import UniqueConstraint


# ===============================
# ENUMS
# ===============================

class ScanType(str, Enum):
    ENTRY = "ENTRY"
    EXIT = "EXIT"


class DayOfWeek(str, Enum):
    Mon = "Mon"
    Tue = "Tue"
    Wed = "Wed"
    Thu = "Thu"
    Fri = "Fri"
    Sat = "Sat"
    Sun = "Sun"


# ===============================
# CORE MODELS
# ===============================

class Route(SQLModel, table=True):
    __tablename__ = "routes"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    code: str = Field(unique=True, index=True)
    name: str
    description: Optional[str] = None
    distance_km: Optional[float] = None  # For gamification
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Bus(SQLModel, table=True):
    __tablename__ = "buses"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    bus_number: str = Field(unique=True, index=True)
    license_plate: Optional[str] = Field(default=None, unique=True)
    capacity: Optional[int] = None
    
    # Static QR ID (one per bus, serves multiple routes)
    static_qr_id: str = Field(unique=True, index=True)
    
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class BusStop(SQLModel, table=True):
    __tablename__ = "bus_stops"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    route_id: int = Field(foreign_key="routes.id")
    name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    stop_order: int  # Order in the route
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ScheduleAssignment(SQLModel, table=True):
    """
    The heart of the Chameleon Bus system.
    Maps bus_id to route_id with time windows.
    """
    __tablename__ = "schedule_assignments"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    bus_id: int = Field(foreign_key="buses.id")
    route_id: int = Field(foreign_key="routes.id")
    
    start_time: time
    end_time: time
    
    # SQL Array of day_of_week enums
    days_of_week: List[str] = Field(sa_column=Column(ARRAY(String)))
    
    priority: int = Field(default=0)  # Higher = preferred if overlap
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ===============================
# STUDENT & GAMIFICATION
# ===============================

class Student(SQLModel, table=True):
    __tablename__ = "students"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: Optional[str] = Field(default=None, unique=True)
    email: Optional[str] = Field(default=None, unique=True, index=True)
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    
    # Gamification totals (cached)
    total_points: int = Field(default=0)
    current_streak: int = Field(default=0)
    last_scan_date: Optional[date] = None
    total_co2_saved: float = Field(default=0.0)  # grams
    
    is_anonymous: bool = Field(default=True)
    
    # Persistent session
    session_token: Optional[str] = Field(default=None, index=True)
    token_expires: Optional[datetime] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ScanEvent(SQLModel, table=True):
    __tablename__ = "scan_events"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    
    student_id: Optional[int] = Field(default=None, foreign_key="students.id")
    bus_id: int = Field(foreign_key="buses.id")
    
    # Route inferred by server via RouteResolver
    inferred_route_id: Optional[int] = Field(default=None, foreign_key="routes.id")
    
    scan_type: ScanType
    
    # Optional destination (student taps their stop)
    destination_stop_id: Optional[int] = Field(default=None, foreign_key="bus_stops.id")
    
    # Timestamps
    scanned_at: datetime = Field(default_factory=datetime.utcnow)
    client_timestamp: Optional[datetime] = None
    
    # Idempotency
    client_event_id: uuid.UUID = Field(unique=True, index=True)
    
    # Gamification
    points_awarded: int = Field(default=0)
    co2_saved_grams: float = Field(default=0.0)
    
    # Metadata
    device_hash: Optional[str] = None
    ip_hash: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)


class UserPoint(SQLModel, table=True):
    __tablename__ = "user_points"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="students.id")
    scan_id: Optional[int] = Field(default=None, foreign_key="scan_events.id")
    
    points: int
    reason: Optional[str] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Achievement(SQLModel, table=True):
    __tablename__ = "achievements"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    code: str = Field(unique=True, index=True)
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None  # Emoji or icon identifier
    threshold: Optional[int] = None  # Points/rides required
    created_at: datetime = Field(default_factory=datetime.utcnow)


class StudentAchievement(SQLModel, table=True):
    __tablename__ = "student_achievements"
    __table_args__ = (UniqueConstraint("student_id", "achievement_id"),)
    
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="students.id")
    achievement_id: int = Field(foreign_key="achievements.id")
    earned_at: datetime = Field(default_factory=datetime.utcnow)


class DailyStats(SQLModel, table=True):
    """Aggregated stats for dashboards"""
    __tablename__ = "daily_stats"
    __table_args__ = (UniqueConstraint("date", "route_id", "bus_id"),)
    
    id: Optional[int] = Field(default=None, primary_key=True)
    date: date
    route_id: Optional[int] = Field(default=None, foreign_key="routes.id")
    bus_id: Optional[int] = Field(default=None, foreign_key="buses.id")
    
    total_scans: int = Field(default=0)
    unique_students: int = Field(default=0)
    total_points: int = Field(default=0)
    total_co2_saved: float = Field(default=0.0)
    
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ===============================
# REQUEST/RESPONSE SCHEMAS
# ===============================

class ScanRequest(SQLModel):
    """Request payload for scan endpoint"""
    static_qr_id: str
    scan_type: ScanType
    client_event_id: uuid.UUID
    client_timestamp: Optional[datetime] = None
    destination_stop_id: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    session_token: Optional[str] = None  # For identified scans


class ScanResponse(SQLModel):
    """Response payload with instant feedback"""
    success: bool
    message: str
    
    # Instant feedback data
    route_name: Optional[str] = None
    bus_number: Optional[str] = None
    points_earned: int = 0
    co2_saved: str = "0g"
    
    # Student data
    total_points: int = 0
    current_streak: int = 0
    total_co2_display: str = "0g"
    
    # Achievements (if any new ones)
    new_achievements: List[str] = []
    
    # Session info
    session_token: Optional[str] = None
    student_name: Optional[str] = None
