'use client'

import { Trophy, Medal, Award } from 'lucide-react'

interface SecurityLeaderboardProps {
    employees: Array<{
        id: string
        name: string
        department?: string
        security_score: number
        points?: number
    }>
}

export default function SecurityLeaderboard({ employees }: SecurityLeaderboardProps) {
    const sortedEmployees = [...employees]
        .sort((a, b) => (b.points || 0) - (a.points || 0))
        .slice(0, 10)

    const getMedalIcon = (index: number) => {
        if (index === 0) return <Trophy className="w-6 h-6 text-yellow-400" />
        if (index === 1) return <Medal className="w-6 h-6 text-slate-300" />
        if (index === 2) return <Medal className="w-6 h-6 text-orange-400" />
        return <Award className="w-5 h-5 text-slate-500" />
    }

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">Security Leaderboard</h3>
                    <p className="text-sm text-slate-400">Top performers this month</p>
                </div>
            </div>

            <div className="space-y-3">
                {sortedEmployees.map((employee, index) => (
                    <div
                        key={employee.id}
                        className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${index < 3 ? 'bg-slate-950/70' : 'bg-slate-950/50'
                            } hover:bg-slate-950`}
                    >
                        <div className="flex items-center justify-center w-10">
                            {getMedalIcon(index)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-white font-semibold truncate">{employee.name}</div>
                            {employee.department && (
                                <div className="text-xs text-slate-500">{employee.department}</div>
                            )}
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-bold text-purple-400">{employee.points || 0}</div>
                            <div className="text-xs text-slate-500">points</div>
                        </div>
                    </div>
                ))}
            </div>

            {sortedEmployees.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                    No employees yet. Add employees to see the leaderboard!
                </div>
            )}
        </div>
    )
}
