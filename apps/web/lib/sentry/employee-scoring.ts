/**
 * Vajra Sentry - Employee Security Scoring
 * 
 * Gamified security scoring system for employees
 * Features:
 * - Multi-factor security score
 * - Leaderboards
 * - Achievements/badges
 * - Training progress tracking
 */

export interface EmployeeSecurityScore {
    employeeId: string;
    email: string;
    name: string;
    department: string;

    // Overall score
    overallScore: number;         // 0-100
    previousScore: number;
    scoreChange: number;
    percentile: number;           // Top X%
    rank: number;

    // Score components
    components: {
        phishingResistance: ComponentScore;
        trainingCompletion: ComponentScore;
        reportingBehavior: ComponentScore;
        passwordHygiene: ComponentScore;
        mfaCompliance: ComponentScore;
        dataHandling: ComponentScore;
    };

    // Streak tracking
    streak: {
        currentDays: number;        // Days without security incident
        longestStreak: number;
        lastIncidentDate?: Date;
    };

    // Achievements
    achievements: Achievement[];

    // History
    scoreHistory: ScoreHistoryEntry[];

    lastUpdated: Date;
}

export interface ComponentScore {
    score: number;                // 0-100
    weight: number;               // Component weight
    trend: 'improving' | 'stable' | 'declining';
    lastEvent?: Date;
    details: string;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'phishing' | 'training' | 'reporting' | 'streak' | 'special';
    earnedAt: Date;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface ScoreHistoryEntry {
    date: Date;
    score: number;
    change: number;
    reason: string;
}

export interface SecurityEvent {
    type: 'phishing_click' | 'phishing_report' | 'training_complete' | 'password_change' |
    'mfa_enable' | 'policy_violation' | 'data_leak' | 'suspicious_report';
    employeeId: string;
    timestamp: Date;
    impact: number;               // Points to add/subtract
    details?: string;
}

// Achievement definitions
const ACHIEVEMENTS: Record<string, Omit<Achievement, 'id' | 'earnedAt'>> = {
    // Phishing achievements
    phish_spotter: {
        name: 'Phish Spotter',
        description: 'Reported your first phishing email',
        icon: '🎣',
        category: 'phishing',
        rarity: 'common',
    },
    phish_hunter: {
        name: 'Phish Hunter',
        description: 'Reported 10 phishing emails',
        icon: '🏆',
        category: 'phishing',
        rarity: 'uncommon',
    },
    phish_master: {
        name: 'Phish Master',
        description: 'Never clicked a phishing link in 50 simulations',
        icon: '🛡️',
        category: 'phishing',
        rarity: 'legendary',
    },

    // Training achievements
    first_lesson: {
        name: 'First Lesson',
        description: 'Completed your first training module',
        icon: '📚',
        category: 'training',
        rarity: 'common',
    },
    knowledge_seeker: {
        name: 'Knowledge Seeker',
        description: 'Completed 5 training modules',
        icon: '🎓',
        category: 'training',
        rarity: 'uncommon',
    },
    security_expert: {
        name: 'Security Expert',
        description: 'Completed all available training modules',
        icon: '🏅',
        category: 'training',
        rarity: 'epic',
    },
    perfect_score: {
        name: 'Perfect Score',
        description: 'Scored 100% on a training quiz',
        icon: '💯',
        category: 'training',
        rarity: 'rare',
    },

    // Streak achievements
    week_warrior: {
        name: 'Week Warrior',
        description: '7-day security streak',
        icon: '⭐',
        category: 'streak',
        rarity: 'common',
    },
    month_master: {
        name: 'Month Master',
        description: '30-day security streak',
        icon: '🌟',
        category: 'streak',
        rarity: 'rare',
    },
    year_legend: {
        name: 'Year Legend',
        description: '365-day security streak',
        icon: '👑',
        category: 'streak',
        rarity: 'legendary',
    },

    // Special achievements
    early_adopter: {
        name: 'Early Adopter',
        description: 'Among the first to complete security training',
        icon: '🚀',
        category: 'special',
        rarity: 'epic',
    },
    team_player: {
        name: 'Team Player',
        description: 'Helped a colleague identify a phishing attempt',
        icon: '🤝',
        category: 'special',
        rarity: 'uncommon',
    },
};

// Component weights (must sum to 1.0)
const COMPONENT_WEIGHTS = {
    phishingResistance: 0.25,
    trainingCompletion: 0.20,
    reportingBehavior: 0.15,
    passwordHygiene: 0.15,
    mfaCompliance: 0.15,
    dataHandling: 0.10,
};

/**
 * Employee Security Score Manager
 */
export class EmployeeScoreManager {
    private scores = new Map<string, EmployeeSecurityScore>();
    private events: SecurityEvent[] = [];

