"""
UIDE-Link - Script de Gestión de Base de Datos
Ejecuta este script para gestionar la base de datos fácilmente
"""

import os
import sys
from database import engine, SessionLocal
import models
from sqlalchemy import inspect

def check_db_exists():
    """Verifica si la base de datos existe"""
    db_file = "sql_app.db"
    return os.path.exists(db_file)

def check_tables_exist():
    """Verifica si las tablas existen en la base de datos"""
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    expected_tables = ['routes', 'schedules', 'qr_codes', 'scans']
    return all(table in tables for table in expected_tables)

def create_tables():
    """Crea todas las tablas en la base de datos"""
    print("📊 Creando tablas en la base de datos...")
    models.Base.metadata.create_all(bind=engine)
    print("✅ Tablas creadas exitosamente!")
    
def drop_all_tables():
    """Elimina todas las tablas (¡CUIDADO! Borra todos los datos)"""
    confirm = input("⚠️  ¿Estás SEGURO que quieres borrar TODAS las tablas? (escribe 'SI' para confirmar): ")
    if confirm.upper() == 'SI':
        print("🗑️  Eliminando todas las tablas...")
        models.Base.metadata.drop_all(bind=engine)
        print("✅ Tablas eliminadas!")
    else:
        print("❌ Operación cancelada.")

def seed_data():
    """Carga datos de prueba en la base de datos"""
    db = SessionLocal()
    
    try:
        # Verificar si ya hay datos
        if db.query(models.Route).first():
            print("⚠️  Ya hay datos en la base de datos.")
            overwrite = input("¿Quieres agregar más datos de prueba? (s/n): ")
            if overwrite.lower() != 's':
                print("❌ Operación cancelada.")
                return
        
        print("🌱 Cargando datos de prueba...")
        
        # Crear ruta 1: Tumbaco -> UIDE
        route1 = models.Route(
            name="Tumbaco -> UIDE",
            description="Ruta desde Tumbaco hacia campus UIDE"
        )
        db.add(route1)
        db.commit()
        db.refresh(route1)
        
        # Crear horario para ruta 1
        schedule1 = models.Schedule(
            route_id=route1.id,
            departure_time="10:00",
            day_of_week="Mon-Fri"
        )
        db.add(schedule1)
        db.commit()
        db.refresh(schedule1)
        
        # Crear QR para horario 1
        qr1 = models.QRCode(
            id="QR-TUMBACO-1000",
            schedule_id=schedule1.id,
            is_active=True
        )
        db.add(qr1)
        db.commit()
        
        # Crear ruta 2: Cumbayá -> UIDE
        route2 = models.Route(
            name="Cumbayá -> UIDE",
            description="Ruta desde Cumbayá hacia campus UIDE"
        )
        db.add(route2)
        db.commit()
        db.refresh(route2)
        
        # Crear horario para ruta 2
        schedule2 = models.Schedule(
            route_id=route2.id,
            departure_time="11:30",
            day_of_week="Mon-Fri"
        )
        db.add(schedule2)
        db.commit()
        db.refresh(schedule2)
        
        # Crear QR para horario 2
        qr2 = models.QRCode(
            id="QR-CUMBAYA-1130",
            schedule_id=schedule2.id,
            is_active=True
        )
        db.add(qr2)
        db.commit()
        
        # Crear ruta 3: Quito Centro -> UIDE
        route3 = models.Route(
            name="Quito Centro -> UIDE",
            description="Ruta desde el centro de Quito hacia campus UIDE"
        )
        db.add(route3)
        db.commit()
        db.refresh(route3)
        
        # Crear horario para ruta 3
        schedule3 = models.Schedule(
            route_id=route3.id,
            departure_time="09:00",
            day_of_week="Mon-Fri"
        )
        db.add(schedule3)
        db.commit()
        db.refresh(schedule3)
        
        # Crear QR para horario 3
        qr3 = models.QRCode(
            id="QR-CENTRO-0900",
            schedule_id=schedule3.id,
            is_active=True
        )
        db.add(qr3)
        db.commit()
        
        print("✅ Datos de prueba cargados exitosamente!")
        print(f"\n📋 Rutas creadas:")
        print(f"  - {route1.name} (QR: QR-TUMBACO-1000)")
        print(f"  - {route2.name} (QR: QR-CUMBAYA-1130)")
        print(f"  - {route3.name} (QR: QR-CENTRO-0900)")
        
    except Exception as e:
        print(f"❌ Error al cargar datos: {e}")
        db.rollback()
    finally:
        db.close()

