from sqlalchemy.orm import Session
import models, schemas
from datetime import datetime, timedelta

def get_qr_code(db: Session, qr_id: str):
    return db.query(models.QRCode).filter(models.QRCode.id == qr_id).first()

def create_scan(db: Session, scan: schemas.ScanCreate):
    # Basic validation logic placeholder
    # Check for recent duplicates
    
    if scan.client_timestamp:
        current_time = scan.client_timestamp.replace(tzinfo=None)
    else:
        current_time = datetime.utcnow()

    # 5 minute window for duplicates
    time_threshold = current_time - timedelta(minutes=5)
    
    print(f"DEBUG: New Scan Time: {current_time}")
    print(f"DEBUG: Threshold: {time_threshold}")
    print(f"DEBUG: UID: {scan.anonymous_user_id}, QR: {scan.qr_code_id}")

    existing_scan = db.query(models.Scan).filter(
        models.Scan.anonymous_user_id == scan.anonymous_user_id,
        models.Scan.qr_code_id == scan.qr_code_id,
        models.Scan.timestamp >= time_threshold
    ).first()
    
    if existing_scan:
        print(f"DEBUG: Found existing scan: ID={existing_scan.id}, Time={existing_scan.timestamp}")


    is_valid = True
    notes = None

    if existing_scan:
        is_valid = False
        notes = "Duplicate scan within 5 minutes"
    
    if scan.dropoff_location:
        notes = f"{notes} | Dropoff: {scan.dropoff_location}" if notes else f"Dropoff: {scan.dropoff_location}"

    db_scan = models.Scan(
        qr_code_id=scan.qr_code_id,
        anonymous_user_id=scan.anonymous_user_id,
        lat=scan.lat,
        long=scan.long,
        timestamp=current_time,
        is_valid=is_valid,
        validation_notes=notes
    )
    db.add(db_scan)
    db.commit()
    db.refresh(db_scan)
    return db_scan

def get_qr_codes(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.QRCode).offset(skip).limit(limit).all()

def get_scans(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Scan).order_by(models.Scan.timestamp.desc()).offset(skip).limit(limit).all()