    /**
     * Initialize score for new employee
     */
    initializeEmployee(employee: {
        id: string;
        email: string;
        name: string;
        department: string;
    }): EmployeeSecurityScore {
        const baseScore = 70; // Starting score

        const score: EmployeeSecurityScore = {
            employeeId: employee.id,
            email: employee.email,
            name: employee.name,
            department: employee.department,
            overallScore: baseScore,
            previousScore: baseScore,
            scoreChange: 0,
            percentile: 50,
            rank: 0,
            components: {
                phishingResistance: this.createComponentScore(baseScore, COMPONENT_WEIGHTS.phishingResistance),
                trainingCompletion: this.createComponentScore(0, COMPONENT_WEIGHTS.trainingCompletion), // No training yet
                reportingBehavior: this.createComponentScore(baseScore, COMPONENT_WEIGHTS.reportingBehavior),
                passwordHygiene: this.createComponentScore(baseScore, COMPONENT_WEIGHTS.passwordHygiene),
                mfaCompliance: this.createComponentScore(0, COMPONENT_WEIGHTS.mfaCompliance), // Need to check MFA
                dataHandling: this.createComponentScore(baseScore, COMPONENT_WEIGHTS.dataHandling),
            },
            streak: {
                currentDays: 0,
                longestStreak: 0,
            },
            achievements: [],
            scoreHistory: [{
                date: new Date(),
                score: baseScore,
                change: 0,
                reason: 'Initial score',
            }],
            lastUpdated: new Date(),
        };

        this.scores.set(employee.id, score);
        this.updateRankings();

        return score;
    }

    /**
     * Record a security event and update score
     */
    recordEvent(event: SecurityEvent): void {
        this.events.push(event);

        const score = this.scores.get(event.employeeId);
        if (!score) return;

        score.previousScore = score.overallScore;

        // Update relevant component based on event type
        switch (event.type) {
            case 'phishing_click':
                this.updateComponent(score.components.phishingResistance, event.impact);
                score.streak.currentDays = 0;
                score.streak.lastIncidentDate = event.timestamp;
                break;

            case 'phishing_report':
                this.updateComponent(score.components.phishingResistance, event.impact);
                this.updateComponent(score.components.reportingBehavior, event.impact);
                this.checkAchievement(score, 'phish_spotter', event.timestamp);
                break;

            case 'training_complete':
                this.updateComponent(score.components.trainingCompletion, event.impact);
                this.checkAchievement(score, 'first_lesson', event.timestamp);
                break;

            case 'password_change':
                this.updateComponent(score.components.passwordHygiene, event.impact);
                break;

            case 'mfa_enable':
                score.components.mfaCompliance.score = 100;
                score.components.mfaCompliance.trend = 'improving';
                break;

            case 'policy_violation':
            case 'data_leak':
                this.updateComponent(score.components.dataHandling, event.impact);
                score.streak.currentDays = 0;
                score.streak.lastIncidentDate = event.timestamp;
                break;

            case 'suspicious_report':
                this.updateComponent(score.components.reportingBehavior, event.impact);
                break;
        }

        // Recalculate overall score
        this.recalculateScore(score);

        // Check streak achievements
        this.checkStreakAchievements(score, event.timestamp);

        // Add to history
        score.scoreHistory.push({
            date: event.timestamp,
            score: score.overallScore,
            change: score.scoreChange,
            reason: event.details || event.type,
        });

        score.lastUpdated = event.timestamp;
        this.updateRankings();
    }

    /**
     * Get employee score
     */
    getScore(employeeId: string): EmployeeSecurityScore | undefined {
        return this.scores.get(employeeId);
    }

    /**
     * Get leaderboard
     */
    getLeaderboard(options: {
        department?: string;
        limit?: number;
        period?: 'week' | 'month' | 'quarter' | 'all';
    } = {}): Array<{
        rank: number;
        employee: EmployeeSecurityScore;
    }> {
        let employees = Array.from(this.scores.values());

        // Filter by department
        if (options.department) {
            employees = employees.filter(e => e.department === options.department);
        }

        // Sort by score
        employees.sort((a, b) => b.overallScore - a.overallScore);

        // Apply limit
        const limit = options.limit || 10;
        employees = employees.slice(0, limit);

        return employees.map((employee, index) => ({
            rank: index + 1,
            employee,
        }));
    }

    /**
     * Get department statistics
     */
    getDepartmentStats(department: string): {
        averageScore: number;
        totalEmployees: number;
        topPerformer: EmployeeSecurityScore | null;
        lowestRisk: number;
        highestRisk: number;
        completedTraining: number;
        mfaEnabled: number;
    } {
        const employees = Array.from(this.scores.values())
            .filter(e => e.department === department);

        if (employees.length === 0) {
            return {
                averageScore: 0,
                totalEmployees: 0,
                topPerformer: null,
                lowestRisk: 0,
                highestRisk: 0,
                completedTraining: 0,
                mfaEnabled: 0,
            };
        }

        const scores = employees.map(e => e.overallScore);
        const sorted = [...employees].sort((a, b) => b.overallScore - a.overallScore);

        return {
            averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
            totalEmployees: employees.length,
            topPerformer: sorted[0] || null,
            lowestRisk: Math.max(...scores),
            highestRisk: Math.min(...scores),
            completedTraining: employees.filter(e => e.components.trainingCompletion.score >= 100).length,
            mfaEnabled: employees.filter(e => e.components.mfaCompliance.score >= 100).length,
        };
    }