def show_stats():
    """Muestra estadísticas de la base de datos"""
    db = SessionLocal()
    
    try:
        routes_count = db.query(models.Route).count()
        schedules_count = db.query(models.Schedule).count()
        qr_count = db.query(models.QRCode).count()
        scans_count = db.query(models.Scan).count()
        
        print("\n📊 ESTADÍSTICAS DE LA BASE DE DATOS")
        print("=" * 40)
        print(f"📍 Rutas:       {routes_count}")
        print(f"🕒 Horarios:    {schedules_count}")
        print(f"📱 QR Codes:    {qr_count}")
        print(f"🚌 Escaneos:    {scans_count}")
        print("=" * 40)
        
        if routes_count > 0:
            print("\n🗺️  RUTAS DISPONIBLES:")
            routes = db.query(models.Route).all()
            for route in routes:
                print(f"  - {route.name}")
                for schedule in route.schedules:
                    for qr in schedule.qr_codes:
                        print(f"    └─ {qr.id} ({schedule.departure_time}, {schedule.day_of_week})")
        
        if scans_count > 0:
            print(f"\n📈 ÚLTIMOS 5 ESCANEOS:")
            scans = db.query(models.Scan).order_by(models.Scan.timestamp.desc()).limit(5).all()
            for scan in scans:
                status = "✅ Válido" if scan.is_valid else "❌ Inválido"
                print(f"  - {scan.qr_code_id} - {scan.timestamp.strftime('%Y-%m-%d %H:%M:%S')} - {status}")
        
    except Exception as e:
        print(f"❌ Error al obtener estadísticas: {e}")
    finally:
        db.close()

def reset_database():
    """Resetea completamente la base de datos (borra y recrea)"""
    print("\n⚠️  RESETEAR BASE DE DATOS")
    print("=" * 40)
    print("Esto va a:")
    print("  1. Eliminar todas las tablas")
    print("  2. Recrear las tablas vacías")
    print("  3. Opcionalmente cargar datos de prueba")
    print("=" * 40)
    
    confirm = input("\n¿Continuar? (escribe 'SI' para confirmar): ")
    if confirm.upper() != 'SI':
        print("❌ Operación cancelada.")
        return
    
    # Eliminar tablas
    print("\n🗑️  Eliminando tablas...")
    models.Base.metadata.drop_all(bind=engine)
    
    # Recrear tablas
    print("📊 Recreando tablas...")
    models.Base.metadata.create_all(bind=engine)
    
    print("✅ Base de datos reseteada!")
    
    # Preguntar si quiere cargar datos de prueba
    load_data = input("\n¿Cargar datos de prueba? (s/n): ")
    if load_data.lower() == 's':
        seed_data()

def menu():
    """Muestra el menú principal"""
    while True:
        print("\n" + "="*50)
        print("🗄️  GESTIÓN DE BASE DE DATOS - UIDE-LINK")
        print("="*50)
        
        # Estado de la base de datos
        if check_db_exists():
            if check_tables_exist():
                print("✅ Estado: Base de datos configurada correctamente")
            else:
                print("⚠️  Estado: Base de datos existe pero faltan tablas")
        else:
            print("❌ Estado: Base de datos no existe")
        
        print("\nOPCIONES:")
        print("1. 📊 Crear tablas")
        print("2. 🌱 Cargar datos de prueba")
        print("3. 📈 Ver estadísticas")
        print("4. 🔄 Resetear base de datos (borrar todo)")
        print("5. 🗑️  Eliminar todas las tablas")
        print("0. 🚪 Salir")
        
        choice = input("\nElige una opción: ").strip()
        
        if choice == '1':
            create_tables()
        elif choice == '2':
            seed_data()
        elif choice == '3':
            show_stats()
        elif choice == '4':
            reset_database()
        elif choice == '5':
            drop_all_tables()
        elif choice == '0':
            print("\n👋 ¡Hasta luego!")
            break
        else:
            print("❌ Opción inválida")

if __name__ == "__main__":
    print("\n🚀 UIDE-Link - Gestión de Base de Datos")
    print("=" * 50)
    
    try:
        menu()
    except KeyboardInterrupt:
        print("\n\n👋 ¡Operación cancelada por el usuario!")
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")
        sys.exit(1)
