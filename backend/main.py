from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from . import crud, models, schemas
from .database import SessionLocal, engine
from fastapi.middleware.cors import CORSMiddleware

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="UIDE Bus Tracking System")

# CORS setup for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Welcome to the UIDE Bus Tracking System API"}

@app.post("/scan", response_model=schemas.Scan)
def create_scan(scan: schemas.ScanCreate, db: Session = Depends(get_db)):
    # Verify QR code exists
    qr = crud.get_qr_code(db, qr_id=scan.qr_code_id)
    if not qr:
        # For prototype, if QR doesn't exist, we might want to fail or just log it. 
        # But per requirements, we should probably be strict.
        raise HTTPException(status_code=404, detail="QR Code not found")
    
    return crud.create_scan(db=db, scan=scan)

@app.get("/qr-codes", response_model=list[schemas.QRCodeDetail])
def read_qr_codes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    qrs = crud.get_qr_codes(db, skip=skip, limit=limit)
    return qrs

@app.get("/scans", response_model=list[schemas.Scan])
def read_scans(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_scans(db, skip=skip, limit=limit)

# Endpoint to seed data for testing
@app.post("/seed")
def seed_data(db: Session = Depends(get_db)):
    if db.query(models.Route).first():
        return {"message": "Data already seeded"}
    
    route1 = models.Route(name="Tumbaco -> UIDE", description="Morning Route")
    db.add(route1)
    db.commit()
    
    schedule1 = models.Schedule(route_id=route1.id, departure_time="10:00", day_of_week="Mon-Fri")
    db.add(schedule1)
    db.commit()
    
    qr1 = models.QRCode(id="QR-TUMBACO-1000", schedule_id=schedule1.id)
    db.add(qr1)
    db.commit()
    
    return {"message": "Seeded", "qr_code": qr1.id}
