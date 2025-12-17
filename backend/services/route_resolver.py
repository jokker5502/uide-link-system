"""
Route Resolver Service
The "brain" of the chameleon bus system.
Resolves which route a bus is serving based on timestamp and schedule.
"""

from datetime import datetime, time
from typing import Optional, List, Tuple
from sqlmodel import Session, select
from models import Bus, Route, ScheduleAssignment


class RouteResolver:
    """
    Resolves route from bus scan using context-aware logic.
    
    Algorithm:
    1. Get all active schedule assignments for the bus
    2. Filter by current day of week
    3. Find assignment where scan time falls within start_time - end_time
    4. If multiple matches, use priority (higher = preferred)
    5. Return matched route_id or None
    """
    
    def __init__(self, session: Session):
        self.session = session
    
    def resolve_route_from_scan(
        self, 
        bus_id: int, 
        scan_time: datetime
    ) -> Optional[int]:
        """
        Resolve which route the bus is currently serving.
        
        Args:
            bus_id: Database ID of the bus
            scan_time: Timestamp of the scan
            
        Returns:
            route_id if match found, None otherwise
        """
        # =========================================================================
        # FIX: FORCE ENGLISH DAY NAMES (Ignora el idioma de tu PC)
        # =========================================================================
        # 0=Monday, 6=Sunday
        days_map = {0: 'Mon', 1: 'Tue', 2: 'Wed', 3: 'Thu', 4: 'Fri', 5: 'Sat', 6: 'Sun'}
        
        # Usamos .weekday() que retorna numero, y lo convertimos a texto en Ingles
        day_name = days_map[scan_time.weekday()]
        scan_time_only = scan_time.time()
        
        # DEBUG: Imprimir en consola negra para ver qué está pasando
        print(f"[RouteResolver] Checking Bus {bus_id} for Day: {day_name} at Time: {scan_time_only}")
        # =========================================================================
        
        # Query schedule assignments for this bus
        statement = select(ScheduleAssignment).where(
            ScheduleAssignment.bus_id == bus_id,
            ScheduleAssignment.is_active == True
        )
        
        assignments = self.session.exec(statement).all()
        
        if not assignments:
            print(f"[RouteResolver] No schedule assignments found for bus_id={bus_id}")
            return None
        
        # Filter by day of week and time window
        matches = []
        for assignment in assignments:
            # Check if current day is in the schedule
            # Ahora day_name siempre será 'Tue', 'Wed', etc., así que coincidirá con la BD
            if day_name not in assignment.days_of_week:
                continue
            
            # Check if scan time falls within the time window
            if self._time_in_range(
                scan_time_only, 
                assignment.start_time, 
                assignment.end_time
            ):
                matches.append(assignment)
        
        if not matches:
            print(f"[RouteResolver] No matching schedule for bus_id={bus_id} at {scan_time}")
            return None
        
        # If multiple matches, use priority
        if len(matches) > 1:
            matches.sort(key=lambda a: a.priority, reverse=True)
            print(f"[RouteResolver] Multiple matches found, using highest priority")
        
        best_match = matches[0]
        print(f"[RouteResolver] ✅ SUCCESS: Resolved bus_id={bus_id} to route_id={best_match.route_id}")
        
        return best_match.route_id
    
    def resolve_route_from_static_qr(
        self, 
        static_qr_id: str, 
        scan_time: datetime
    ) -> Optional[Tuple[int, int]]:
        """
        Resolve route from static QR code.
        
        Args:
            static_qr_id: Static QR identifier (e.g., "UIDE-BUS-05")
            scan_time: Timestamp of the scan
            
        Returns:
            Tuple of (bus_id, route_id) if found, None otherwise
        """
        # First, find the bus by static QR
        statement = select(Bus).where(
            Bus.static_qr_id == static_qr_id,
            Bus.is_active == True
        )
        
        bus = self.session.exec(statement).first()
        
        if not bus:
            print(f"[RouteResolver] Bus not found for QR: {static_qr_id}")
            return None
        
        # Now resolve the route
        route_id = self.resolve_route_from_scan(bus.id, scan_time)
        
        if route_id is None:
            return None
        
        return (bus.id, route_id)
    
    def get_route_info(self, route_id: int) -> Optional[Route]:
        """
        Get route details.
        
        Args:
            route_id: Route ID
            
        Returns:
            Route object or None
        """
        statement = select(Route).where(Route.id == route_id)
        return self.session.exec(statement).first()
    
    def _time_in_range(
        self, 
        check_time: time, 
        start_time: time, 
        end_time: time
    ) -> bool:
        """
        Check if a time falls within a range.
        
        Args:
            check_time: Time to check
            start_time: Start of range
            end_time: End of range
            
        Returns:
            True if check_time is in [start_time, end_time]
        """
        # Handle case where end_time crosses midnight
        if start_time <= end_time:
            return start_time <= check_time <= end_time
        else:
            # Range crosses midnight (e.g., 23:00 - 01:00)
            return check_time >= start_time or check_time <= end_time
    
    def get_current_schedule(self, bus_id: int) -> List[dict]:
        """
        Get all schedules for a bus (useful for debugging/admin).
        
        Args:
            bus_id: Bus ID
            
        Returns:
            List of schedule dicts with route info
        """
        statement = select(ScheduleAssignment, Route).where(
            ScheduleAssignment.bus_id == bus_id,
            ScheduleAssignment.is_active == True
        ).join(Route, ScheduleAssignment.route_id == Route.id)
        
        results = self.session.exec(statement).all()
        
        schedules = []
        for assignment, route in results:
            schedules.append({
                'route_id': route.id,
                'route_code': route.code,
                'route_name': route.name,
                'start_time': assignment.start_time.strftime('%H:%M'),
                'end_time': assignment.end_time.strftime('%H:%M'),
                'days': assignment.days_of_week,
                'priority': assignment.priority
            })
        
        return schedules


# Example usage (for testing/debugging)
if __name__ == "__main__":
    from db import get_session
    
    # Test resolver
    session = next(get_session())
    resolver = RouteResolver(session)
    
    # Test chameleon bus (BUS-05)
    test_time_morning = datetime.now().replace(hour=7, minute=30, second=0)
    test_time_midday = datetime.now().replace(hour=11, minute=30, second=0)
    
    print("Testing BUS-05 route resolution:")
    print(f"Scan at 07:30: {resolver.resolve_route_from_static_qr('UIDE-BUS-05', test_time_morning)}")
    print(f"Scan at 11:30: {resolver.resolve_route_from_static_qr('UIDE-BUS-05', test_time_midday)}")