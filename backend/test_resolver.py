"""
Quick test/demo script for the Chameleon Bus resolver
Run this to verify route resolution logic works correctly
"""

from datetime import datetime, time as time_obj
from services.route_resolver import RouteResolver
from services.gamification import GamificationService
from db import get_session


def test_chameleon_bus():
    """Test BUS-05 route resolution at different times"""
    
    print("=" * 60)
    print("CHAMELEON BUS ROUTE RESOLVER TEST")
    print("=" * 60)
    
    session = next(get_session())
    resolver = RouteResolver(session)
    gamification = GamificationService(session)
    
    # Test scenarios
    test_times = [
        ("07:30", "Should resolve to ARMENIA"),
        ("11:15", "Should resolve to VALLE"),
        ("16:30", "Should resolve to CENTRO"),
        ("14:00", "Should return None (no schedule)"),
    ]
    
    print("\n🚌 Testing BUS-05 (The Chameleon Bus):")
    print("-" * 60)
    
    for time_str, expected in test_times:
        hour, minute = map(int, time_str.split(':'))
        test_datetime = datetime.now().replace(hour=hour, minute=minute, second=0)
        
        result = resolver.resolve_route_from_static_qr('UIDE-BUS-05', test_datetime)
        
        if result:
            bus_id, route_id = result
            route = resolver.get_route_info(route_id)
            
            print(f"\n⏰ Scan at {time_str}:")
            print(f"   ✓ Route: {route.code} - {route.name}")
            print(f"   ✓ Distance: {route.distance_km} km")
            
            # Calculate points and CO2
            points = gamification.calculate_points(route_id, has_active_streak=False)
            co2 = gamification.calculate_co2_saved(route_id)
            
            print(f"   💰 Points: {points}")
            print(f"   🌱 CO2 Saved: {gamification.format_co2_display(co2)}")
            print(f"   📝 Expected: {expected}")
        else:
            print(f"\n⏰ Scan at {time_str}:")
            print(f"   ✗ No route found")
            print(f"   📝 Expected: {expected}")
    
    print("\n" + "=" * 60)
    print("TEST COMPLETE")
    print("=" * 60)


def show_bus_schedule():
    """Display full schedule for BUS-05"""
    
    session = next(get_session())
    resolver = RouteResolver(session)
    
    # Get bus ID first
    from sqlmodel import select
    from models import Bus
    
    bus = session.exec(
        select(Bus).where(Bus.static_qr_id == 'UIDE-BUS-05')
    ).first()
    
    if not bus:
        print("❌ BUS-05 not found in database")
        return
    
    print("\n📅 SCHEDULE FOR BUS-05:")
    print("-" * 60)
    
    schedule = resolver.get_current_schedule(bus.id)
    
    for entry in schedule:
        print(f"\n🚏 {entry['route_code']} - {entry['route_name']}")
        print(f"   Time: {entry['start_time']} - {entry['end_time']}")
        print(f"   Days: {', '.join(entry['days'])}")
        print(f"   Priority: {entry['priority']}")


if __name__ == "__main__":
    print("\n")
    show_bus_schedule()
    print("\n")
    test_chameleon_bus()