    /**
     * Get company-wide statistics
     */
    getCompanyStats(): {
        averageScore: number;
        totalEmployees: number;
        phishPronePercentage: number;
        trainingCompletionRate: number;
        mfaAdoptionRate: number;
        departmentRankings: Array<{ department: string; averageScore: number }>;
    } {
        const employees = Array.from(this.scores.values());

        if (employees.length === 0) {
            return {
                averageScore: 0,
                totalEmployees: 0,
                phishPronePercentage: 0,
                trainingCompletionRate: 0,
                mfaAdoptionRate: 0,
                departmentRankings: [],
            };
        }

        // Calculate metrics
        const avgScore = employees.reduce((sum, e) => sum + e.overallScore, 0) / employees.length;
        const phishProne = employees.filter(e => e.components.phishingResistance.score < 70).length;
        const trainingComplete = employees.filter(e => e.components.trainingCompletion.score >= 80).length;
        const mfaEnabled = employees.filter(e => e.components.mfaCompliance.score >= 100).length;

        // Department rankings
        const deptMap = new Map<string, number[]>();
        for (const emp of employees) {
            const scores = deptMap.get(emp.department) || [];
            scores.push(emp.overallScore);
            deptMap.set(emp.department, scores);
        }

        const departmentRankings = Array.from(deptMap.entries())
            .map(([department, scores]) => ({
                department,
                averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
            }))
            .sort((a, b) => b.averageScore - a.averageScore);

        return {
            averageScore: Math.round(avgScore),
            totalEmployees: employees.length,
            phishPronePercentage: Math.round((phishProne / employees.length) * 100),
            trainingCompletionRate: Math.round((trainingComplete / employees.length) * 100),
            mfaAdoptionRate: Math.round((mfaEnabled / employees.length) * 100),
            departmentRankings,
        };
    }

    /**
     * Update streak (call daily)
     */
    updateStreaks(): void {
        const today = new Date();

        for (const score of this.scores.values()) {
            if (score.streak.lastIncidentDate) {
                const daysSinceIncident = Math.floor(
                    (today.getTime() - score.streak.lastIncidentDate.getTime()) / (1000 * 60 * 60 * 24)
                );
                score.streak.currentDays = daysSinceIncident;
            } else {
                score.streak.currentDays++;
            }

            if (score.streak.currentDays > score.streak.longestStreak) {
                score.streak.longestStreak = score.streak.currentDays;
            }

            this.checkStreakAchievements(score, today);
        }
    }

    // Private helper methods

    private createComponentScore(score: number, weight: number): ComponentScore {
        return {
            score,
            weight,
            trend: 'stable',
            details: '',
        };
    }

    private updateComponent(component: ComponentScore, change: number): void {
        const previousScore = component.score;
        component.score = Math.max(0, Math.min(100, component.score + change));

        if (component.score > previousScore) {
            component.trend = 'improving';
        } else if (component.score < previousScore) {
            component.trend = 'declining';
        }

        component.lastEvent = new Date();
    }

    private recalculateScore(employee: EmployeeSecurityScore): void {
        let totalScore = 0;

        for (const [key, component] of Object.entries(employee.components)) {
            const weight = COMPONENT_WEIGHTS[key as keyof typeof COMPONENT_WEIGHTS] || 0;
            totalScore += component.score * weight;
        }

        employee.overallScore = Math.round(totalScore);
        employee.scoreChange = employee.overallScore - employee.previousScore;
    }

    private updateRankings(): void {
        const sorted = Array.from(this.scores.values())
            .sort((a, b) => b.overallScore - a.overallScore);

        const total = sorted.length;

        sorted.forEach((score, index) => {
            score.rank = index + 1;
            score.percentile = Math.round(((total - index) / total) * 100);
        });
    }

    private checkAchievement(score: EmployeeSecurityScore, achievementKey: string, timestamp: Date): void {
        const definition = ACHIEVEMENTS[achievementKey];
        if (!definition) return;

        // Check if already earned
        if (score.achievements.some(a => a.name === definition.name)) return;

        const achievement: Achievement = {
            id: crypto.randomUUID(),
            ...definition,
            earnedAt: timestamp,
        };

        score.achievements.push(achievement);
    }

    private checkStreakAchievements(score: EmployeeSecurityScore, timestamp: Date): void {
        if (score.streak.currentDays >= 7) {
            this.checkAchievement(score, 'week_warrior', timestamp);
        }
        if (score.streak.currentDays >= 30) {
            this.checkAchievement(score, 'month_master', timestamp);
        }
        if (score.streak.currentDays >= 365) {
            this.checkAchievement(score, 'year_legend', timestamp);
        }
    }
}

// Export singleton
export const employeeScores = new EmployeeScoreManager();
