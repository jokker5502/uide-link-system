from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class QRCodeBase(BaseModel):
    id: str

class QRCode(QRCodeBase):
    schedule_id: int
    is_active: bool
    
    class Config:
        from_attributes = True

class QRCodeDetail(QRCode):
    schedule: "Schedule"
    pass

class ScanBase(BaseModel):
    qr_code_id: str
    anonymous_user_id: str
    lat: Optional[float] = None
    long: Optional[float] = None

class ScanCreate(ScanBase):
    client_timestamp: Optional[datetime] = None
    dropoff_location: Optional[str] = None

class Scan(ScanBase):
    id: int
    timestamp: datetime
    is_valid: bool
    validation_notes: Optional[str] = None

    class Config:
        from_attributes = True

class RouteBase(BaseModel):
    name: str

class Route(RouteBase):
    id: int
    
    class Config:
        from_attributes = True

class ScheduleBase(BaseModel):
    departure_time: str
    day_of_week: Optional[str] = None

class Schedule(ScheduleBase):
    id: int
    route_id: int
    
    class Config:
        from_attributes = True
