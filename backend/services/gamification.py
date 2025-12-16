"""
Gamification Service
Handles points, streaks, CO2 calculations, and achievements.
"""

from datetime import datetime, date, timedelta
from typing import Optional, Tuple
from sqlmodel import Session, select, func
from models import Student, Route, ScanEvent, UserPoint, Achievement, StudentAchievement


class GamificationService:
    """
    Manages gamification logic for the frictionless system.
    """
    
    # Constants for calculations
    POINTS_PER_KM = 10  # Base points per kilometer
    STREAK_BONUS_MULTIPLIER = 1.2  # 20% bonus for active streaks
    CO2_PER_KM = 50  # Grams of CO2 saved per km (vs driving)
    
    def __init__(self, session: Session):
        self.session = session
    
    def calculate_points(
        self, 
        route_id: int, 
        has_active_streak: bool = False
    ) -> int:
        """
        Calculate points for a bus ride.
        
        Args:
            route_id: Route being traveled
            has_active_streak: Whether student has an active streak
            
        Returns:
            Points to award
        """
        # Get route distance
        route = self.session.exec(
            select(Route).where(Route.id == route_id)
        ).first()
        
        if not route or not route.distance_km:
            # Default points if no distance data
            return 10
        
        # Base points
        points = int(route.distance_km * self.POINTS_PER_KM)
        
        # Streak bonus
        if has_active_streak:
            points = int(points * self.STREAK_BONUS_MULTIPLIER)
        
        return max(1, points)  # Minimum 1 point
    
    def calculate_co2_saved(self, route_id: int) -> float:
        """
        Calculate CO2 saved for a bus ride.
        
        Args:
            route_id: Route being traveled
            
        Returns:
            CO2 saved in grams
        """
        route = self.session.exec(
            select(Route).where(Route.id == route_id)
        ).first()
        
        if not route or not route.distance_km:
            return 0.0
        
        # Calculate CO2 saved (grams)
        co2_grams = float(route.distance_km) * self.CO2_PER_KM
        
        return round(co2_grams, 2)
    
    def update_streak(self, student_id: int, scan_date: date) -> int:
        """
        Update student's streak based on new scan.
        
        Args:
            student_id: Student ID
            scan_date: Date of the scan
            
        Returns:
            New streak count
        """
        student = self.session.exec(
            select(Student).where(Student.id == student_id)
        ).first()
        
        if not student:
            return 0
        
        # If first scan ever
        if student.last_scan_date is None:
            student.current_streak = 1
            student.last_scan_date = scan_date
            self.session.commit()
            return 1
        
        # Calculate days since last scan
        days_diff = (scan_date - student.last_scan_date).days
        
        if days_diff == 0:
            # Same day - no streak change
            return student.current_streak
        elif days_diff == 1:
            # Consecutive day - increment streak
            student.current_streak += 1
            student.last_scan_date = scan_date
        else:
            # Streak broken - reset to 1
            student.current_streak = 1
            student.last_scan_date = scan_date
        
        self.session.commit()
        return student.current_streak
    
    def award_points(
        self, 
        student_id: int, 
        points: int, 
        reason: str,
        scan_id: Optional[int] = None
    ) -> None:
        """
        Award points to a student and log in ledger.
        
        Args:
            student_id: Student ID
            points: Points to award
            reason: Reason for points
            scan_id: Optional scan event ID
        """
        # Add to ledger
        user_point = UserPoint(
            student_id=student_id,
            scan_id=scan_id,
            points=points,
            reason=reason
        )
        self.session.add(user_point)
        self.session.commit()
    
    def check_and_award_achievements(self, student_id: int) -> list:
        """
        Check if student has earned any new achievements.
        
        Args:
            student_id: Student ID
            
        Returns:
            List of newly earned achievement codes
        """
        student = self.session.exec(
            select(Student).where(Student.id == student_id)
        ).first()
        
        if not student:
            return []
        
        # Get all achievements
        achievements = self.session.exec(select(Achievement)).all()
        
        # Get already earned achievements
        earned_ids = set(
            r[0] for r in self.session.exec(
                select(StudentAchievement.achievement_id).where(
                    StudentAchievement.student_id == student_id
                )
            ).all()
        )
        
        newly_earned = []
        
        for achievement in achievements:
            # Skip if already earned
            if achievement.id in earned_ids:
                continue
            
            # Check conditions
            earned = False
            
            if achievement.code == 'FIRST_RIDE':
                # Check if student has any scans
                scan_count = self.session.exec(
                    select(func.count(ScanEvent.id)).where(
                        ScanEvent.student_id == student_id
                    )
                ).one()
                earned = scan_count >= 1
            
            elif achievement.code == 'WEEK_WARRIOR':
                earned = student.current_streak >= 7
            
            elif achievement.code == 'ECO_HERO':
                earned = student.total_co2_saved >= 10000  # 10kg
            
            elif achievement.code == 'CENTURY':
                earned = student.total_points >= 100
            
            elif achievement.code == 'EXPLORER':
                # Check unique routes used
                unique_routes = self.session.exec(
                    select(func.count(func.distinct(ScanEvent.inferred_route_id))).where(
                        ScanEvent.student_id == student_id
                    )
                ).one()
                earned = unique_routes >= 4
            
            # Award if earned
            if earned:
                student_achievement = StudentAchievement(
                    student_id=student_id,
                    achievement_id=achievement.id
                )
                self.session.add(student_achievement)
                newly_earned.append(achievement.code)
        
        if newly_earned:
            self.session.commit()
        
        return newly_earned
    
    def get_student_summary(self, student_id: int) -> dict:
        """
        Get gamification summary for a student.
        
        Args:
            student_id: Student ID
            
        Returns:
            Dict with points, streak, CO2, achievements
        """
        student = self.session.exec(
            select(Student).where(Student.id == student_id)
        ).first()
        
        if not student:
            return {}
        
        # Get achievement count
        achievement_count = self.session.exec(
            select(func.count(StudentAchievement.id)).where(
                StudentAchievement.student_id == student_id
            )
        ).one()
        
        # Get total rides
        ride_count = self.session.exec(
            select(func.count(ScanEvent.id)).where(
                ScanEvent.student_id == student_id
            )
        ).one()
        
        return {
            'total_points': student.total_points,
            'current_streak': student.current_streak,
            'total_co2_saved': float(student.total_co2_saved),
            'achievement_count': achievement_count,
            'total_rides': ride_count,
            'last_scan_date': student.last_scan_date.isoformat() if student.last_scan_date else None
        }
    
    def format_co2_display(self, co2_grams: float) -> str:
        """
        Format CO2 for user display.
        
        Args:
            co2_grams: CO2 in grams
            
        Returns:
            Formatted string (e.g., "1.2kg" or "350g")
        """
        if co2_grams >= 1000:
            return f"{co2_grams / 1000:.1f}kg"
        else:
            return f"{int(co2_grams)}g"


# Testing
if __name__ == "__main__":
    from db import get_session
    
    session = next(get_session())
    gamification = GamificationService(session)
    
    # Test calculations
    print("Testing gamification:")
    print(f"Points for route 1: {gamification.calculate_points(1)}")
    print(f"CO2 saved for route 1: {gamification.calculate_co2_saved(1)}")
