/**
 * Sentry Employee Leaderboard
 * Gamified security scores and rankings
 */

'use client';

import { useEffect, useState } from 'react';
import { Trophy, TrendingUp, Award, Target } from 'lucide-react';

interface LeaderboardEntry {
    rank: number;
    employee: {
        employeeId: string;
        name: string;
        department: string;
        overallScore: number;
        percentile: number;
        achievements: Array<{ name: string; icon: string }>;
    };
}

export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock data
        setLeaderboard([
            {
                rank: 1,
                employee: {
                    employeeId: '1',
                    name: 'Alice Johnson',
                    department: 'Engineering',
                    overallScore: 98,
                    percentile: 99,
                    achievements: [{ name: 'Phish Master', icon: '🛡️' }, { name: 'Year Legend', icon: '👑' }],
                },
            },
            {
                rank: 2,
                employee: {
                    employeeId: '2',
                    name: 'Bob Smith',
                    department: 'Finance',
                    overallScore: 95,
                    percentile: 95,
                    achievements: [{ name: 'Month Master', icon: '🌟' }],
                },
            },
            {
                rank: 3,
                employee: {
                    employeeId: '3',
                    name: 'Carol White',
                    department: 'Marketing',
                    overallScore: 92,
                    percentile: 90,
                    achievements: [{ name: 'Phish Hunter', icon: '🏆' }],
                },
            },
        ]);
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
            </div>
        );
    }

    const getRankColor = (rank: number) => {
        if (rank === 1) return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
        if (rank === 2) return 'text-gray-300 border-gray-500/30 bg-gray-500/10';
        if (rank === 3) return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
        return 'text-gray-400 border-gray-700/30 bg-gray-700/10';
    };

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <Trophy className="w-8 h-8 text-rose-500" />
                    <h1 className="text-4xl font-bold">Security Leaderboard</h1>
                </div>

                {/* Top Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-rose-500/10 to-black border border-rose-500/30 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">Top Performer</span>
                            <Trophy className="w-5 h-5 text-rose-400" />
                        </div>
                        <p className="text-2xl font-bold">{leaderboard[0]?.employee.name}</p>
                        <p className="text-4xl font-black text-rose-400">{leaderboard[0]?.employee.overallScore}/100</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500/10 to-black border border-blue-500/30 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">Average Score</span>
                            <Target className="w-5 h-5 text-blue-400" />
                        </div>
                        <p className="text-4xl font-bold text-blue-400">
                            {Math.round(leaderboard.reduce((sum, e) => sum + e.employee.overallScore, 0) / leaderboard.length)}
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500/10 to-black border border-purple-500/30 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">Total Employees</span>
                            <Award className="w-5 h-5 text-purple-400" />
                        </div>
                        <p className="text-4xl font-bold text-purple-400">{leaderboard.length}</p>
                    </div>
                </div>

                {/* Leaderboard */}
                <div className="space-y-4">
                    {leaderboard.map(entry => (
                        <div key={entry.employee.employeeId} className={`border rounded-xl p-6 ${getRankColor(entry.rank)}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="text-center">
                                        <div className="text-5xl font-black">#{entry.rank}</div>
                                        {entry.rank <= 3 && (
                                            <div className="text-2xl">
                                                {entry.rank === 1 && '🥇'}
                                                {entry.rank === 2 && '🥈'}
                                                {entry.rank === 3 && '🥉'}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold mb-1">{entry.employee.name}</h3>
                                        <p className="text-gray-400 mb-2">{entry.employee.department}</p>
                                        <div className="flex gap-2">
                                            {entry.employee.achievements.map((achievement, i) => (
                                                <span key={i} className="text-xl" title={achievement.name}>
                                                    {achievement.icon}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-5xl font-black">{entry.employee.overallScore}</p>
                                    <p className="text-gray-400">Top {entry.employee.percentile}%</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
