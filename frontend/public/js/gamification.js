/**
 * Gamification Frontend Module
 * Handles points display, animations, and streak tracking
 */

class GamificationUI {
    constructor() {
        this.animationQueue = [];
    }

    /**
     * Update gamification header display
     */
    updateDisplay(data) {
        const {
            total_points = 0,
            current_streak = 0,
            total_co2_saved = 0,
            total_co2_display = '0g'
        } = data;

        // Update points
        const pointsEl = document.getElementById('totalPoints');
        if (pointsEl) {
            this.animateNumber(pointsEl, parseInt(pointsEl.textContent) || 0, total_points);
        }

        // Update streak
        const streakEl = document.getElementById('currentStreak');
        if (streakEl) {
            streakEl.textContent = current_streak;

            // Add flame effect for high streaks
            if (current_streak >= 7) {
                streakEl.classList.add('fire-streak');
            }
        }

        // Update CO2
        const co2El = document.getElementById('totalCO2');
        if (co2El) {
            co2El.textContent = total_co2_display;
        }
    }

    /**
     * Show points earned animation
     */
    showPointsAnimation(pointsEarned, co2Earned, routeName) {
        // Create floating animation overlay
        const overlay = document.createElement('div');
        overlay.className = 'points-animation-overlay';
        overlay.innerHTML = `
            <div class="points-animation-card">
                <div class="success-icon">✓</div>
                <h2 class="route-detected">${routeName}</h2>
                <div class="points-earned">
                    <span class="points-value">+${pointsEarned}</span>
                    <span class="points-label">points</span>
                </div>
                <div class="co2-earned">
                    <span class="eco-icon">🌱</span>
                    <span class="co2-value">${co2Earned}</span>
                    <span class="co2-label">CO₂ saved</span>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Auto-remove after animation
        setTimeout(() => {
            overlay.classList.add('fade-out');
            setTimeout(() => overlay.remove(), 500);
        }, 3000);

        // Trigger vibration
        if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100, 50, 200]);
        }
    }

    /**
     * Show achievement badge
     */
    showAchievementBadge(achievement) {
        const badge = document.createElement('div');
        badge.className = 'achievement-notification';
        badge.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">${achievement.icon || '🏆'}</div>
                <div class="achievement-text">
                    <div class="achievement-title">Achievement Unlocked!</div>
                    <div class="achievement-name">${achievement.name}</div>
                </div>
            </div>
        `;

        document.body.appendChild(badge);

        // Celebrate!
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200, 100, 300]);
        }

        // Auto-remove
        setTimeout(() => {
            badge.classList.add('fade-out');
            setTimeout(() => badge.remove(), 500);
        }, 4000);
    }

    /**
     * Animate number change
     */
    animateNumber(element, from, to, duration = 1000) {
        const start = Date.now();
        const diff = to - from;

        const step = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(from + diff * easeOut);

            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };

        requestAnimationFrame(step);
    }

    /**
     * Show streak milestone celebration
     */
    showStreakMilestone(streak) {
        if (streak % 7 === 0 && streak > 0) {
            // Weekly milestone
            this.showAchievementBadge({
                icon: '🔥',
                name: `${streak} Day Streak!`,
                description: 'You\'re on fire!'
            });
        }
    }

    /**
     * Format CO2 for display
     */
    formatCO2(grams) {
        if (grams >= 1000) {
            return `${(grams / 1000).toFixed(1)}kg`;
        }
        return `${Math.round(grams)}g`;
    }

    /**
     * Get streak emoji based on count
     */
    getStreakEmoji(streak) {
        if (streak >= 30) return '🔥🔥🔥';
        if (streak >= 14) return '🔥🔥';
        if (streak >= 7) return '🔥';
        return '⚡';
    }

    /**
     * Show welcome message with student name
     */
    showWelcome(studentName, routeName) {
        const welcomeEl = document.getElementById('welcomeMessage');
        if (welcomeEl && studentName) {
            welcomeEl.innerHTML = `
                <span class="wave-emoji">👋</span>
                <span>Hola, ${studentName}!</span>
            `;
        }
    }

    /**
     * Update progress to next achievement
     */
    updateProgressBar(currentPoints, nextMilestone = 100) {
        const progressEl = document.getElementById('achievementProgress');
        if (progressEl) {
            const progress = Math.min((currentPoints / nextMilestone) * 100, 100);
            progressEl.style.width = `${progress}%`;

            const labelEl = document.getElementById('progressLabel');
            if (labelEl) {
                labelEl.textContent = `${currentPoints} / ${nextMilestone} pts to next badge`;
            }
        }
    }
}

// Export singleton
const GamificationUI_Instance = new GamificationUI();
window.GamificationUI = GamificationUI_Instance;
