'use client'

import { useEffect, useState } from 'react'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import { getSupabaseClient } from '@/lib/supabase/client'
import { Search, Plus, Users, Shield, RotateCcw, UserPlus, ScanFace } from 'lucide-react'
import EmployeeScoreCard from '@/components/sentry/EmployeeScoreCard'
import SecurityLeaderboard from '@/components/sentry/SecurityLeaderboard'
import AddEmployeeForm from '@/components/workspace/sentry/AddEmployeeForm'
import ExportButton from '@/components/shared/ExportButton'
import PhishingScanner from '@/components/sentry/PhishingScanner'

export default function SentryPage() {
    const { workspace } = useWorkspace()
    const supabase = getSupabaseClient()
    const [employees, setEmployees] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showAddForm, setShowAddForm] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [isDemoMode, setIsDemoMode] = useState(false)

    useEffect(() => {
        if (workspace) {
            loadEmployees()
        }
    }, [workspace])

    async function loadEmployees() {
        if (!workspace || isDemoMode) return

        try {
            setIsLoading(true)
            const { data, error } = await supabase
                .from('employees')
                .select('*')
                .eq('workspace_id', workspace.id)
                .order('security_score', { ascending: false })

            if (error) throw error
            setEmployees(data || [])
        } catch (error) {
            console.error('Error loading employees:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const toggleDemoMode = () => {
        if (!isDemoMode) {
            setIsDemoMode(true)
            setEmployees([
                { id: '1', name: 'Alice Johnson', email: 'alice@company.com', department: 'Engineering', security_score: 98, training_completed: 5, phishing_tests_passed: 12, phishing_tests_failed: 0 },
                { id: '2', name: 'Bob Smith', email: 'bob@company.com', department: 'Sales', security_score: 45, training_completed: 1, phishing_tests_passed: 2, phishing_tests_failed: 3 },
                { id: '3', name: 'Carol White', email: 'carol@company.com', department: 'HR', security_score: 88, training_completed: 4, phishing_tests_passed: 10, phishing_tests_failed: 1 },
                { id: '4', name: 'Dave Brown', email: 'dave@company.com', department: 'Marketing', security_score: 62, training_completed: 2, phishing_tests_passed: 5, phishing_tests_failed: 2 },
            ])
        } else {
            setIsDemoMode(false)
            loadEmployees()
        }
    }

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const stats = {
        total: employees.length,
        highRisk: employees.filter(e => e.security_score < 60).length,
        trainingComplete: employees.filter(e => (e.training_completed || 0) >= 3).length,
        avgPhishingPass: employees.length > 0
            ? Math.round(employees.reduce((sum, e) => {
                const passed = e.phishing_tests_passed || 0
                const total = passed + (e.phishing_tests_failed || 0)
                return sum + (total > 0 ? (passed / total) * 100 : 0)
            }, 0) / employees.length)
            : 0,
    }

    if (!workspace) {
        return <div className="text-white">Loading...</div>
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <ScanFace className="w-7 h-7 text-purple-500" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-1">Sentry</h1>
                            <p className="text-slate-400">Employee Security & Phishing Defense</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {workspace && <ExportButton module="sentry" workspaceId={workspace.id} />}
                        <button
                            onClick={toggleDemoMode}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${isDemoMode
                                ? 'bg-amber-500 hover:bg-amber-600 text-black'
                                : 'bg-white/10 hover:bg-white/20 text-white'
                                }`}
                        >
                            {isDemoMode ? (
                                <>
                                    <RotateCcw className="w-5 h-5" />
                                    Clear Demo
                                </>
                            ) : (
                                <>
                                    <Users className="w-5 h-5 text-purple-400" />
                                    Load Demo
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Add Employee
                        </button>
                    </div>
                </div>

                {/* Phishing Scanner Section */}
                <PhishingScanner />

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-slate-900/20 backdrop-blur-md border border-slate-800 rounded-lg p-6">
                        <div className="text-sm text-slate-400 mb-1">Total Employees</div>
                        <div className="text-3xl font-bold text-purple-400">{stats.total}</div>
                    </div>
                    <div className="bg-slate-900/20 backdrop-blur-md border border-slate-800 rounded-lg p-6">
                        <div className="text-sm text-slate-400 mb-1">High Risk</div>
                        <div className="text-3xl font-bold text-red-400">{stats.highRisk}</div>
                    </div>
                    <div className="bg-slate-900/20 backdrop-blur-md border border-slate-800 rounded-lg p-6">
                        <div className="text-sm text-slate-400 mb-1">Training Complete</div>
                        <div className="text-3xl font-bold text-green-400">{stats.trainingComplete}</div>
                    </div>
                    <div className="bg-slate-900/20 backdrop-blur-md border border-slate-800 rounded-lg p-6">
                        <div className="text-sm text-slate-400 mb-1">Avg Phishing Pass</div>
                        <div className="text-3xl font-bold text-blue-400">{stats.avgPhishingPass}%</div>
                    </div>
                </div>

                {/* Leaderboard */}
                <SecurityLeaderboard employees={employees} />

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search employees..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-900/20 backdrop-blur-md border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                </div>

                {/* Employees Grid */}
                {isLoading ? (
                    <div className="text-center py-12 text-slate-400">Loading employees...</div>
                ) : filteredEmployees.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-purple-500" />
                        </div>
                        <p className="text-slate-400 mb-4">
                            {searchQuery ? 'No employees match your search' : 'No employees added yet'}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                            >
                                Add Your First Employee
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEmployees.map((employee) => (
                            <EmployeeScoreCard key={employee.id} employee={employee} />
                        ))}
                    </div>
                )}

                {/* Add Employee Modal */}
                {showAddForm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">Add Employee</h2>
                                <button
                                    onClick={() => setShowAddForm(false)}
                                    className="text-slate-400 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>
                            <AddEmployeeForm
                                workspaceId={workspace.id}
                                onEmployeeAdded={() => {
                                    setShowAddForm(false)
                                    loadEmployees()
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
