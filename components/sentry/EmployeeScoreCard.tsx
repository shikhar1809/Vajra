'use client'

import { Shield, Award, TrendingUp } from 'lucide-react'

interface EmployeeScoreCardProps {
    employee: {
        name: string
        email: string
        department?: string
        security_score: number
        phishing_tests_passed?: number
        phishing_tests_failed?: number
        training_completed?: number
        points?: number
    }
}

export default function EmployeeScoreCard({ employee }: EmployeeScoreCardProps) {
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-400'
        if (score >= 60) return 'text-yellow-400'
        if (score >= 40) return 'text-orange-400'
        return 'text-red-400'
    }

    const getRiskLevel = (score: number) => {
        if (score >= 80) return { label: 'LOW', color: 'bg-green-500/20 text-green-400' }
        if (score >= 60) return { label: 'MEDIUM', color: 'bg-yellow-500/20 text-yellow-400' }
        if (score >= 40) return { label: 'HIGH', color: 'bg-orange-500/20 text-orange-400' }
        return { label: 'CRITICAL', color: 'bg-red-500/20 text-red-400' }
    }

    const risk = getRiskLevel(employee.security_score)
    const passRate = employee.phishing_tests_passed && (employee.phishing_tests_passed + (employee.phishing_tests_failed || 0)) > 0
        ? Math.round((employee.phishing_tests_passed / (employee.phishing_tests_passed + (employee.phishing_tests_failed || 0))) * 100)
        : 0

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition-colors">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">{employee.name}</h3>
                    <p className="text-sm text-slate-400">{employee.email}</p>
                    {employee.department && (
                        <p className="text-xs text-slate-500 mt-1">{employee.department}</p>
                    )}
                </div>
                <div className={`px-3 py-1 rounded-lg ${risk.color}`}>
                    <span className="text-sm font-semibold">{risk.label}</span>
                </div>
            </div>

            {/* Overall Score */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Security Score</span>
                    <span className={`text-2xl font-bold ${getScoreColor(employee.security_score)}`}>
                        {employee.security_score}/100
                    </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full transition-all ${employee.security_score >= 80 ? 'bg-green-500' :
                                employee.security_score >= 60 ? 'bg-yellow-500' :
                                    employee.security_score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                        style={{ width: `${employee.security_score}%` }}
                    />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950/50 rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1">Phishing</div>
                    <div className={`text-lg font-bold ${passRate >= 80 ? 'text-green-400' : 'text-red-400'}`}>
                        {passRate}%
                    </div>
                </div>
                <div className="bg-slate-950/50 rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1">Training</div>
                    <div className="text-lg font-bold text-blue-400">
                        {employee.training_completed || 0}
                    </div>
                </div>
                <div className="bg-slate-950/50 rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1">Points</div>
                    <div className="text-lg font-bold text-purple-400">
                        {employee.points || 0}
                    </div>
                </div>
            </div>
        </div>
    )
}
