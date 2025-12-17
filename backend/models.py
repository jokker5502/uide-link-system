from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True) # e.g., "Tumbaco -> UIDE"
    description = Column(String, nullable=True)

    schedules = relationship("Schedule", back_populates="route")

class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, ForeignKey("routes.id"))
    departure_time = Column(String) # e.g., "10:00"
    day_of_week = Column(String, nullable=True) # e.g., "Monday" or "All"
    
    route = relationship("Route", back_populates="schedules")
    qr_codes = relationship("QRCode", back_populates="schedule")

class QRCode(Base):
    __tablename__ = "qr_codes"

    id = Column(String, primary_key=True, index=True) # UUID or specific code string
    schedule_id = Column(Integer, ForeignKey("schedules.id"))
    is_active = Column(Boolean, default=True)

    schedule = relationship("Schedule", back_populates="qr_codes")
    scans = relationship("Scan", back_populates="qr_code")

class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    qr_code_id = Column(String, ForeignKey("qr_codes.id"))
    anonymous_user_id = Column(String, index=True) # UUID from client
    timestamp = Column(DateTime, default=datetime.utcnow)
    lat = Column(Float, nullable=True)
    long = Column(Float, nullable=True)
    is_valid = Column(Boolean, default=True)
    validation_notes = Column(String, nullable=True) # e.g., "Too far", "Duplicate"

    qr_code = relationship("QRCode", back_populates="scans")
