# backend/init_real_db.py
from database import SessionLocal, engine
import models

# Crear las tablas si no existen
models.Base.metadata.create_all(bind=engine)

def init_real_data():
    db = SessionLocal()
    
    print("🧹 Limpiando base de datos antigua...")
    db.query(models.Scan).delete()
    db.query(models.QRCode).delete()
    db.query(models.Schedule).delete()
    db.query(models.Route).delete()
    db.commit()

    print("🚌 Creando Rutas Reales UIDE (Sep 2025 - Ene 2026)...")

    # Lista de Rutas extraída del PDF (Ingreso 07:00 -> Salida Bus aprox 05:30-06:00)
    rutas_data = [
        {"name": "Mitad del Mundo", "start": "05:30", "type": "Ingreso 07:00"},
        {"name": "Carcelén - Eloy Alfaro", "start": "05:45", "type": "Ingreso 07:00"},
        {"name": "San Juan de Calderón", "start": "05:40", "type": "Ingreso 07:00"},
        {"name": "Carapungo - Simón Bolívar", "start": "05:45", "type": "Ingreso 07:00"},
        {"name": "6 de Diciembre - El Ciclista", "start": "05:50", "type": "Ingreso 07:00"},
        {"name": "Galo Plaza - 10 de Agosto", "start": "05:45", "type": "Ingreso 07:00"},
        {"name": "Occidental", "start": "05:45", "type": "Ingreso 07:00"},
        {"name": "Prensa - América", "start": "05:45", "type": "Ingreso 07:00"},
        {"name": "La Granados", "start": "05:50", "type": "Ingreso 07:00"},
        {"name": "Mariscal - Napo", "start": "05:45", "type": "Ingreso 07:00"},
        {"name": "Machachi", "start": "05:45", "type": "Ingreso 07:00"},
        {"name": "Guamaní", "start": "05:45", "type": "Ingreso 07:00"},
        {"name": "Valles - Cumbayá", "start": "06:00", "type": "Ingreso 07:00"},
        {"name": "Valles - Tumbaco", "start": "05:55", "type": "Ingreso 07:00"},
        {"name": "Valles - San Rafael", "start": "06:10", "type": "Ingreso 07:00"},
        {"name": "SALIDA: Mitad del Mundo", "start": "13:30", "type": "Salida 13:30"},
        {"name": "SALIDA: Cumbayá", "start": "13:30", "type": "Salida 13:30"},
    ]

    count = 0
    for r in rutas_data:
        # 1. Crear Ruta
        route = models.Route(name=f"{r['name']} ({r['type']})", description="Ruta Oficial UIDE")
        db.add(route)
        db.commit()
        db.refresh(route)

        # 2. Crear Horario
        schedule = models.Schedule(
            route_id=route.id,
            departure_time=r['start'],
            day_of_week="Lun-Vie"
        )
        db.add(schedule)
        db.commit()
        db.refresh(schedule)

        # 3. Crear QR Code
        # Generamos un ID legible: QR-MITADDELMUNDO-0530
        clean_name = r['name'].replace(" ", "").upper()[:10]
        clean_time = r['start'].replace(":", "")
        qr_id = f"QR-{clean_name}-{clean_time}"
        
        qr = models.QRCode(id=qr_id, schedule_id=schedule.id, is_active=True)
        db.add(qr)
        count += 1
    
    db.commit()
    print(f"✅ ¡Éxito! Se crearon {count} rutas reales con sus códigos QR.")
    db.close()

if __name__ == "__main__":
    init_real_data()